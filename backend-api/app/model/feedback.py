from sqlalchemy import Column, String, Text, Integer
from .base import BaseModel

class Feedback(BaseModel):
    __tablename__ = "feedback"

    user_id = Column(String(36))
    context = Column(String(255))
    content = Column(Text, nullable=False)
    rate = Column(Integer, nullable=False)
