from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class ModuleLessons(BaseModel):
    __tablename__ = "module_lessons"

    module_id = Column(String(36), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    display_order = Column(Integer, nullable=False)
    is_completed = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=True)

    # Relationships
    module = relationship("Modules", back_populates="lessons")
    vocabularies = relationship(
        "LessonVocabularies",
        back_populates="lesson",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    online_articles = relationship(
        "LessonOnlineArticles",
        back_populates="lesson",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    youtube_videos = relationship(
        "LessonYouTubeVideos",
        back_populates="lesson",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    interactions = relationship(
        "LessonInteractions",
        back_populates="lesson",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
