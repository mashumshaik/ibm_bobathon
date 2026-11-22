from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.models.models import User, Badge

router = APIRouter()


@router.get("")
def leaderboard(ward_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(User).filter(User.is_verified == True)
    if ward_id:
        q = q.filter(User.ward_id == ward_id)
    users = q.order_by(User.points.desc()).limit(10).all()
    return _format_users(users, db)


@router.get("/global")
def global_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_verified == True).order_by(User.points.desc()).limit(10).all()
    return _format_users(users, db)


def _format_users(users, db):
    return [
        {
            "id": u.id,
            "name": u.name or "Anonymous",
            "ward_name": u.ward.name if u.ward else None,
            "points": u.points or 0,
            "badge_count": len(u.badges),
            "badges": [b.badge_type.value for b in u.badges],
        }
        for u in users
    ]
