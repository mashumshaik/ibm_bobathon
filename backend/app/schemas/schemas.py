from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator
from app.models.models import CategoryEnum, StatusEnum, BadgeTypeEnum


class WardBase(BaseModel):
    id: int
    name: str
    zone: Optional[str] = None
    constituency: Optional[str] = None
    mla_name: Optional[str] = None
    mla_party: Optional[str] = None

    class Config:
        from_attributes = True


class BadgeOut(BaseModel):
    badge_type: BadgeTypeEnum
    awarded_at: datetime

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    name: Optional[str] = None
    ward_id: Optional[int] = None
    points: int = 0
    badges: List[BadgeOut] = []

    class Config:
        from_attributes = True


class IssueCreate(BaseModel):
    title: str
    description: str
    category: CategoryEnum

    @field_validator("title")
    @classmethod
    def title_length(cls, v):
        if not (5 <= len(v) <= 200):
            raise ValueError("Title must be between 5 and 200 characters")
        return v

    @field_validator("description")
    @classmethod
    def description_length(cls, v):
        if not (10 <= len(v) <= 1000):
            raise ValueError("Description must be between 10 and 1000 characters")
        return v


class DuplicateLinkOut(BaseModel):
    id: int
    target_issue_id: int
    similarity_score: float
    method: str

    class Config:
        from_attributes = True


class IssueOut(BaseModel):
    id: int
    title: str
    description: str
    category: CategoryEnum
    ward_id: int
    ward_name: Optional[str] = None
    reporter_name: Optional[str] = None
    status: StatusEnum
    upvote_count: int
    has_duplicates: bool
    created_at: datetime
    duplicates: List[DuplicateLinkOut] = []

    class Config:
        from_attributes = True


class IssueStatusUpdate(BaseModel):
    status: StatusEnum


class LeaderboardUserOut(BaseModel):
    id: int
    name: Optional[str] = None
    ward_name: Optional[str] = None
    points: int
    badge_count: int

    class Config:
        from_attributes = True
