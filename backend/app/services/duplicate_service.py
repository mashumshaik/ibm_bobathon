from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from app.models.models import Issue, DuplicateLink, DuplicateMethodEnum


def detect_and_link(issue_id: int, db: Session):
    """Run duplicate detection for a newly created issue."""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        return

    # Strategy A: Tag match — same ward + category, last 30 days
    cutoff = datetime.utcnow() - timedelta(days=30)
    similar = db.query(Issue).filter(
        Issue.ward_id == issue.ward_id,
        Issue.category == issue.category,
        Issue.id != issue.id,
        Issue.created_at >= cutoff,
    ).all()

    for candidate in similar:
        _upsert_link(db, issue.id, candidate.id, 0.7, DuplicateMethodEnum.TAG_MATCH)

    if similar:
        issue.has_duplicates = True
        for candidate in similar:
            candidate.has_duplicates = True
        db.commit()


def _upsert_link(db: Session, source_id: int, target_id: int, score: float, method):
    exists = db.query(DuplicateLink).filter(
        and_(
            DuplicateLink.source_issue_id == source_id,
            DuplicateLink.target_issue_id == target_id,
        )
    ).first()
    if not exists:
        link = DuplicateLink(
            source_issue_id=source_id,
            target_issue_id=target_id,
            similarity_score=score,
            method=method,
        )
        db.add(link)
        try:
            db.commit()
        except Exception:
            db.rollback()
