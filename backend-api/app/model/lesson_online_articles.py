from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class LessonOnlineArticles(BaseModel):
    __tablename__ = "lesson_online_articles"

    lesson_id = Column(String(36), ForeignKey("module_lessons.id"), nullable=False)
    title = Column(String(200), nullable=False)
    favicon_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    page_url = Column(String(500), nullable=False)

    # Relationships
    lesson = relationship("ModuleLessons", back_populates="online_articles")
