from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class LessonYouTubeVideo(BaseModel):
    __tablename__ = "lesson_youtube_video"

    lesson_id = Column(String(36), ForeignKey("module_lesson.id"), nullable=False)
    title = Column(String(255), nullable=False)
    thumbnail_URL = Column(String(500))
    description = Column(Text)
    video_URL = Column(String(500), nullable=False)

    # Relationships
    lesson = relationship("ModuleLesson", back_populates="youtube_videos")
