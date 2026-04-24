from enum import Enum as PyEnum

from sqlalchemy import Boolean, Column, Enum, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class UserRole(PyEnum):
    admin = "admin"
    student = "student"
    tutor = "tutor"
    undetermined = "undetermined"


class User(BaseModel):
    __tablename__ = "users"

    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_verified = Column(Boolean, default=False)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)

    # Relationships
    profile = relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    batch_instructors = relationship(
        "BatchInstructor",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    batch_communities = relationship(
        "BatchCommunity",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    community_reactions = relationship(
        "CommunityReactions",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    community_comments = relationship(
        "CommunityComment",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    comment_reactions = relationship(
        "CommentReactions",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    feedbacks = relationship(
        "Feedback",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    attendances = relationship(
        "Attendance",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    verification_codes = relationship(
        "VerificationCode",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
