from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class CommunityAttachmentFile(BaseModel):
    __tablename__ = "community_attachment_file"

    community_id = Column(String(36), ForeignKey("batch_community.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_extension = Column(String(10), nullable=False)

    # Relationships
    community = relationship("BatchCommunity", back_populates="attachments")
