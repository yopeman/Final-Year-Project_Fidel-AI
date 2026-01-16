from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class ModuleLesson(BaseModel):
    __tablename__ = "module_lesson"

    module_id = Column(String(36), ForeignKey("module.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    display_order = Column(Integer, nullable=False)
    is_completed = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)

    # Relationships
    module = relationship("Module", back_populates="lessons")
    vocabularies = relationship("LessonVocabulary", back_populates="lesson")
    online_articles = relationship("LessonOnlineArticle", back_populates="lesson")
    youtube_videos = relationship("LessonYouTubeVideo", back_populates="lesson")
    interactions = relationship("LessonInteraction", back_populates="lesson")
