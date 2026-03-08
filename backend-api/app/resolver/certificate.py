from datetime import datetime
from typing import Optional
import uuid
from jinja2 import Template

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session, joinedload

from ..model.batch_enrollment import BatchEnrollment
from ..model.certificate import Certificate
from ..model.listening_skill import ListeningSkill
from ..model.reading_skill import ReadingSkill
from ..model.speaking_skill import SpeakingSkill
from ..model.skill import Skill
from ..model.user import User, UserRole
from ..model.writing_skill import WritingSkill
from ..util.email_service import send_notification

query = QueryType()
mutation = MutationType()
certificate = ObjectType("Certificate")

@query.field("certificates")
def resolve_certificates(_, info, enrollmentId):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Check if user is tutor, admin, or the student themselves
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        # Students can only view their own certificates
        enrollment = db.query(BatchEnrollment).filter(
            BatchEnrollment.id == enrollmentId,
            BatchEnrollment.is_deleted == False
        ).first()
        
        if not enrollment or current_user.id != enrollment.profile.user_id:
            raise Exception("Unauthorized: You can only view your own certificates")
    
    # Verify enrollment exists and belongs to the same batch as the tutor (if tutor)
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == enrollmentId,
        BatchEnrollment.is_deleted == False
    ).first()
    
    if not enrollment:
        raise Exception("Enrollment not found")
    
    # If user is a tutor, verify they are assigned to this batch
    if current_user.role == UserRole.tutor:
        from ..model.batch_instructor import BatchInstructor
        batch_instructor = db.query(BatchInstructor).filter(
            BatchInstructor.user_id == current_user.id,
            BatchInstructor.batch_id == enrollment.batch_id,
            BatchInstructor.is_deleted == False
        ).first()
        
        if not batch_instructor:
            raise Exception("Unauthorized: You are not assigned to this batch")
    
    certificates = db.query(Certificate).filter(
        Certificate.skill.has(enrollment_id=enrollmentId),
        Certificate.is_deleted == False
    ).all()
    
    return certificates


@query.field("certificate")
def resolve_certificate(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    certificate_obj = db.query(Certificate).filter(
        Certificate.id == id,
        Certificate.is_deleted == False
    ).first()
    
    if not certificate_obj:
        raise Exception("Certificate not found")
    
    # Check if user can access this certificate
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        # Students can only view their own certificates
        if current_user.id != certificate_obj.skill.enrollment.profile.user_id:
            raise Exception("Unauthorized: You can only view your own certificates")
    
    # If user is a tutor, verify they are assigned to this batch
    if current_user.role == UserRole.tutor:
        from ..model.batch_instructor import BatchInstructor
        batch_instructor = db.query(BatchInstructor).filter(
            BatchInstructor.user_id == current_user.id,
            BatchInstructor.batch_id == certificate_obj.skill.enrollment.batch_id,
            BatchInstructor.is_deleted == False
        ).first()
        
        if not batch_instructor:
            raise Exception("Unauthorized: You are not assigned to this batch")
    
    return certificate_obj


@mutation.field("generateCertificate")
def resolve_generate_certificate(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Only tutors and admins can generate certificates
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        raise Exception("Unauthorized: Only admins and tutors can generate certificates")
    
    skill_id = input["skillId"]
    
    # Verify skill exists
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.is_deleted == False
    ).options(
        joinedload(Skill.enrollment).joinedload(BatchEnrollment.profile).joinedload(User.profile),
        joinedload(Skill.speaking_skill),
        joinedload(Skill.reading_skill),
        joinedload(Skill.writing_skill),
        joinedload(Skill.listening_skill)
    ).first()
    
    if not skill:
        raise Exception("Skill not found")
    
    # Verify user can generate certificate for this skill
    if current_user.role == UserRole.tutor and current_user.id != skill.instructor_id:
        raise Exception("Unauthorized: You can only generate certificates for students you are assigned to")
    
    # Check if certificate already exists for this skill
    existing_certificate = db.query(Certificate).filter(
        Certificate.skill_id == skill_id,
        Certificate.is_deleted == False
    ).first()
    
    if existing_certificate:
        raise Exception("Certificate already exists for this skill")
    
    # Get student name
    student_name = f"{skill.enrollment.profile.user.first_name} {skill.enrollment.profile.user.last_name}"
    
    # Get all skill grades
    speaking_grade = skill.speaking_skill.final_result.value if skill.speaking_skill else "N/A"
    reading_grade = skill.reading_skill.final_result.value if skill.reading_skill else "N/A"
    writing_grade = skill.writing_skill.final_result.value if skill.writing_skill else "N/A"
    listening_grade = skill.listening_skill.final_result.value if skill.listening_skill else "N/A"
    final_grade = skill.final_result.value
    
    # Load and render HTML template
    import os
    template_path = os.path.join(os.path.dirname(__file__), "..", "util", "certificate_template.html")
    with open(template_path, "r") as f:
        template_content = f.read()
    
    template = Template(template_content)
    
    certificate_html = template.render(
        student_name=student_name,
        speaking_grade=speaking_grade,
        reading_grade=reading_grade,
        writing_grade=writing_grade,
        listening_grade=listening_grade,
        final_grade=final_grade,
        issue_date=datetime.utcnow().strftime("%B %d, %Y"),
        formatted_date=datetime.utcnow().strftime("%Y-%m-%d"),
        certificate_id=str(uuid.uuid4()).upper()[:8]
    )
    
    # Create certificate
    certificate_obj = Certificate(
        skill_id=skill_id,
        result=final_grade,
        certificate_html=certificate_html
    )
    
    db.add(certificate_obj)
    db.commit()
    db.refresh(certificate_obj)
    
    # Send notification to student
    student_title = "Certificate Generated"
    student_content = f"Congratulations! Your certificate has been generated successfully. You can view it in your profile."
    send_notification(skill.enrollment.profile.user.id, student_title, student_content, db)
    
    # Send notification to tutor/admin
    tutor_title = "Certificate Generated"
    tutor_content = f"Certificate has been generated for student {student_name}."
    send_notification(current_user.id, tutor_title, tutor_content, db)
    
    return certificate_obj


@mutation.field("deleteCertificate")
def resolve_delete_certificate(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Only tutors, admins, and the student themselves can delete certificates
    certificate_obj = db.query(Certificate).filter(
        Certificate.id == id,
        Certificate.is_deleted == False
    ).first()
    
    if not certificate_obj:
        raise Exception("Certificate not found")
    
    # Check permissions
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        # Students can only delete their own certificates
        if current_user.id != certificate_obj.skill.enrollment.profile.user_id:
            raise Exception("Unauthorized: You can only delete your own certificates")
    
    # If user is a tutor, verify they are assigned to this batch
    if current_user.role == UserRole.tutor and current_user.id != certificate_obj.skill.instructor_id:
        from ..model.batch_instructor import BatchInstructor
        batch_instructor = db.query(BatchInstructor).filter(
            BatchInstructor.user_id == current_user.id,
            BatchInstructor.batch_id == certificate_obj.skill.enrollment.batch_id,
            BatchInstructor.is_deleted == False
        ).first()
        
        if not batch_instructor:
            raise Exception("Unauthorized: You are not assigned to this batch")
    
    certificate_obj.is_deleted = True
    certificate_obj.deleted_at = datetime.utcnow()
    
    db.commit()
    
    return True


@certificate.field("skill")
def resolve_skill(certificate_obj, info):
    db: Session = info.context["db"]
    skill = db.query(Skill).filter(
        Skill.id == certificate_obj.skill_id,
        Skill.is_deleted == False
    ).first()
    return skill


@certificate.field("skillId")
def resolve_skill_id(certificate_obj, info):
    return certificate_obj.skill_id


@certificate.field("result")
def resolve_result(certificate_obj, info):
    return certificate_obj.result


@certificate.field("certificateHtml")
def resolve_certificate_html(certificate_obj, info):
    return certificate_obj.certificate_html


@certificate.field("createdAt")
def resolve_created_at(certificate_obj, info):
    return certificate_obj.created_at


@certificate.field("updatedAt")
def resolve_updated_at(certificate_obj, info):
    return certificate_obj.updated_at


@certificate.field("isDeleted")
def resolve_is_deleted(certificate_obj, info):
    return certificate_obj.is_deleted


@certificate.field("deletedAt")
def resolve_deleted_at(certificate_obj, info):
    return certificate_obj.deleted_at