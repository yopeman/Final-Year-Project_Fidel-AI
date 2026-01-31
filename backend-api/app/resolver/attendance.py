from datetime import datetime, timedelta
from enum import Enum as PyEnum
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.attendance import Attendance, AttendanceStatus, UserType as ModelUserType
from ..model.course_schedule import CourseSchedule
from ..model.schedule import Schedule
from ..model.batch_course import BatchCourse
from ..model.batch import Batch
from ..model.user import User, UserRole
from ..model.batch_enrollment import BatchEnrollment, EnrollmentStatus

query = QueryType()
mutation = MutationType()
attendance = ObjectType("Attendance")

@query.field("attendances")
def resolve_attendances(_, info, courseId: str):
    db: Session = info.context["db"]
    
    # Get current user to determine their role and access
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Authentication required")
    
    # Check if user has access to this course's attendance
    # For now, allow access if user is admin, tutor, or enrolled student
    if current_user.role not in ["admin", "tutor"]:
        # For students, they can only see their own attendance
        # This would need more complex logic to check enrollment
        pass
    
    # Get all course schedules for this course
    course_schedules = db.query(CourseSchedule).join(BatchCourse).filter(
        BatchCourse.course_id == courseId,
        CourseSchedule.is_deleted == False,
        BatchCourse.is_deleted == False
    ).all()
    
    course_schedule_ids = [cs.id for cs in course_schedules]
    
    # Get all attendances for these course schedules
    attendances = db.query(Attendance).filter(
        Attendance.course_schedule_id.in_(course_schedule_ids),
        Attendance.is_deleted == False
    ).all()

    return attendances


@query.field("attendance")
def resolve_attendance(_, info, id: str):
    db: Session = info.context["db"]
    attendance = db.query(Attendance).filter(
        Attendance.id == id, 
        Attendance.is_deleted == False
    ).first()
    if not attendance:
        raise Exception("Attendance not found")
    return attendance


@mutation.field("getMeetingLink")
def resolve_get_meeting_link(_, info, courseScheduleId: str):
    db: Session = info.context["db"]
    current_user: User = info.context.get("current_user")
    
    if not current_user:
        raise Exception("Authentication required")
    
    # Get the course schedule
    course_schedule = db.query(CourseSchedule).filter(
        CourseSchedule.id == courseScheduleId,
        CourseSchedule.is_deleted == False
    ).first()
    
    if not course_schedule:
        raise Exception("Course schedule not found")
    
    # Get the schedule details
    schedule = db.query(Schedule).filter(
        Schedule.id == course_schedule.schedule_id,
        Schedule.is_deleted == False
    ).first()
    
    if not schedule:
        raise Exception("Schedule not found")
    
    # Get the batch course to find the batch
    batch_course = db.query(BatchCourse).filter(
        BatchCourse.id == course_schedule.batch_course_id,
        BatchCourse.is_deleted == False
    ).first()
    
    if not batch_course:
        raise Exception("Batch course not found")
    
    # Get the batch to use as meeting identifier
    batch = db.query(Batch).filter(
        Batch.id == batch_course.batch_id,
        Batch.is_deleted == False
    ).first()
    
    if not batch:
        raise Exception("Batch not found")
    

    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.batch_id == batch.id,
        BatchEnrollment.is_deleted == False
    ).first()
    if enrollment.status != EnrollmentStatus.enrolled:
        raise Exception('Enrollment not paid')

    
    # Get current time and calculate time difference from start time
    now = datetime.now()
    current_time = now.time()
    start_time = schedule.start_time
    end_time = schedule.end_time
    
    # Calculate time difference in minutes
    current_datetime = datetime.combine(now.date(), current_time)
    start_datetime = datetime.combine(now.date(), start_time)
    time_diff_minutes = int((current_datetime - start_datetime).total_seconds() / 60)
    
    # Determine attendance status based on time
    status = AttendanceStatus.absent
    meeting_link = None
    
    # Check if within class time (allowing 5 minutes before and 10 minutes after)
    if -5 <= time_diff_minutes <= 10:
        status = AttendanceStatus.present
        # Generate Jitsi Meet link using batch name/ID
        meeting_link = f"https://meet.jit.si/{batch.name.replace(' ', '-').lower()}-{batch.id}"
    elif 11 <= time_diff_minutes <= 20:
        status = AttendanceStatus.late
        # Generate Jitsi Meet link for late students
        meeting_link = f"https://meet.jit.si/{batch.name.replace(' ', '-').lower()}-{batch.id}"
    # For absent students (time_diff_minutes > 20 or < -5), no meeting link is generated
    
    # Create or update attendance record
    attendance_record = db.query(Attendance).filter(
        Attendance.course_schedule_id == courseScheduleId,
        Attendance.user_id == current_user.id,
        Attendance.is_deleted == False
    ).first()
    
    if attendance_record:
        # Update existing attendance
        attendance_record.status = status
        attendance_record.attendance_date = now.date()
        attendance_record.updated_at = now
    else:
        # Create new attendance record
        user_type = ModelUserType.student if current_user.role == "student" else ModelUserType.tutor
        attendance_record = Attendance(
            course_schedule_id=courseScheduleId,
            user_id=current_user.id,
            user_type=user_type,
            status=status,
            attendance_date=now.date()
        )
        db.add(attendance_record)
    
    db.commit()
    db.refresh(attendance_record)
    
    # Only return meeting link if student is present or late
    if status in [AttendanceStatus.present, AttendanceStatus.late] and meeting_link:
        return {
            "attendance": attendance_record,
            "meetingLink": meeting_link
        }
    else:
        return {
            "attendance": attendance_record,
            "meetingLink": None
        }


@mutation.field("deleteAttendance")
def resolve_delete_attendance(_, info, id: str):
    db: Session = info.context["db"]
    current_user = info.context.get("current_user")
    
    if not current_user:
        raise Exception("Authentication required")
    
    # Only admins and tutors can delete attendance records
    if current_user.role not in ["admin", "tutor"]:
        raise Exception("Insufficient permissions to delete attendance")
    
    attendance = db.query(Attendance).filter(
        Attendance.id == id, 
        Attendance.is_deleted == False
    ).first()
    
    if not attendance:
        raise Exception("Attendance not found")
    
    attendance.is_deleted = True
    attendance.deleted_at = datetime.now()
    db.commit()
    return True


# Field resolvers for Attendance type
@attendance.field("courseScheduleId")
def resolve_course_schedule_id(attendance_obj, info):
    return attendance_obj.course_schedule_id

@attendance.field("userId")
def resolve_user_id(attendance_obj, info):
    return attendance_obj.user_id

@attendance.field("userType")
def resolve_user_type(attendance_obj, info):
    return str(attendance_obj.user_type.value).upper()

@attendance.field("status")
def resolve_status(attendance_obj, info):
    return str(attendance_obj.status.value).upper()

@attendance.field("attendanceDate")
def resolve_attendance_date(attendance_obj, info):
    return attendance_obj.attendance_date

@attendance.field("courseSchedule")
def resolve_course_schedule(attendance_obj, info):
    db: Session = info.context["db"]
    return db.query(CourseSchedule).filter(
        CourseSchedule.id == attendance_obj.course_schedule_id,
        CourseSchedule.is_deleted == False
    ).first()

@attendance.field("user")
def resolve_user(attendance_obj, info):
    db: Session = info.context["db"]
    return db.query(User).filter(
        User.id == attendance_obj.user_id,
        User.is_deleted == False
    ).first()

@attendance.field("createdAt")
def resolve_created_at(attendance_obj, info):
    return attendance_obj.created_at

@attendance.field("updatedAt")
def resolve_updated_at(attendance_obj, info):
    return attendance_obj.updated_at

@attendance.field("isDeleted")
def resolve_is_deleted(attendance_obj, info):
    return attendance_obj.is_deleted

@attendance.field("deletedAt")
def resolve_deleted_at(attendance_obj, info):
    return attendance_obj.deleted_at