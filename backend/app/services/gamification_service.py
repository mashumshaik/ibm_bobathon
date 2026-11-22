from sqlalchemy.orm import Session
from app.models.models import User, Badge, BadgeTypeEnum

POINT_VALUES = {
    "ISSUE_POSTED": 10,
    "UPVOTE_GIVEN": 1,
    "UPVOTE_RECEIVED": 2,
    "ISSUE_RESOLVED": 50,
    "NON_DUPLICATE": 5,
    "FIRST_WEEKLY_REPORTER": 20,
}

BADGE_THRESHOLDS = {
    BadgeTypeEnum.CIVIC_CHAMPION: ("issues_posted", 10),
    BadgeTypeEnum.COMMUNITY_VOICE: ("upvotes_given", 50),
    BadgeTypeEnum.PROBLEM_SOLVER: ("issues_resolved", 3),
}


def award_points(user_id: int, action: str, db: Session):
    points = POINT_VALUES.get(action, 0)
    if points == 0:
        return
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.points = (user.points or 0) + points
        db.commit()
        check_and_award_badges(user_id, db)


def check_and_award_badges(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return

    issues_posted = len(user.issues)
    issues_resolved = sum(1 for i in user.issues if i.status and i.status.value == "resolved")
    upvotes_given = len(user.votes)

    checks = {
        BadgeTypeEnum.CIVIC_CHAMPION: issues_posted >= 10,
        BadgeTypeEnum.COMMUNITY_VOICE: upvotes_given >= 50,
        BadgeTypeEnum.PROBLEM_SOLVER: issues_resolved >= 3,
    }

    # First reporter badge
    if issues_posted >= 1:
        _maybe_award(user_id, BadgeTypeEnum.FIRST_REPORTER, db)

    for badge_type, earned in checks.items():
        if earned:
            _maybe_award(user_id, badge_type, db)


def _maybe_award(user_id: int, badge_type: BadgeTypeEnum, db: Session):
    exists = db.query(Badge).filter(
        Badge.user_id == user_id,
        Badge.badge_type == badge_type,
    ).first()
    if not exists:
        badge = Badge(user_id=user_id, badge_type=badge_type)
        db.add(badge)
        try:
            db.commit()
        except Exception:
            db.rollback()
