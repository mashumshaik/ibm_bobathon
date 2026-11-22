from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.models.models import Issue, User, DuplicateLink, StatusEnum, CategoryEnum
from app.schemas.schemas import IssueCreate, IssueOut, IssueStatusUpdate
from app.services.auth_service import get_current_user
from app.services import embedding_service, duplicate_service, gamification_service

router = APIRouter()


def _issue_to_dict(issue: Issue, db: Session) -> dict:
    duplicates = db.query(DuplicateLink).filter(DuplicateLink.source_issue_id == issue.id).all()
    return {
        "id": issue.id,
        "title": issue.title,
        "description": issue.description,
        "category": issue.category.value if issue.category else None,
        "ward_id": issue.ward_id,
        "ward_name": issue.ward.name if issue.ward else None,
        "reporter_name": (issue.reporter.name or "").split()[0] if issue.reporter and issue.reporter.name else "Anonymous",
        "status": issue.status.value if issue.status else "open",
        "upvote_count": issue.upvote_count,
        "has_duplicates": issue.has_duplicates,
        "created_at": issue.created_at.isoformat() if issue.created_at else None,
        "duplicates": [
            {
                "id": d.id,
                "target_issue_id": d.target_issue_id,
                "similarity_score": d.similarity_score,
                "method": d.method.value if d.method else None,
            }
            for d in duplicates
        ],
    }


@router.post("")
def create_issue(
    body: IssueCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.ward_id:
        raise HTTPException(status_code=400, detail="Set your ward before posting an issue")

    issue = Issue(
        title=body.title,
        description=body.description,
        category=body.category,
        ward_id=current_user.ward_id,
        reporter_id=current_user.id,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)

    # Background tasks
    background_tasks.add_task(
        embedding_service.generate_and_store,
        issue.id, body.title, body.description, db
    )
    background_tasks.add_task(duplicate_service.detect_and_link, issue.id, db)
    background_tasks.add_task(gamification_service.award_points, current_user.id, "ISSUE_POSTED", db)

    return _issue_to_dict(issue, db)


@router.get("")
def list_issues(
    ward_id: Optional[int] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    sort: str = "recent",
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(Issue)
    if ward_id:
        q = q.filter(Issue.ward_id == ward_id)
    if category:
        q = q.filter(Issue.category == category)
    if status:
        q = q.filter(Issue.status == status)

    if sort == "votes":
        q = q.order_by(Issue.upvote_count.desc())
    elif sort == "trending":
        # Approximate trending with upvote_count / age — use upvote_count desc as proxy
        q = q.order_by(Issue.upvote_count.desc(), Issue.created_at.desc())
    else:
        q = q.order_by(Issue.created_at.desc())

    total = q.count()
    skip = (page - 1) * page_size
    issues = q.offset(skip).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [_issue_to_dict(i, db) for i in issues],
    }


@router.get("/{issue_id}")
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return _issue_to_dict(issue, db)


@router.get("/{issue_id}/duplicates")
def get_duplicates(issue_id: int, db: Session = Depends(get_db)):
    links = db.query(DuplicateLink).filter(DuplicateLink.source_issue_id == issue_id).all()
    return [
        {
            "id": d.id,
            "target_issue_id": d.target_issue_id,
            "similarity_score": d.similarity_score,
            "method": d.method.value if d.method else None,
        }
        for d in links
    ]


@router.patch("/{issue_id}/status")
def update_status(
    issue_id: int,
    body: IssueStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    issue.status = body.status
    db.commit()

    if body.status == StatusEnum.RESOLVED:
        db.refresh(issue)
        gamification_service.award_points(issue.reporter_id, "ISSUE_RESOLVED", db)

    return _issue_to_dict(issue, db)
