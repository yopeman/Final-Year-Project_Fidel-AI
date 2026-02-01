from sqlalchemy import Column, ForeignKey, String, Integer
from sqlalchemy.orm import relationship

from .base import BaseModel


class CommunityAttachmentFiles(BaseModel):
    __tablename__ = "community_attachment_files"

    community_id = Column(
        String(36), ForeignKey("batch_communities.id"), nullable=False
    )
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_extension = Column(String(10), nullable=False)
    file_size = Column(Integer, nullable=False)

    # Relationships
    community = relationship("BatchCommunity", back_populates="attachments")
