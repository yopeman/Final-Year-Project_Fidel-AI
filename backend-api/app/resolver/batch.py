from datetime import datetime, date
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.batch import Batch, BatchLevel, BatchStatus
from ..model.batch_course import BatchCourse
from ..model.batch_enrollment import BatchEnrollment
from ..model.batch_community import BatchCommunity
from ..model.batch_instructor import BatchInstructor


query = QueryType()
mutation = MutationType()
batch = ObjectType("Batch")

# Batch level mapping
def map_batch_level(level_str: str) -> BatchLevel:
    level_map = {
        "BEGINNER": BatchLevel.beginner,
        "BASIC": BatchLevel.basic,
        "INTERMEDIATE": BatchLevel.intermediate,
        "ADVANCED": BatchLevel.advanced,
    }
    return level_map.get(level_str.upper(), BatchLevel.beginner)

# Batch status mapping
def map_batch_status(status_str: str) -> BatchStatus:
    status_map = {
        "UPCOMING": BatchStatus.upcoming,
        "ACTIVE": BatchStatus.active,
        "COMPLETED": BatchStatus.completed,
        "CANCELLED": BatchStatus.cancelled,
    }
    return status_map.get(status_str.upper(), BatchStatus.upcoming)


@query.field("batches")
def resolve_batches(_, info, pagination=None):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    query_obj = db.query(Batch).filter(Batch.is_deleted == False)
    
    if pagination:
        page = pagination.get("page", 1)
        limit = pagination.get("limit", 10)
        offset = (page - 1) * limit
        query_obj = query_obj.offset(offset).limit(limit)
    
    return query_obj.all()


@query.field("batch")
def resolve_batch(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    batch_obj = db.query(Batch).filter(Batch.id == id, Batch.is_deleted == False).first()

    if not batch_obj:
        raise Exception("Batch not found")
    return batch_obj


@mutation.field("createBatch")
def resolve_create_batch(_, info, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]

    # Validate input
    if input["maxStudents"] <= 0:
        raise Exception("Max students must be greater than 0")
    
    if input["feeAmount"] < 0:
        raise Exception("Fee amount cannot be negative")

    # Create new batch
    new_batch = Batch(
        name=input["name"],
        description=input.get("description"),
        level=map_batch_level(input["level"]),
        language=input["language"],
        start_date=input["startDate"],
        end_date=input.get("endDate"),
        max_students=input["maxStudents"],
        status=BatchStatus.upcoming,  # Default to upcoming
        fee_amount=input["feeAmount"]
    )

    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch


@mutation.field("updateBatch")
def resolve_update_batch(_, info, id, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    batch_obj = db.query(Batch).filter(Batch.id == id, Batch.is_deleted == False).first()

    if not batch_obj:
        raise Exception("Batch not found")

    # Update fields if provided
    if "name" in input and input["name"]:
        batch_obj.name = input["name"]
    
    if "description" in input:
        batch_obj.description = input["description"]
    
    if "level" in input and input["level"]:
        batch_obj.level = map_batch_level(input["level"])
    
    if "language" in input and input["language"]:
        batch_obj.language = input["language"]
    
    if "startDate" in input and input["startDate"]:
        batch_obj.start_date = input["startDate"]
    
    if "endDate" in input:
        batch_obj.end_date = input["endDate"]
    
    if "maxStudents" in input and input["maxStudents"] is not None:
        if input["maxStudents"] <= 0:
            raise Exception("Max students must be greater than 0")
        batch_obj.max_students = input["maxStudents"]
    
    if "feeAmount" in input and input["feeAmount"] is not None:
        if input["feeAmount"] < 0:
            raise Exception("Fee amount cannot be negative")
        batch_obj.fee_amount = input["feeAmount"]
    
    if "status" in input and input["status"]:
        batch_obj.status = map_batch_status(input["status"])

    db.commit()
    db.refresh(batch_obj)
    return batch_obj


@mutation.field("deleteBatch")
def resolve_delete_batch(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    batch_obj = db.query(Batch).filter(Batch.id == id, Batch.is_deleted == False).first()

    if not batch_obj:
        raise Exception("Batch not found")

    # Check if batch has active enrollments
    # active_enrollments = db.query(BatchEnrollment).filter(
    #     BatchEnrollment.batch_id == id,
    #     BatchEnrollment.status.in_(['enrolled', 'applied']),
    #     BatchEnrollment.is_deleted == False
    # ).count()

    # if active_enrollments > 0:
    #     raise Exception("Cannot delete batch with active enrollments. Please cancel enrollments first.")

    # Mark as deleted
    batch_obj.is_deleted = True
    batch_obj.deleted_at = datetime.now()
    db.commit()
    db.refresh(batch_obj)

    return True


# Batch field resolvers
@batch.field("id")
def resolve_id(batch_obj, info):
    return batch_obj.id


@batch.field("name")
def resolve_name(batch_obj, info):
    return batch_obj.name


@batch.field("description")
def resolve_description(batch_obj, info):
    return batch_obj.description


@batch.field("level")
def resolve_level(batch_obj, info):
    return batch_obj.level.value.upper()


@batch.field("language")
def resolve_language(batch_obj, info):
    return batch_obj.language


@batch.field("startDate")
def resolve_start_date(batch_obj, info):
    return batch_obj.start_date


@batch.field("endDate")
def resolve_end_date(batch_obj, info):
    return batch_obj.end_date


@batch.field("maxStudents")
def resolve_max_students(batch_obj, info):
    return batch_obj.max_students


@batch.field("status")
def resolve_status(batch_obj, info):
    return batch_obj.status.value.upper()


@batch.field("feeAmount")
def resolve_fee_amount(batch_obj, info):
    return batch_obj.fee_amount


@batch.field("createdAt")
def resolve_created_at(batch_obj, info):
    return batch_obj.created_at


@batch.field("updatedAt")
def resolve_updated_at(batch_obj, info):
    return batch_obj.updated_at


@batch.field("isDeleted")
def resolve_is_deleted(batch_obj, info):
    return batch_obj.is_deleted


@batch.field("deletedAt")
def resolve_deleted_at(batch_obj, info):
    return batch_obj.deleted_at


@batch.field("batchCourses")
def resolve_batch_courses(batch_obj, info):
    db: Session = info.context["db"]
    batch_courses = db.query(BatchCourse).filter(
        BatchCourse.batch_id == batch_obj.id,
        BatchCourse.is_deleted == False
    ).all()
    return batch_courses


@batch.field("enrollments")
def resolve_enrollments(batch_obj, info):
    db: Session = info.context["db"]
    enrollments = db.query(BatchEnrollment).filter(
        BatchEnrollment.batch_id == batch_obj.id,
        BatchEnrollment.is_deleted == False
    ).all()
    return enrollments


@batch.field("communities")
def resolve_communities(batch_obj, info):
    db: Session = info.context["db"]
    communities = db.query(BatchCommunity).filter(
        BatchCommunity.batch_id == batch_obj.id,
        BatchCommunity.is_deleted == False
    ).all()
    return communities


@batch.field("instructors")
def resolve_instructors(batch_obj, info):
    db: Session = info.context["db"]
    instructors = db.query(BatchInstructor).filter(
        BatchInstructor.batch_course.has(batch_id=batch_obj.id),
        BatchInstructor.is_deleted == False
    ).all()
    return instructors
