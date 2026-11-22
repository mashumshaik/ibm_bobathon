from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.database import get_db
from app.models.models import Vote, Issue, User
from app.services.auth_service import get_current_user
from app.services import gamification_service

router = APIRouter()


@router.post("/{issue_id}/vote")
def cast_vote(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if issue.reporter_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot vote on your own issue")

    vote = Vote(user_id=current_user.id, issue_id=issue_id)
    db.add(vote)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Already voted")

    issue.upvote_count = (issue.upvote_count or 0) + 1
    db.commit()

    gamification_service.award_points(current_user.id, "UPVOTE_GIVEN", db)
    gamification_service.award_points(issue.reporter_id, "UPVOTE_RECEIVED", db)

    return {"upvote_count": issue.upvote_count, "voted": True}


@router.delete("/{issue_id}/vote")
def remove_vote(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.issue_id == issue_id,
    ).first()
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")

    db.delete(vote)
    db.commit()

    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if issue:
        issue.upvote_count = max(0, (issue.upvote_count or 1) - 1)
        db.commit()

    return {"upvote_count": issue.upvote_count if issue else 0, "voted": False}
