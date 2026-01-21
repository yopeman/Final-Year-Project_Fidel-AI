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
    profile = relationship("StudentProfile", back_populates="user", uselist=False)
    batch_instructors = relationship("BatchInstructor", back_populates="user")
    batch_communities = relationship("BatchCommunity", back_populates="user")
    community_reactions = relationship("CommunityReactions", back_populates="user")
    community_comments = relationship("CommunityComment", back_populates="user")
    comment_reactions = relationship("CommentReactions", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    attendances = relationship("Attendance", back_populates="user")
    verification_codes = relationship("VerificationCode", back_populates="user")
