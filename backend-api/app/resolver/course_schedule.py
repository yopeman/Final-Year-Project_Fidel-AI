from typing import Optional
from datetime import datetime
from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.course_schedule import CourseSchedule
from ..model.schedule import Schedule
from ..model.batch_course import BatchCourse
from ..model.attendance import Attendance

query = QueryType()
mutation = MutationType()
course_schedule = ObjectType("CourseSchedule")

@query.field("courseSchedules")
def resolve_course_schedules(_, info, batchCourseId: Optional[str] = None):
    db: Session = info.context["db"]
    query_obj = db.query(CourseSchedule).filter(CourseSchedule.is_deleted == False)
    
    if batchCourseId:
        query_obj = query_obj.filter(CourseSchedule.batch_course_id == batchCourseId)
    
    return query_obj.all()

@query.field("courseSchedule")
def resolve_course_schedule(_, info, id: str):
    db: Session = info.context["db"]
    course_schedule = db.query(CourseSchedule).filter(
        CourseSchedule.id == id, 
        CourseSchedule.is_deleted == False
    ).first()
    if not course_schedule:
        raise Exception("CourseSchedule not found")
    return course_schedule

@mutation.field("createCourseSchedule")
def resolve_create_course_schedule(_, info, input):
    db: Session = info.context["db"]
    
    course_schedule = CourseSchedule(
        schedule_id=input["scheduleId"],
        batch_course_id=input["batchCourseId"]
    )
    
    db.add(course_schedule)
    db.commit()
    db.refresh(course_schedule)
    return course_schedule

@mutation.field("updateCourseSchedule")
def resolve_update_course_schedule(_, info, id: str, input):
    db: Session = info.context["db"]
    course_schedule = db.query(CourseSchedule).filter(
        CourseSchedule.id == id, 
        CourseSchedule.is_deleted == False
    ).first()
    
    if not course_schedule:
        raise Exception("CourseSchedule not found")
    
    if "scheduleId" in input:
        course_schedule.schedule_id = input["scheduleId"]
    if "batchCourseId" in input:
        course_schedule.batch_course_id = input["batchCourseId"]
    
    db.commit()
    db.refresh(course_schedule)
    return course_schedule

@mutation.field("deleteCourseSchedule")
def resolve_delete_course_schedule(_, info, id: str):
    db: Session = info.context["db"]
    course_schedule = db.query(CourseSchedule).filter(
        CourseSchedule.id == id, 
        CourseSchedule.is_deleted == False
    ).first()
    
    if not course_schedule:
        raise Exception("CourseSchedule not found")
    
    course_schedule.is_deleted = True
    course_schedule.deleted_at = datetime.now()
    db.commit()
    return True


# Field resolvers for CourseSchedule type
@course_schedule.field("scheduleId")
def resolve_schedule(course_schedule_obj, info):
    return course_schedule_obj.schedule_id

@course_schedule.field("batchCourseId")
def resolve_schedule(course_schedule_obj, info):
    return course_schedule_obj.batch_course_id

@course_schedule.field("schedule")
def resolve_schedule(course_schedule_obj, info):
    db: Session = info.context["db"]
    return db.query(Schedule).filter(Schedule.id == course_schedule_obj.schedule_id, Schedule.is_deleted == False).first()

@course_schedule.field("batchCourse")
def resolve_batch_course(course_schedule_obj, info):
    db: Session = info.context["db"]
    return db.query(BatchCourse).filter(BatchCourse.id == course_schedule_obj.batch_course_id, BatchCourse.is_deleted == False).first()

@course_schedule.field("attendances")
def resolve_attendances(course_schedule_obj, info):
    db: Session = info.context["db"]
    return db.query(Attendance).filter(Attendance.course_schedule_id == course_schedule_obj.id, Attendance.is_deleted == False).all()


@course_schedule.field("createdAt")
def resolve_created_at(course_schedule_obj, info):
    return course_schedule_obj.created_at


@course_schedule.field("updatedAt")
def resolve_updated_at(course_schedule_obj, info):
    return course_schedule_obj.updated_at


@course_schedule.field("isDeleted")
def resolve_is_deleted(course_schedule_obj, info):
    return course_schedule_obj.is_deleted


@course_schedule.field("deletedAt")
def resolve_deleted_at(course_schedule_obj, info):
    return course_schedule_obj.deleted_at
