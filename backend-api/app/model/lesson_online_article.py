from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class LessonOnlineArticle(BaseModel):
    __tablename__ = "lesson_online_article"

    lesson_id = Column(String(36), ForeignKey("module_lesson.id"), nullable=False)
    title = Column(String(255), nullable=False)
    favicon_URL = Column(String(500))
    description = Column(Text)
    page_URL = Column(String(500), nullable=False)

    # Relationships
    lesson = relationship("ModuleLesson", back_populates="online_articles")
