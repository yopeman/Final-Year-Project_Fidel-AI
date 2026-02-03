from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.course import Course
from ..model.course_material import CourseMaterial
from ..model.batch_course import BatchCourse
from ..model.user import User


query = QueryType()
mutation = MutationType()
course = ObjectType("Course")

@query.field("courses")
def resolve_courses(_, info):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    return db.query(Course).filter(Course.is_deleted == False).all()

@query.field("course")
def resolve_course(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    course = db.query(Course).filter(
        Course.id == id, 
        Course.is_deleted == False
    ).first()

    if not course:
        raise Exception("Course not found")
    return course

@mutation.field("createCourse")
def resolve_create_course(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    
    new_course = Course(
        name=input["name"],
        description=input.get("description")
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@mutation.field("updateCourse")
def resolve_update_course(_, info, id, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    course = db.query(Course).filter(
        Course.id == id, 
        Course.is_deleted == False
    ).first()

    if not course:
        raise Exception("Course not found")

    # Update fields if provided
    if "name" in input and input["name"]:
        course.name = input["name"]
    
    if "description" in input:
        course.description = input["description"]

    course.updated_at = datetime.now()
    db.commit()
    db.refresh(course)
    return course

@mutation.field("deleteCourse")
def resolve_delete_course(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    course = db.query(Course).filter(
        Course.id == id, 
        Course.is_deleted == False
    ).first()

    if not course:
        raise Exception("Course not found")

    # Mark as deleted
    course.is_deleted = True
    course.deleted_at = datetime.now()
    db.commit()
    db.refresh(course)

    return True

# Course field resolvers
@course.field("id")
def resolve_id(course, info):
    return course.id

@course.field("name")
def resolve_name(course, info):
    return course.name

@course.field("description")
def resolve_description(course, info):
    return course.description

@course.field("createdAt")
def resolve_created_at(course, info):
    return course.created_at

@course.field("updatedAt")
def resolve_updated_at(course, info):
    return course.updated_at

@course.field("isDeleted")
def resolve_is_deleted(course, info):
    return course.is_deleted

@course.field("deletedAt")
def resolve_deleted_at(course, info):
    return course.deleted_at

@course.field("materials")
def resolve_materials(course, info):
    db: Session = info.context["db"]
    materials = db.query(CourseMaterial).filter(
        CourseMaterial.course_id == course.id,
        CourseMaterial.is_deleted == False
    ).all()
    return materials

@course.field("batchCourses")
def resolve_batch_courses(course, info):
    db: Session = info.context["db"]
    batch_courses = db.query(BatchCourse).filter(
        BatchCourse.course_id == course.id,
        BatchCourse.is_deleted == False
    ).all()
    return batch_courses