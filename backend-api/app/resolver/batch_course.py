from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.batch_course import BatchCourse
from ..model.course import Course
from ..model.batch import Batch
from ..model.course_schedule import CourseSchedule
from ..model.quiz import Quiz
from ..model.batch_instructor import BatchInstructor


query = QueryType()
mutation = MutationType()
batch_course = ObjectType("BatchCourse")

@query.field("batchCourses")
def resolve_batch_courses(_, info, batchId):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    batch_courses = db.query(BatchCourse).filter(
        BatchCourse.batch_id == batchId,
        BatchCourse.is_deleted == False
    ).all()
    return batch_courses


@query.field("batchCourse")
def resolve_batch_course(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    batch_course_obj = db.query(BatchCourse).filter(
        BatchCourse.id == id,
        BatchCourse.is_deleted == False
    ).first()

    if not batch_course_obj:
        raise Exception("BatchCourse not found")
    return batch_course_obj


@mutation.field("createBatchCourse")
def resolve_create_batch_course(_, info, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]

    # Validate that batch exists
    batch_obj = db.query(Batch).filter(
        Batch.id == input["batchId"],
        Batch.is_deleted == False
    ).first()
    
    if not batch_obj:
        raise Exception("Batch not found")

    # Validate that course exists
    course_obj = db.query(Course).filter(
        Course.id == input["courseId"],
        Course.is_deleted == False
    ).first()
    
    if not course_obj:
        raise Exception("Course not found")

    # Check if this batch-course combination already exists
    existing = db.query(BatchCourse).filter(
        BatchCourse.batch_id == input["batchId"],
        BatchCourse.course_id == input["courseId"],
        BatchCourse.is_deleted == False
    ).first()

    if existing:
        raise Exception("This batch-course combination already exists")

    # Create new batch course
    new_batch_course = BatchCourse(
        batch_id=input["batchId"],
        course_id=input["courseId"]
    )

    db.add(new_batch_course)
    db.commit()
    db.refresh(new_batch_course)
    return new_batch_course


@mutation.field("updateBatchCourse")
def resolve_update_batch_course(_, info, id, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    batch_course_obj = db.query(BatchCourse).filter(
        BatchCourse.id == id,
        BatchCourse.is_deleted == False
    ).first()

    if not batch_course_obj:
        raise Exception("BatchCourse not found")

    # Update fields if provided
    if "batchId" in input and input["batchId"]:
        # Validate that new batch exists
        batch_obj = db.query(Batch).filter(
            Batch.id == input["batchId"],
            Batch.is_deleted == False
        ).first()
        
        if not batch_obj:
            raise Exception("Batch not found")
        
        batch_course_obj.batch_id = input["batchId"]
    
    if "courseId" in input and input["courseId"]:
        # Validate that new course exists
        course_obj = db.query(Course).filter(
            Course.id == input["courseId"],
            Course.is_deleted == False
        ).first()
        
        if not course_obj:
            raise Exception("Course not found")
        
        batch_course_obj.course_id = input["courseId"]

    db.commit()
    db.refresh(batch_course_obj)
    return batch_course_obj


@mutation.field("deleteBatchCourse")
def resolve_delete_batch_course(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    batch_course_obj = db.query(BatchCourse).filter(
        BatchCourse.id == id,
        BatchCourse.is_deleted == False
    ).first()

    if not batch_course_obj:
        raise Exception("BatchCourse not found")

    # Check if batch course has associated schedules, quizzes, or instructors
    associated_schedules = db.query(CourseSchedule).filter(
        CourseSchedule.batch_course_id == id,
        CourseSchedule.is_deleted == False
    ).count()

    associated_quizzes = db.query(Quiz).filter(
        Quiz.batch_course_id == id,
        Quiz.is_deleted == False
    ).count()

    associated_instructors = db.query(BatchInstructor).filter(
        BatchInstructor.batch_course_id == id,
        BatchInstructor.is_deleted == False
    ).count()

    if associated_schedules > 0 or associated_quizzes > 0 or associated_instructors > 0:
        raise Exception("Cannot delete batch course with associated schedules, quizzes, or instructors. Please remove them first.")

    # Mark as deleted
    batch_course_obj.is_deleted = True
    batch_course_obj.deleted_at = datetime.now()
    db.commit()
    db.refresh(batch_course_obj)

    return True


# BatchCourse field resolvers
@batch_course.field("id")
def resolve_id(batch_course_obj, info):
    return batch_course_obj.id


@batch_course.field("batchId")
def resolve_batch_id(batch_course_obj, info):
    return batch_course_obj.batch_id


@batch_course.field("courseId")
def resolve_course_id(batch_course_obj, info):
    return batch_course_obj.course_id


@batch_course.field("createdAt")
def resolve_created_at(batch_course_obj, info):
    return batch_course_obj.created_at


@batch_course.field("updatedAt")
def resolve_updated_at(batch_course_obj, info):
    return batch_course_obj.updated_at


@batch_course.field("isDeleted")
def resolve_is_deleted(batch_course_obj, info):
    return batch_course_obj.is_deleted


@batch_course.field("deletedAt")
def resolve_deleted_at(batch_course_obj, info):
    return batch_course_obj.deleted_at


@batch_course.field("batch")
def resolve_batch(batch_course_obj, info):
    db: Session = info.context["db"]
    batch_obj = db.query(Batch).filter(
        Batch.id == batch_course_obj.batch_id,
        # Batch.is_deleted == False
    ).first()
    return batch_obj


@batch_course.field("course")
def resolve_course(batch_course_obj, info):
    db: Session = info.context["db"]
    course_obj = db.query(Course).filter(
        Course.id == batch_course_obj.course_id,
        Course.is_deleted == False
    ).first()
    return course_obj


@batch_course.field("schedules")
def resolve_schedules(batch_course_obj, info):
    db: Session = info.context["db"]
    schedules = db.query(CourseSchedule).filter(
        CourseSchedule.batch_course_id == batch_course_obj.id,
        CourseSchedule.is_deleted == False
    ).all()
    return schedules


@batch_course.field("quizzes")
def resolve_quizzes(batch_course_obj, info):
    db: Session = info.context["db"]
    quizzes = db.query(Quiz).filter(
        Quiz.batch_course_id == batch_course_obj.id,
        Quiz.is_deleted == False
    ).all()
    return quizzes


@batch_course.field("instructors")
def resolve_instructors(batch_course_obj, info):
    db: Session = info.context["db"]
    instructors = db.query(BatchInstructor).filter(
        BatchInstructor.batch_course_id == batch_course_obj.id,
        BatchInstructor.is_deleted == False
    ).all()
    return instructors