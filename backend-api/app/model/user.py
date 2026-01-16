from sqlalchemy import Column, String, Boolean, Enum
from enum import Enum as PyEnum
from .base import BaseModel


class UserRole(PyEnum):
    admin = "admin"
    student = "student"
    tutor = "tutor"
    undetermined = "undetermined"


class User(BaseModel):
    __tablename__ = "users"

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.undetermined)
    is_verified = Column(Boolean, default=False)
    access_token = Column(String(1000), nullable=True)
    refresh_token = Column(String(1000), nullable=True)
