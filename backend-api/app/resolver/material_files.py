from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.course_material import CourseMaterial
from ..model.material_files import MaterialFiles
from ..model.user import User


query = QueryType()
mutation = MutationType()
material_files = ObjectType("MaterialFiles")

@query.field("materialFiles")
def resolve_material_files(_, info, materialId):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    files = db.query(MaterialFiles).filter(
        MaterialFiles.material_id == materialId,
        MaterialFiles.is_deleted == False
    ).all()
    
    return files

@query.field("materialFile")
def resolve_material_file(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    file = db.query(MaterialFiles).filter(
        MaterialFiles.id == id, 
        MaterialFiles.is_deleted == False
    ).first()

    if not file:
        raise Exception("Material file not found")
    return file

@mutation.field("uploadMaterialFile")
def resolve_upload_material_file(_, info, materialId, file):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    
    # Validate that material exists
    material = db.query(CourseMaterial).filter(
        CourseMaterial.id == materialId,
        CourseMaterial.is_deleted == False
    ).first()
    
    if not material:
        raise Exception("Course material not found")

    # Process uploaded file
    file_content = file["file"]
    file_name = file["filename"]
    file_size = len(file_content.read())
    file_content.seek(0)  # Reset file pointer
    
    # Generate file path (you might want to implement proper file storage)
    file_extension = file_name.split(".")[-1] if "." in file_name else ""
    file_path = f"static/materials/{materialId}/{file_name}"

    # Save file to storage (implement your file storage logic here)
    # For now, we'll just create the database record
    new_file = MaterialFiles(
        material_id=materialId,
        file_name=file_name,
        file_path=file_path,
        file_extension=file_extension,
        file_size=file_size
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    return new_file

@mutation.field("deleteMaterialFile")
def resolve_delete_material_file(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    file = db.query(MaterialFiles).filter(
        MaterialFiles.id == id, 
        MaterialFiles.is_deleted == False
    ).first()

    if not file:
        raise Exception("Material file not found")

    # Mark as deleted
    file.is_deleted = True
    file.deleted_at = datetime.now()
    db.commit()
    db.refresh(file)

    return True

# MaterialFiles field resolvers
@material_files.field("id")
def resolve_id(file, info):
    return file.id

@material_files.field("materialId")
def resolve_material_id(file, info):
    return file.material_id

@material_files.field("fileName")
def resolve_file_name(file, info):
    return file.file_name

@material_files.field("filePath")
def resolve_file_path(file, info):
    return file.file_path

@material_files.field("fileExtension")
def resolve_file_extension(file, info):
    return file.file_extension

@material_files.field("fileSize")
def resolve_file_size(file, info):
    return file.file_size

@material_files.field("createdAt")
def resolve_created_at(file, info):
    return file.created_at

@material_files.field("updatedAt")
def resolve_updated_at(file, info):
    return file.updated_at

@material_files.field("isDeleted")
def resolve_is_deleted(file, info):
    return file.is_deleted

@material_files.field("deletedAt")
def resolve_deleted_at(file, info):
    return file.deleted_at

@material_files.field("material")
def resolve_material(file, info):
    db: Session = info.context["db"]
    material = db.query(CourseMaterial).filter(
        CourseMaterial.id == file.material_id,
        CourseMaterial.is_deleted == False
    ).first()
    return material