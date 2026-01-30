from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.batch_instructor import BatchInstructor, InstructorRole
from ..model.user import User
from ..model.batch_course import BatchCourse


query = QueryType()
mutation = MutationType()
batch_instructor = ObjectType("BatchInstructor")

@query.field("instructors")
def resolve_batch_instructors(_, info, batchId=None):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # If batchId is provided, filter by batch
    if batchId:
        # Get all batch courses for this batch
        batch_courses = db.query(BatchCourse).filter(
            BatchCourse.batch_id == batchId,
            BatchCourse.is_deleted == False
        ).all()
        
        batch_course_ids = [bc.id for bc in batch_courses]
        
        batch_instructors = db.query(BatchInstructor).filter(
            BatchInstructor.batch_course_id.in_(batch_course_ids),
            BatchInstructor.is_deleted == False
        ).all()
    else:
        # Return all batch instructors
        batch_instructors = db.query(BatchInstructor).filter(
            BatchInstructor.is_deleted == False
        ).all()
    
    return batch_instructors


@query.field("instructor")
def resolve_batch_instructor(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    batch_instructor_obj = db.query(BatchInstructor).filter(
        BatchInstructor.id == id,
        BatchInstructor.is_deleted == False
    ).first()

    if not batch_instructor_obj:
        raise Exception("BatchInstructor not found")
    return batch_instructor_obj


@mutation.field("createInstructor")
def resolve_create_batch_instructor(_, info, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]

    # Validate that user exists and is a tutor
    user_obj = db.query(User).filter(
        User.id == input["userId"],
        User.is_deleted == False
    ).first()
    
    if not user_obj:
        raise Exception("User not found")
    
    if user_obj.role.value != "tutor":
        raise Exception("User must be a tutor to be assigned as instructor")

    # Validate that batch course exists
    batch_course_obj = db.query(BatchCourse).filter(
        BatchCourse.id == input["batchCourseId"],
        BatchCourse.is_deleted == False
    ).first()
    
    if not batch_course_obj:
        raise Exception("BatchCourse not found")

    # Check if this user is already assigned to this batch course
    existing = db.query(BatchInstructor).filter(
        BatchInstructor.user_id == input["userId"],
        BatchInstructor.batch_course_id == input["batchCourseId"],
        BatchInstructor.is_deleted == False
    ).first()

    if existing:
        raise Exception("This user is already assigned as an instructor for this batch course")

    # Check if there's already a main instructor for this batch course
    if input["role"] == "main":
        existing_main = db.query(BatchInstructor).filter(
            BatchInstructor.batch_course_id == input["batchCourseId"],
            BatchInstructor.role == InstructorRole.main,
            BatchInstructor.is_deleted == False
        ).first()
        
        if existing_main:
            raise Exception("This batch course already has a main instructor")

    # Create new batch instructor
    new_batch_instructor = BatchInstructor(
        user_id=input["userId"],
        batch_course_id=input["batchCourseId"],
        role=input["role"]
    )

    db.add(new_batch_instructor)
    db.commit()
    db.refresh(new_batch_instructor)
    return new_batch_instructor


@mutation.field("updateInstructor")
def resolve_update_batch_instructor(_, info, id, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    batch_instructor_obj = db.query(BatchInstructor).filter(
        BatchInstructor.id == id,
        BatchInstructor.is_deleted == False
    ).first()

    if not batch_instructor_obj:
        raise Exception("BatchInstructor not found")

    # Update fields if provided
    if "userId" in input and input["userId"]:
        # Validate that new user exists and is a tutor
        user_obj = db.query(User).filter(
            User.id == input["userId"],
            User.is_deleted == False
        ).first()
        
        if not user_obj:
            raise Exception("User not found")
        
        if user_obj.role.value != "tutor":
            raise Exception("User must be a tutor to be assigned as instructor")
        
        batch_instructor_obj.user_id = input["userId"]
    
    if "batchCourseId" in input and input["batchCourseId"]:
        # Validate that new batch course exists
        batch_course_obj = db.query(BatchCourse).filter(
            BatchCourse.id == input["batchCourseId"],
            BatchCourse.is_deleted == False
        ).first()
        
        if not batch_course_obj:
            raise Exception("BatchCourse not found")
        
        batch_instructor_obj.batch_course_id = input["batchCourseId"]

    if "role" in input and input["role"]:
        # Check if changing to main instructor and if there's already a main instructor
        if input["role"] == "main":
            existing_main = db.query(BatchInstructor).filter(
                BatchInstructor.batch_course_id == batch_instructor_obj.batch_course_id,
                BatchInstructor.role == InstructorRole.main,
                BatchInstructor.id != id,  # Exclude current instructor
                BatchInstructor.is_deleted == False
            ).first()
            
            if existing_main:
                raise Exception("This batch course already has a main instructor")
        
        batch_instructor_obj.role = input["role"]

    db.commit()
    db.refresh(batch_instructor_obj)
    return batch_instructor_obj


@mutation.field("deleteInstructor")
def resolve_delete_batch_instructor(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    batch_instructor_obj = db.query(BatchInstructor).filter(
        BatchInstructor.id == id,
        BatchInstructor.is_deleted == False
    ).first()

    if not batch_instructor_obj:
        raise Exception("BatchInstructor not found")

    # Mark as deleted
    batch_instructor_obj.is_deleted = True
    batch_instructor_obj.deleted_at = datetime.now()
    db.commit()
    db.refresh(batch_instructor_obj)

    return True


# BatchInstructor field resolvers
@batch_instructor.field("id")
def resolve_id(batch_instructor_obj, info):
    return batch_instructor_obj.id


@batch_instructor.field("userId")
def resolve_user_id(batch_instructor_obj, info):
    return batch_instructor_obj.user_id


@batch_instructor.field("batchCourseId")
def resolve_batch_course_id(batch_instructor_obj, info):
    return batch_instructor_obj.batch_course_id


@batch_instructor.field("role")
def resolve_role(batch_instructor_obj, info):
    return str(batch_instructor_obj.role.value).upper()


@batch_instructor.field("createdAt")
def resolve_created_at(batch_instructor_obj, info):
    return batch_instructor_obj.created_at


@batch_instructor.field("updatedAt")
def resolve_updated_at(batch_instructor_obj, info):
    return batch_instructor_obj.updated_at


@batch_instructor.field("isDeleted")
def resolve_is_deleted(batch_instructor_obj, info):
    return batch_instructor_obj.is_deleted


@batch_instructor.field("deletedAt")
def resolve_deleted_at(batch_instructor_obj, info):
    return batch_instructor_obj.deleted_at


@batch_instructor.field("user")
def resolve_user(batch_instructor_obj, info):
    db: Session = info.context["db"]
    user_obj = db.query(User).filter(
        User.id == batch_instructor_obj.user_id,
        User.is_deleted == False
    ).first()
    return user_obj


@batch_instructor.field("batchCourse")
def resolve_batch_course(batch_instructor_obj, info):
    db: Session = info.context["db"]
    batch_course_obj = db.query(BatchCourse).filter(
        BatchCourse.id == batch_instructor_obj.batch_course_id,
        BatchCourse.is_deleted == False
    ).first()
    return batch_course_obj