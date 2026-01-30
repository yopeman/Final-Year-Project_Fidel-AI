from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.course import Course
from ..model.course_material import CourseMaterial
from ..model.user import User


query = QueryType()
mutation = MutationType()
course_material = ObjectType("CourseMaterial")

@query.field("materials")
def resolve_materials(_, info, courseId=None):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    query_obj = db.query(CourseMaterial).filter(CourseMaterial.is_deleted == False)
    
    # Filter by courseId if provided
    if courseId:
        query_obj = query_obj.filter(CourseMaterial.course_id == courseId)
    
    return query_obj.all()

@query.field("material")
def resolve_material(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    material = db.query(CourseMaterial).filter(
        CourseMaterial.id == id, 
        CourseMaterial.is_deleted == False
    ).first()

    if not material:
        raise Exception("Material not found")
    return material

@mutation.field("addMaterial")
def resolve_add_material(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    
    # Validate that course exists
    course = db.query(Course).filter(
        Course.id == input["courseId"],
        Course.is_deleted == False
    ).first()
    
    if not course:
        raise Exception("Course not found")

    new_material = CourseMaterial(
        course_id=input["courseId"],
        name=input["name"],
        description=input.get("description")
    )

    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material

@mutation.field("changeMaterial")
def resolve_change_material(_, info, id, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    material = db.query(CourseMaterial).filter(
        CourseMaterial.id == id, 
        CourseMaterial.is_deleted == False
    ).first()

    if not material:
        raise Exception("Material not found")

    # Update fields if provided
    if "name" in input and input["name"]:
        material.name = input["name"]
    
    if "description" in input:
        material.description = input["description"]

    material.updated_at = datetime.now()
    db.commit()
    db.refresh(material)
    return material

@mutation.field("deleteMaterial")
def resolve_delete_material(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    material = db.query(CourseMaterial).filter(
        CourseMaterial.id == id, 
        CourseMaterial.is_deleted == False
    ).first()

    if not material:
        raise Exception("Material not found")

    # Mark as deleted
    material.is_deleted = True
    material.deleted_at = datetime.now()
    db.commit()
    db.refresh(material)

    return True

# CourseMaterial field resolvers
@course_material.field("id")
def resolve_id(material, info):
    return material.id

@course_material.field("courseId")
def resolve_course_id(material, info):
    return material.course_id

@course_material.field("name")
def resolve_name(material, info):
    return material.name

@course_material.field("description")
def resolve_description(material, info):
    return material.description

@course_material.field("createdAt")
def resolve_created_at(material, info):
    return material.created_at

@course_material.field("updatedAt")
def resolve_updated_at(material, info):
    return material.updated_at

@course_material.field("isDeleted")
def resolve_is_deleted(material, info):
    return material.is_deleted

@course_material.field("deletedAt")
def resolve_deleted_at(material, info):
    return material.deleted_at

@course_material.field("course")
def resolve_course(material, info):
    db: Session = info.context["db"]
    course = db.query(Course).filter(
        Course.id == material.course_id,
        Course.is_deleted == False
    ).first()
    return course

@course_material.field("files")
def resolve_files(material, info):
    db: Session = info.context["db"]
    files = db.query("material_files").filter(
        "material_files.material_id" == material.id,
        "material_files.is_deleted" == False
    ).all()
    return files