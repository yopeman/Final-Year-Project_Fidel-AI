from datetime import datetime, time
from enum import Enum
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.schedule import DayOfWeek, Schedule
from ..model.course_schedule import CourseSchedule

# DayOfWeek enum mapping
DAY_OF_WEEK_MAP = {
    "MONDAY": DayOfWeek.MONDAY,
    "TUESDAY": DayOfWeek.TUESDAY,
    "WEDNESDAY": DayOfWeek.WEDNESDAY,
    "THURSDAY": DayOfWeek.THURSDAY,
    "FRIDAY": DayOfWeek.FRIDAY,
    "SATURDAY": DayOfWeek.SATURDAY,
    "SUNDAY": DayOfWeek.SUNDAY
}

query = QueryType()
mutation = MutationType()
schedule = ObjectType("Schedule")

@query.field("schedules")
def resolve_schedules(_, info):
    db: Session = info.context["db"]
    return db.query(Schedule).filter(Schedule.is_deleted == False).all()

@query.field("schedule")
def resolve_schedule(_, info, id: str):
    db: Session = info.context["db"]
    schedule = db.query(Schedule).filter(Schedule.id == id, Schedule.is_deleted == False).first()
    if not schedule:
        raise Exception("Schedule not found")
    return schedule

@mutation.field("createSchedule")
def resolve_create_schedule(_, info, input):
    db: Session = info.context["db"]
    
    # Convert string time to time objects
    start_time = time.fromisoformat(input["startTime"])
    end_time = time.fromisoformat(input["endTime"])
    
    # Map DayOfWeek enum to database value
    day_of_week = DAY_OF_WEEK_MAP.get(input["dayOfWeek"])
    if not day_of_week:
        raise Exception(f"Invalid day of week: {input['dayOfWeek']}")
    
    schedule = Schedule(
        day_of_week=day_of_week,
        start_time=start_time,
        end_time=end_time
    )
    
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule

@mutation.field("updateSchedule")
def resolve_update_schedule(_, info, id: str, input):
    db: Session = info.context["db"]
    schedule = db.query(Schedule).filter(Schedule.id == id, Schedule.is_deleted == False).first()
    
    if not schedule:
        raise Exception("Schedule not found")
    
    if "dayOfWeek" in input:
        # Map DayOfWeek enum to database value
        day_of_week = DAY_OF_WEEK_MAP.get(input["dayOfWeek"])
        if not day_of_week:
            raise Exception(f"Invalid day of week: {input['dayOfWeek']}")
        schedule.day_of_week = day_of_week
    if "startTime" in input:
        schedule.start_time = time.fromisoformat(input["startTime"])
    if "endTime" in input:
        schedule.end_time = time.fromisoformat(input["endTime"])
    
    db.commit()
    db.refresh(schedule)
    return schedule

@mutation.field("deleteSchedule")
def resolve_delete_schedule(_, info, id: str):
    db: Session = info.context["db"]
    schedule = db.query(Schedule).filter(Schedule.id == id, Schedule.is_deleted == False).first()
    
    if not schedule:
        raise Exception("Schedule not found")
    
    schedule.is_deleted = True
    schedule.deleted_at = datetime.now()
    db.commit()
    return True

# Field resolvers for Schedule type
@schedule.field("dayOfWeek")
def resolve_day_of_week(schedule_obj, info):
    # Convert database value back to enum value
    for enum_value, db_value in DAY_OF_WEEK_MAP.items():
        if schedule_obj.day_of_week == db_value:
            return enum_value
    return schedule_obj.day_of_week

@schedule.field("startTime")
def resolve_start_time(schedule_obj, info):
    return schedule_obj.start_time.isoformat()

@schedule.field("endTime")
def resolve_end_time(schedule_obj, info):
    return schedule_obj.end_time.isoformat()

@schedule.field("courseSchedules")
def resolve_course_schedules(schedule_obj, info):
    db: Session = info.context["db"]
    return db.query(CourseSchedule).filter(CourseSchedule.schedule_id == schedule_obj.id, CourseSchedule.is_deleted == False).all()

@schedule.field("createdAt")
def resolve_created_at(schedule_obj, info):
    return schedule_obj.created_at


@schedule.field("updatedAt")
def resolve_updated_at(schedule_obj, info):
    return schedule_obj.updated_at


@schedule.field("isDeleted")
def resolve_is_deleted(schedule_obj, info):
    return schedule_obj.is_deleted


@schedule.field("deletedAt")
def resolve_deleted_at(schedule_obj, info):
    return schedule_obj.deleted_at
