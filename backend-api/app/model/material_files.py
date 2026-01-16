from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class MaterialFiles(BaseModel):
    __tablename__ = "material_files"

    material_id = Column(String(36), ForeignKey("course_materials.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_extension = Column(String(10), nullable=False)

    # Relationships
    material = relationship("CourseMaterial", back_populates="files")
