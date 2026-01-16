from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.config.database import Base
import uuid


class BaseModel(Base):
    __abstract__ = True

    id = Column(String(36), primary_key=True, default=uuid.uuid4)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
