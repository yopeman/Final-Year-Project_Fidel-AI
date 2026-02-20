from datetime import datetime, timedelta
from enum import Enum as PyEnum
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.attendance import Attendance, AttendanceStatus, UserType as ModelUserType, CourseScheduleStatus
from ..model.course_schedule import CourseSchedule
from ..model.schedule import Schedule
from ..model.batch_course import BatchCourse
from ..model.batch import Batch
from ..model.user import User, UserRole
from ..model.student_profile import StudentProfile
from ..model.batch_enrollment import BatchEnrollment, EnrollmentStatus
from ..util.email_service import send_notification

query = QueryType()
mutation = MutationType()
attendance = ObjectType("Attendance")
course_schedule = ObjectType("CourseSchedule")

@query.field("attendances")
def resolve_attendances(_, info, batchId: str):
    db: Session = info.context["db"]
    
    # Get current user to determine their role and access
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Authentication required")
    
    # Check if user has access to this batch's attendance
    # For now, allow access if user is admin, tutor, or enrolled student
    if current_user.role not in ["admin", "tutor"]:
        # For students, they can only see their own attendance
        # This would need more complex logic to check enrollment
        pass
    
    # Get all course schedules for this batch
    course_schedules = db.query(CourseSchedule).join(BatchCourse).filter(
        BatchCourse.batch_id == batchId,
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


@mutation.field("getCourseMeetingLink")
def resolve_get_course_meeting_link(_, info, courseScheduleId: str):
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
    status = None
    meeting_link = None
    attendance_record = None
    
    # if -6 > time_diff_minutes:
    #     raise Exception('Now too early for class')

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
    elif 21 <= time_diff_minutes <= 60:
        status = AttendanceStatus.absent
    
    # Create or update attendance record
    if status:
        attendance_record = db.query(Attendance).filter(
            Attendance.course_schedule_id == courseScheduleId,
            Attendance.user_id == current_user.id,
            Attendance.is_deleted == False
        ).first()
        
        if attendance_record:
            # Update existing attendance
            old_status = attendance_record.status
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
            old_status = None
        
        db.commit()
        db.refresh(attendance_record)
        
        # Send notification based on attendance status
        if status == AttendanceStatus.present and old_status != AttendanceStatus.present:
            send_notification(
                user_id=current_user.id,
                title="Attendance Recorded - Present",
                content=f"You have been marked present for the {schedule.day_of_week.value} class at {start_time.strftime('%H:%M')}. Meeting link: {meeting_link}",
                db=db
            )
        elif status == AttendanceStatus.late and old_status != AttendanceStatus.late:
            send_notification(
                user_id=current_user.id,
                title="Attendance Recorded - Late",
                content=f"You have been marked late for the {schedule.day_of_week.value} class at {start_time.strftime('%H:%M')}. Meeting link: {meeting_link}",
                db=db
            )
        elif status == AttendanceStatus.absent and old_status != AttendanceStatus.absent:
            send_notification(
                user_id=current_user.id,
                title="Attendance Recorded - Absent",
                content=f"You have been marked absent for the {schedule.day_of_week.value} class at {start_time.strftime('%H:%M')}. Please contact your instructor if this is an error.",
                db=db
            )
    
    # Update CourseSchedule status
    if meeting_link:
        course_schedule.status = CourseScheduleStatus.live
        db.commit()
    
    # Check if we should mark as completed (after class time)
    if time_diff_minutes > 60: # More than an hour after start
        course_schedule.status = CourseScheduleStatus.completed
        db.commit()

    return {
        "attendance": attendance_record,
        "meetingLink": meeting_link,
        "remainingTimeMinutes": time_diff_minutes,
        "status": str(course_schedule.status.value).upper()
    }


@mutation.field("getBatchMeetingLink")
def resolve_get_batch_meeting_link(_, info, batchId: str):
    db: Session = info.context["db"]
    current_user: User = info.context.get("current_user")
    
    if not current_user:
        raise Exception("Authentication required")
    
    # Get the batch
    batch = db.query(Batch).filter(
        Batch.id == batchId,
        Batch.is_deleted == False
    ).first()
    
    if not batch:
        raise Exception("Batch not found")
    
    if current_user.role == UserRole.student:
        profile = db.query(StudentProfile).filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False
        ).first()

        if not profile:
            raise Exception('Profile not found')

        # Get current user's enrollment to check if they're enrolled in this batch
        enrollment = db.query(BatchEnrollment).filter(
            BatchEnrollment.batch_id == batch.id,
            BatchEnrollment.profile_id == profile.id,
            BatchEnrollment.is_deleted == False
        ).first()
        
        if not enrollment or enrollment.status != EnrollmentStatus.enrolled:
            raise Exception('You are not enrolled in this batch or enrollment is not paid')
    
    # Get all course schedules for this batch
    course_schedules = db.query(CourseSchedule).join(BatchCourse).filter(
        BatchCourse.batch_id == batchId,
        CourseSchedule.is_deleted == False,
        BatchCourse.is_deleted == False
    ).all()
    
    if not course_schedules:
        raise Exception("No course schedules found for this batch")
    
    # Get current time to determine which class is active
    now = datetime.now()
    current_time = now.time()
    current_day = now.strftime('%A').upper()
    
    # Find the active course schedule for today
    active_schedule = None
    active_course_schedule = None
    
    for cs in course_schedules:
        schedule = db.query(Schedule).filter(
            Schedule.id == cs.schedule_id,
            # Schedule.is_deleted == False
        ).first()
        
        if schedule and schedule.day_of_week.value.upper() == current_day:
            start_time = schedule.start_time
            end_time = schedule.end_time
            
            # Check if current time is within class time (allowing 5 minutes before and 10 minutes after)
            current_datetime = datetime.combine(now.date(), current_time)
            start_datetime = datetime.combine(now.date(), start_time)
            end_datetime = datetime.combine(now.date(), end_time)

            active_schedule = schedule
            active_course_schedule = cs

            print('\n'*10,
                  {
                      'staring': start_datetime - timedelta(minutes=5),
                      'current': current_datetime,
                      'ending': end_datetime
                  }
            ,'\n'*10)
            
            # if (start_datetime - timedelta(minutes=5)) <= current_datetime <= (end_datetime + timedelta(minutes=10)):
            #     active_schedule = schedule
            #     active_course_schedule = cs
            #     break
    
    if not active_schedule:
        raise Exception("No active class found for today")
    
    # Calculate time difference from start time
    start_datetime = datetime.combine(now.date(), active_schedule.start_time)
    time_diff_minutes = int((now - start_datetime).total_seconds() / 60)
    
    # Determine attendance status based on time
    status = None
    meeting_link = None
    attendance_record = None
    
    # if -6 > time_diff_minutes:
    #     raise Exception('Now too early for class')

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
    elif 21 <= time_diff_minutes <= 60:
        status = AttendanceStatus.absent
    
    # Create or update attendance record
    if status:
        attendance_record = db.query(Attendance).filter(
            Attendance.course_schedule_id == active_course_schedule.id,
            Attendance.user_id == current_user.id,
            Attendance.is_deleted == False
        ).first()
        
        if attendance_record:
            # Update existing attendance
            old_status = attendance_record.status
            attendance_record.status = status
            attendance_record.attendance_date = now.date()
            attendance_record.updated_at = now
        else:
            # Create new attendance record
            user_type = ModelUserType.student if current_user.role == "student" else ModelUserType.tutor
            attendance_record = Attendance(
                course_schedule_id=active_course_schedule.id,
                user_id=current_user.id,
                user_type=user_type,
                status=status,
                attendance_date=now.date()
            )
            db.add(attendance_record)
            old_status = None
        
        db.commit()
        db.refresh(attendance_record)
        
        # Send notification based on attendance status
        if status == AttendanceStatus.present and old_status != AttendanceStatus.present:
            send_notification(
                user_id=current_user.id,
                title="Attendance Recorded - Present",
                content=f"You have been marked present for the {active_schedule.day_of_week.value} class at {active_schedule.start_time.strftime('%H:%M')}. Meeting link: {meeting_link}",
                db=db
            )
        elif status == AttendanceStatus.late and old_status != AttendanceStatus.late:
            send_notification(
                user_id=current_user.id,
                title="Attendance Recorded - Late",
                content=f"You have been marked late for the {active_schedule.day_of_week.value} class at {active_schedule.start_time.strftime('%H:%M')}. Meeting link: {meeting_link}",
                db=db
            )
        elif status == AttendanceStatus.absent and old_status != AttendanceStatus.absent:
            send_notification(
                user_id=current_user.id,
                title="Attendance Recorded - Absent",
                content=f"You have been marked absent for the {active_schedule.day_of_week.value} class at {active_schedule.start_time.strftime('%H:%M')}. Please contact your instructor if this is an error.",
                db=db
            )
            
    # Update CourseSchedule status
    if meeting_link:
        active_course_schedule.status = CourseScheduleStatus.live
        db.commit()
    
    # Check if we should mark as completed
    if time_diff_minutes > 60:
        active_course_schedule.status = CourseScheduleStatus.completed
        db.commit()
            
    return {
        "attendance": attendance_record,
        "meetingLink": meeting_link,
        "remainingTimeMinutes": time_diff_minutes,
        "status": str(active_course_schedule.status.value).upper()
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

# Field resolvers for CourseSchedule type
@course_schedule.field("scheduleId")
def resolve_cs_schedule_id(cs_obj, info):
    return cs_obj.schedule_id

@course_schedule.field("batchCourseId")
def resolve_cs_batch_course_id(cs_obj, info):
    return cs_obj.batch_course_id

@course_schedule.field("status")
def resolve_cs_status(cs_obj, info):
    return str(cs_obj.status.value).upper()

@course_schedule.field("schedule")
def resolve_cs_schedule(cs_obj, info):
    db: Session = info.context["db"]
    return db.query(Schedule).filter(
        Schedule.id == cs_obj.schedule_id,
        Schedule.is_deleted == False
    ).first()

@course_schedule.field("batchCourse")
def resolve_cs_batch_course(cs_obj, info):
    db: Session = info.context["db"]
    return db.query(BatchCourse).filter(
        BatchCourse.id == cs_obj.batch_course_id,
        BatchCourse.is_deleted == False
    ).first()

@course_schedule.field("attendances")
def resolve_cs_attendances(cs_obj, info):
    db: Session = info.context["db"]
    return db.query(Attendance).filter(
        Attendance.course_schedule_id == cs_obj.id,
        Attendance.is_deleted == False
    ).all()

@course_schedule.field("createdAt")
def resolve_cs_created_at(cs_obj, info):
    return cs_obj.created_at

@course_schedule.field("updatedAt")
def resolve_cs_updated_at(cs_obj, info):
    return cs_obj.updated_at

@course_schedule.field("isDeleted")
def resolve_cs_is_deleted(cs_obj, info):
    return cs_obj.is_deleted

@course_schedule.field("deletedAt")
def resolve_cs_deleted_at(cs_obj, info):
    return cs_obj.deleted_at