from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.batch_enrollment import BatchEnrollment, EnrollmentStatus
from ..model.user import User
from ..model.student_profile import StudentProfile
from ..model.batch import Batch
from ..model.quiz_results import QuizResults
from ..model.skill_result import SkillResult
from ..model.payment import Payment
from ..model.certificate import Certificate
from ..util.email_service import send_notification


query = QueryType()
mutation = MutationType()
batch_enrollment = ObjectType("BatchEnrollment")

# Enrollment status mapping
def map_enrollment_status(status_str: str) -> EnrollmentStatus:
    status_map = {
        "APPLIED": EnrollmentStatus.applied,
        "ENROLLED": EnrollmentStatus.enrolled,
        "COMPLETED": EnrollmentStatus.completed,
        "DROPPED": EnrollmentStatus.dropped,
    }
    return status_map.get(status_str.upper(), EnrollmentStatus.applied)


@query.field("enrollments")
def resolve_enrollments(_, info, batchId=None, profileId=None):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    query_obj = db.query(BatchEnrollment).filter(BatchEnrollment.is_deleted == False)
    
    # Filter by batchId if provided
    if batchId:
        query_obj = query_obj.filter(BatchEnrollment.batch_id == batchId)
    
    # Filter by profileId if provided
    if profileId:
        query_obj = query_obj.filter(BatchEnrollment.profile_id == profileId)
    
    return query_obj.all()


@query.field("enrollment")
def resolve_enrollment(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == id, 
        BatchEnrollment.is_deleted == False
    ).first()

    if not enrollment:
        raise Exception("Enrollment not found")
    return enrollment


@mutation.field("createEnrollment")
def resolve_create_enrollment(_, info, batchId: str, studentId: Optional[str] = None):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Validate that profile exists
    if studentId and current_user.role.value == "admin":
        profile = db.query(StudentProfile).filter(
            StudentProfile.user_id == studentId,
            StudentProfile.is_deleted == False
        ).first()
        
    else:
        profile = db.query(StudentProfile).filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False
        ).first()
    
    if not profile:
        raise Exception("Student profile not found")

    # Validate that batch exists
    batch = db.query(Batch).filter(
        Batch.id == batchId,
        Batch.is_deleted == False
    ).first()
    
    if not batch:
        raise Exception("Batch not found")

    # Check if student is already enrolled in this batch
    existing_enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.profile_id == profile.id,
        BatchEnrollment.batch_id == batchId,
        BatchEnrollment.is_deleted == False
    ).first()
    
    if existing_enrollment:
        raise Exception("Student is already enrolled in this batch")

    # Check if batch has available capacity
    current_enrollments = db.query(BatchEnrollment).filter(
        BatchEnrollment.batch_id == batchId,
        BatchEnrollment.status == EnrollmentStatus.applied,
        BatchEnrollment.is_deleted == False
    ).count()
    
    if current_enrollments >= batch.max_students:
        raise Exception("Batch is full")

    # Create new enrollment
    new_enrollment = BatchEnrollment(
        profile_id=profile.id,
        batch_id=batchId,
        enrollment_date=datetime.now().date(),
        status=EnrollmentStatus.applied  # Default to applied
    )

    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    # Send notification to the student about successful enrollment
    send_notification(
        user_id=profile.user_id,
        title="Batch Enrollment Successful",
        content=f"You have successfully enrolled in batch '{batch.name}'. Your enrollment is currently pending approval. You will be notified once your enrollment is confirmed.",
        db=db
    )

    return new_enrollment


@mutation.field("updateEnrollment")
def resolve_update_enrollment(_, info, id, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role for status updates
    if "status" in input and current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required to update enrollment status")

    db: Session = info.context["db"]
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == id, 
        BatchEnrollment.is_deleted == False
    ).first()

    if not enrollment:
        raise Exception("Enrollment not found")

    # Update fields if provided
    if "profileId" in input and input["profileId"]:
        # Validate that new profile exists
        profile = db.query(StudentProfile).filter(
            StudentProfile.id == input["profileId"],
            StudentProfile.is_deleted == False
        ).first()
        
        if not profile:
            raise Exception("Student profile not found")
        
        enrollment.profile_id = input["profileId"]
    
    if "batchId" in input and input["batchId"]:
        # Validate that new batch exists
        batch = db.query(Batch).filter(
            Batch.id == input["batchId"],
            Batch.is_deleted == False
        ).first()
        
        if not batch:
            raise Exception("Batch not found")
        
        # Check if student is already enrolled in this batch
        existing_enrollment = db.query(BatchEnrollment).filter(
            BatchEnrollment.profile_id == enrollment.profile_id,
            BatchEnrollment.batch_id == input["batchId"],
            BatchEnrollment.id != id,  # Exclude current enrollment
            BatchEnrollment.is_deleted == False
        ).first()
        
        if existing_enrollment:
            raise Exception("Student is already enrolled in this batch")
        
        # Check if batch has available capacity
        current_enrollments = db.query(BatchEnrollment).filter(
            BatchEnrollment.batch_id == input["batchId"],
            BatchEnrollment.status.in_([EnrollmentStatus.applied, EnrollmentStatus.enrolled]),
            BatchEnrollment.is_deleted == False
        ).count()
        
        if current_enrollments >= batch.max_students:
            raise Exception("Batch is full")
        
        enrollment.batch_id = input["batchId"]
    
    if "status" in input and input["status"]:
        enrollment.status = map_enrollment_status(input["status"])
        
        # Set completion date if status is completed
        if enrollment.status == EnrollmentStatus.completed and not enrollment.completion_date:
            enrollment.completion_date = datetime.now().date()

        # Send notification to student about status change
        profile = db.query(StudentProfile).filter(
            StudentProfile.id == enrollment.profile_id,
            StudentProfile.is_deleted == False
        ).first()
        
        if enrollment.status == EnrollmentStatus.enrolled:
            send_notification(
                user_id=profile.user_id,
                title="Enrollment Confirmed",
                content=f"Congratulations! Your enrollment in batch '{enrollment.batch.name}' has been confirmed. You are now officially enrolled and can start participating in the course.",
                db=db
            )
        elif enrollment.status == EnrollmentStatus.completed:
            send_notification(
                user_id=profile.user_id,
                title="Course Completed",
                content=f"Congratulations! You have successfully completed batch '{enrollment.batch.name}'. Your dedication and hard work have paid off.",
                db=db
            )
        elif enrollment.status == EnrollmentStatus.dropped:
            send_notification(
                user_id=profile.user_id,
                title="Enrollment Dropped",
                content=f"Your enrollment in batch '{enrollment.batch.name}' has been dropped. If this was not intentional, please contact support.",
                db=db
            )

    db.commit()
    db.refresh(enrollment)
    return enrollment


@mutation.field("deleteEnrollment")
def resolve_delete_enrollment(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == id, 
        BatchEnrollment.is_deleted == False
    ).first()

    if not enrollment:
        raise Exception("Enrollment not found")

    # Mark as deleted
    enrollment.is_deleted = True
    enrollment.deleted_at = datetime.now()
    db.commit()
    db.refresh(enrollment)

    return True


# BatchEnrollment field resolvers
@batch_enrollment.field("id")
def resolve_id(enrollment, info):
    return enrollment.id


@batch_enrollment.field("profileId")
def resolve_profile_id(enrollment, info):
    return enrollment.profile_id


@batch_enrollment.field("batchId")
def resolve_batch_id(enrollment, info):
    return enrollment.batch_id


@batch_enrollment.field("enrollmentDate")
def resolve_enrollment_date(enrollment, info):
    return enrollment.enrollment_date


@batch_enrollment.field("completionDate")
def resolve_completion_date(enrollment, info):
    return enrollment.completion_date


@batch_enrollment.field("status")
def resolve_status(enrollment, info):
    return enrollment.status.value.upper()


@batch_enrollment.field("createdAt")
def resolve_created_at(enrollment, info):
    return enrollment.created_at


@batch_enrollment.field("updatedAt")
def resolve_updated_at(enrollment, info):
    return enrollment.updated_at


@batch_enrollment.field("isDeleted")
def resolve_is_deleted(enrollment, info):
    return enrollment.is_deleted


@batch_enrollment.field("deletedAt")
def resolve_deleted_at(enrollment, info):
    return enrollment.deleted_at


@batch_enrollment.field("profile")
def resolve_profile(enrollment, info):
    db: Session = info.context["db"]
    profile = db.query(StudentProfile).filter(
        StudentProfile.id == enrollment.profile_id,
        StudentProfile.is_deleted == False
    ).first()
    return profile


@batch_enrollment.field("batch")
def resolve_batch(enrollment, info):
    db: Session = info.context["db"]
    batch = db.query(Batch).filter(
        Batch.id == enrollment.batch_id,
        Batch.is_deleted == False
    ).first()
    return batch


@batch_enrollment.field("quizResults")
def resolve_quiz_results(enrollment, info):
    db: Session = info.context["db"]
    quiz_results = db.query(QuizResults).filter(
        QuizResults.enrollment_id == enrollment.id,
        QuizResults.is_deleted == False
    ).all()
    return quiz_results


@batch_enrollment.field("skillResults")
def resolve_skill_results(enrollment, info):
    db: Session = info.context["db"]
    skill_results = db.query(SkillResult).filter(
        SkillResult.enrollment_id == enrollment.id,
        SkillResult.is_deleted == False
    ).all()
    return skill_results


@batch_enrollment.field("payments")
def resolve_payments(enrollment, info):
    db: Session = info.context["db"]
    payments = db.query(Payment).filter(
        Payment.enrollment_id == enrollment.id,
        Payment.is_deleted == False
    ).all()
    return payments


@batch_enrollment.field("certificates")
def resolve_certificates(enrollment, info):
    db: Session = info.context["db"]
    certificates = db.query(Certificate).filter(
        Certificate.enrollment_id == enrollment.id,
        Certificate.is_deleted == False
    ).all()
    return certificates
