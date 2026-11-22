from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Ward, Issue, StatusEnum

router = APIRouter()


@router.get("")
def list_wards(db: Session = Depends(get_db)):
    wards = db.query(Ward).order_by(Ward.name).all()
    return [
        {
            "id": w.id,
            "name": w.name,
            "zone": w.zone,
            "constituency": w.constituency,
            "mla_name": w.mla_name,
            "mla_party": w.mla_party,
        }
        for w in wards
    ]


@router.get("/{ward_id}")
def get_ward(ward_id: int, db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
    return {
        "id": ward.id,
        "name": ward.name,
        "zone": ward.zone,
        "constituency": ward.constituency,
        "mla_name": ward.mla_name,
        "mla_party": ward.mla_party,
        "mla_contact": ward.mla_contact,
    }


@router.get("/{ward_id}/priority-feed")
def ward_priority_feed(ward_id: int, db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")

    issues = (
        db.query(Issue)
        .filter(Issue.ward_id == ward_id, Issue.status == StatusEnum.OPEN)
        .order_by(Issue.upvote_count.desc())
        .all()
    )

    return {
        "ward": {
            "id": ward.id,
            "name": ward.name,
            "mla_name": ward.mla_name,
            "mla_party": ward.mla_party,
            "constituency": ward.constituency,
        },
        "issues": [
            {
                "id": i.id,
                "title": i.title,
                "category": i.category.value if i.category else None,
                "upvote_count": i.upvote_count,
                "has_duplicates": i.has_duplicates,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in issues
        ],
    }


@router.get("/{ward_id}/stats")
def ward_stats(ward_id: int, db: Session = Depends(get_db)):
    total_open = db.query(Issue).filter(Issue.ward_id == ward_id, Issue.status == StatusEnum.OPEN).count()
    total_in_progress = db.query(Issue).filter(Issue.ward_id == ward_id, Issue.status == StatusEnum.IN_PROGRESS).count()
    total_resolved = db.query(Issue).filter(Issue.ward_id == ward_id, Issue.status == StatusEnum.RESOLVED).count()
    top3 = (
        db.query(Issue)
        .filter(Issue.ward_id == ward_id)
        .order_by(Issue.upvote_count.desc())
        .limit(3)
        .all()
    )
    return {
        "total_open": total_open,
        "total_in_progress": total_in_progress,
        "total_resolved": total_resolved,
        "top_issues": [{"id": i.id, "title": i.title, "upvote_count": i.upvote_count} for i in top3],
    }
