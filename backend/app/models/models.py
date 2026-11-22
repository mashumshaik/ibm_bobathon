import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, UniqueConstraint, Enum, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

try:
    from pgvector.sqlalchemy import Vector
    HAS_PGVECTOR = True
except ImportError:
    HAS_PGVECTOR = False


class CategoryEnum(str, enum.Enum):
    ROADS = "ROADS"
    WATER = "WATER"
    ELECTRICITY = "ELECTRICITY"
    GARBAGE = "GARBAGE"
    PARKS = "PARKS"
    SAFETY = "SAFETY"
    DRAINAGE = "DRAINAGE"
    OTHER = "OTHER"


class StatusEnum(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class DuplicateMethodEnum(str, enum.Enum):
    TAG_MATCH = "tag_match"
    SEMANTIC = "semantic"


class BadgeTypeEnum(str, enum.Enum):
    FIRST_REPORTER = "FIRST_REPORTER"
    CIVIC_CHAMPION = "CIVIC_CHAMPION"
    COMMUNITY_VOICE = "COMMUNITY_VOICE"
    PROBLEM_SOLVER = "PROBLEM_SOLVER"
    WARD_HERO = "WARD_HERO"


class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    zone = Column(String(100))
    constituency = Column(String(200))
    mla_name = Column(String(200))
    mla_party = Column(String(200))
    mla_contact = Column(String(100))

    users = relationship("User", back_populates="ward")
    issues = relationship("Issue", back_populates="ward")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), unique=True, nullable=False)
    name = Column(String(200))
    ward_id = Column(Integer, ForeignKey("wards.id"))
    points = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    ward = relationship("Ward", back_populates="users")
    issues = relationship("Issue", back_populates="reporter")
    votes = relationship("Vote", back_populates="user")
    badges = relationship("Badge", back_populates="user")


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(CategoryEnum), nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.OPEN)
    upvote_count = Column(Integer, default=0)
    has_duplicates = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ward = relationship("Ward", back_populates="issues")
    reporter = relationship("User", back_populates="issues")
    votes = relationship("Vote", back_populates="issue")
    duplicate_sources = relationship("DuplicateLink", foreign_keys="DuplicateLink.source_issue_id", back_populates="source_issue")
    duplicate_targets = relationship("DuplicateLink", foreign_keys="DuplicateLink.target_issue_id", back_populates="target_issue")


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("user_id", "issue_id", name="uq_user_issue_vote"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="votes")
    issue = relationship("Issue", back_populates="votes")


class DuplicateLink(Base):
    __tablename__ = "duplicate_links"

    id = Column(Integer, primary_key=True, index=True)
    source_issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    target_issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    similarity_score = Column(Float, default=0.7)
    method = Column(Enum(DuplicateMethodEnum), default=DuplicateMethodEnum.TAG_MATCH)

    source_issue = relationship("Issue", foreign_keys=[source_issue_id], back_populates="duplicate_sources")
    target_issue = relationship("Issue", foreign_keys=[target_issue_id], back_populates="duplicate_targets")


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_type = Column(Enum(BadgeTypeEnum), nullable=False)
    awarded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="badges")
