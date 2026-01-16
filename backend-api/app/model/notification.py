from sqlalchemy import Column, String, Text, Boolean
from .base import BaseModel

class Notification(BaseModel):
    __tablename__ = "notification"

    user_id = Column(String(36), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
