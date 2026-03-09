from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session, joinedload

from ..model.batch_enrollment import BatchEnrollment
from ..model.listening_skill import ListeningSkill
from ..model.reading_skill import ReadingSkill
from ..model.speaking_skill import SpeakingSkill
from ..model.skill import Grade, Skill
from ..model.certificate import Certificate
from ..model.user import User, UserRole
from ..model.writing_skill import WritingSkill
from ..util.email_service import send_notification

query = QueryType()
mutation = MutationType()
skill = ObjectType("Skill")

# Helper function to calculate final grade
def calculate_final_grade(grades):
    """Calculate final grade based on average of input grades"""
    if not grades:
        return Grade.F
    
    # Convert grades to numeric values for averaging
    grade_values = {
        Grade.A_PLUS: 4.0, Grade.A: 4.0, Grade.A_MINUS: 3.7,
        Grade.B_PLUS: 3.3, Grade.B: 3.0, Grade.B_MINUS: 2.7,
        Grade.C_PLUS: 2.3, Grade.C: 2.0, Grade.C_MINUS: 1.7,
        Grade.D: 1.0, Grade.F: 0.0, Grade.FX: 0.0
    }
    
    numeric_grades = [grade_values.get(g, 0.0) for g in grades]
    avg = sum(numeric_grades) / len(numeric_grades)
    
    # Convert back to letter grade
    if avg >= 3.7: return Grade.A_PLUS
    elif avg >= 3.3: return Grade.A
    elif avg >= 3.0: return Grade.A_MINUS
    elif avg >= 2.7: return Grade.B_PLUS
    elif avg >= 2.3: return Grade.B
    elif avg >= 2.0: return Grade.B_MINUS
    elif avg >= 1.7: return Grade.C_PLUS
    elif avg >= 1.3: return Grade.C
    elif avg >= 1.0: return Grade.C_MINUS
    elif avg >= 0.5: return Grade.D
    else: return Grade.F


@query.field("skills")
def resolve_skills(_, info, enrollmentId):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Check if user is tutor or admin
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        raise Exception("Unauthorized: Only admins and tutors can view skills")
    
    # Verify enrollment exists and belongs to the same batch as the tutor
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
    
    skills = db.query(Skill).filter(
        Skill.enrollment_id == enrollmentId,
        Skill.is_deleted == False
    ).all()
    
    return skills


@query.field("skill")
def resolve_skill(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    skill = db.query(Skill).filter(
        Skill.id == id,
        Skill.is_deleted == False
    ).first()
    
    if not skill:
        raise Exception("Skill not found")
    
    # Check if user can access this skill
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        # Students can only view their own skills
        if current_user.id != skill.enrollment.profile.user_id:
            raise Exception("Unauthorized: You can only view your own skills")
    
    # If user is a tutor, verify they are assigned to this batch
    if current_user.role == UserRole.tutor:
        from ..model.batch_instructor import BatchInstructor
        batch_instructor = db.query(BatchInstructor).filter(
            BatchInstructor.user_id == current_user.id,
            BatchInstructor.batch_id == skill.enrollment.batch_id,
            BatchInstructor.is_deleted == False
        ).first()
        
        if not batch_instructor:
            raise Exception("Unauthorized: You are not assigned to this batch")
    
    return skill


@query.field("tutorAssignedStudents")
def resolve_tutor_assigned_students(_, info, batchId):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Only tutors and admins can view assigned students
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        raise Exception("Unauthorized: Only admins and tutors can view assigned students")
    
    # Verify instructor is assigned to this batch
    from ..model.batch_instructor import BatchInstructor
    from ..model.batch_course import BatchCourse

    batch_course = db.query(BatchCourse).filter(
        BatchCourse.batch_id == batchId,
        BatchCourse.is_deleted == False
    ).all()

    if batch_course:
        batch_instructor = db.query(BatchInstructor).filter(
            BatchInstructor.user_id == current_user.id,
            BatchInstructor.batch_course_id.in_([c.id for c in batch_course]),
            BatchInstructor.is_deleted == False
        ).first()
    
    if not batch_instructor and current_user.role == UserRole.tutor:
        raise Exception("Instructor is not assigned to this batch")
    
    all_course_of_batch = db.query(BatchCourse).filter(
        BatchCourse.batch_id == batchId,
        BatchCourse.is_deleted == False
    ).all()
    
    all_instructors_of_batch = list(set(
        db.query(BatchInstructor).filter(
            BatchInstructor.batch_course_id.in_([c.id for c in all_course_of_batch]),
            BatchInstructor.is_deleted == False
        ).all()
    ))

    all_enrollments_of_batch = db.query(BatchEnrollment).filter(
        BatchEnrollment.batch_id == batchId,
        BatchEnrollment.is_deleted == False
    ).all()
    
    all_instructors_ids = [i.user_id for i in all_instructors_of_batch]
    all_enrollments_ids = [e.id for e in all_enrollments_of_batch]

    import math
    n = all_instructors_ids.index(current_user.id)
    w = math.ceil(len(all_enrollments_ids) / len(all_instructors_ids))

    selected_enrollments = all_enrollments_of_batch[n*w : (n+1)*w]
    
    return selected_enrollments


@query.field("getExamLink")
def resolve_get_exam_link(_, info, enrollmentId):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Verify enrollment exists
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == enrollmentId,
        BatchEnrollment.is_deleted == False
    ).options(
        joinedload(BatchEnrollment.profile)
    ).first()
    
    if not enrollment:
        raise Exception("Enrollment not found")
    
    # Check if user can access this exam link
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        # Students can only view their own exam link
        if current_user.id != enrollment.profile.user_id:
            raise Exception("Unauthorized: You can only view your own exam link")
    
    # Return the exam link
    return f"https://meet.jit.si/{enrollmentId}"


@mutation.field("createSkill")
def resolve_create_skill(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Only tutors and admins can create skills
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        raise Exception("Unauthorized: Only admins and tutors can create skills")
    
    enrollment_id = input["enrollmentId"]
    instructor_id = current_user.id
    
    # Verify enrollment exists
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == enrollment_id,
        BatchEnrollment.is_deleted == False
    ).first()
    
    if not enrollment:
        raise Exception("Enrollment not found")
    
    # Verify instructor exists and is a tutor
    instructor = db.query(User).filter(
        User.id == instructor_id,
        User.role == UserRole.tutor,
        User.is_deleted == False
    ).first()
    
    if not instructor:
        raise Exception("Instructor not found or not a tutor")
        
    # Verify user creating the skill is the instructor or admin
    if current_user.role == UserRole.tutor and current_user.id != instructor_id:
        raise Exception("Unauthorized: You can only create skills for students you are assigned to")
    
    
    # Create skill
    skill = db.query(Skill).filter(
        Skill.enrollment_id == enrollment_id
    ).first()

    if not skill:
        skill = Skill(
            enrollment_id=enrollment_id,
            instructor_id=instructor_id,
            final_result=Grade.F  # Will be calculated below
        )
    
        db.add(skill)
        db.flush()  # Get the skill ID
    
    # Create speaking skill
    speaking_input = input.get("speakingSkill", {})
    if speaking_input:
        speaking_skill = SpeakingSkill(
            skill_id=skill.id,
            pronunciation=speaking_input["pronunciation"],
            fluency=speaking_input["fluency"],
            grammar=speaking_input["grammar"],
            vocabulary=speaking_input["vocabulary"],
            coherence=speaking_input["coherence"],
            final_result=calculate_final_grade([
                speaking_input["pronunciation"],
                speaking_input["fluency"],
                speaking_input["grammar"],
                speaking_input["vocabulary"],
                speaking_input["coherence"]
            ])
        )
        db.add(speaking_skill)
    
    # Create reading skill
    reading_input = input.get("readingSkill", {})
    if reading_input:
        reading_skill = ReadingSkill(
            skill_id=skill.id,
            comprehension=reading_input["comprehension"],
            speed=reading_input["speed"],
            vocabulary=reading_input["vocabulary"],
            final_result=calculate_final_grade([
                reading_input["comprehension"],
                reading_input["speed"],
                reading_input["vocabulary"]
            ])
        )
        db.add(reading_skill)
    
    # Create writing skill
    writing_input = input.get("writingSkill", {})
    if writing_input:
        writing_skill = WritingSkill(
            skill_id=skill.id,
            coherence=writing_input["coherence"],
            grammar=writing_input["grammar"],
            vocabulary=writing_input["vocabulary"],
            punctuation=writing_input["punctuation"],
            final_result=calculate_final_grade([
                writing_input["coherence"],
                writing_input["grammar"],
                writing_input["vocabulary"],
                writing_input["punctuation"]
            ])
        )
        db.add(writing_skill)
    
    # Create listening skill
    listening_input = input.get("listeningSkill", {})
    if listening_input:
        listening_skill = ListeningSkill(
            skill_id=skill.id,
            comprehension=listening_input["comprehension"],
            retention=listening_input["retention"],
            interpretation=listening_input["interpretation"],
            final_result=calculate_final_grade([
                listening_input["comprehension"],
                listening_input["retention"],
                listening_input["interpretation"]
            ])
        )
        db.add(listening_skill)
    
    # Calculate final skill grade
    final_grades = []
    if speaking_input:
        final_grades.append(speaking_skill.final_result)
    if reading_input:
        final_grades.append(reading_skill.final_result)
    if writing_input:
        final_grades.append(writing_skill.final_result)
    if listening_input:
        final_grades.append(listening_skill.final_result)
    
    skill.final_result = calculate_final_grade(final_grades)
    
    db.commit()
    db.refresh(skill)

    print('=\n'*10, skill.__dict__, '=\n'*10)
    
    return skill


@mutation.field("updateSkill")
def resolve_update_skill(_, info, id, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Only tutors and admins can update skills
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        raise Exception("Unauthorized: Only admins and tutors can update skills")
    
    skill = db.query(Skill).filter(
        Skill.id == id,
        Skill.is_deleted == False
    ).first()
    
    if not skill:
        raise Exception("Skill not found")
    
    # Verify user can update this skill
    if current_user.role == UserRole.tutor and current_user.id != skill.instructor_id:
        raise Exception("Unauthorized: You can only update skills you created")
    
    # Update basic fields
    if "enrollmentId" in input:
        enrollment_id = input["enrollmentId"]
        enrollment = db.query(BatchEnrollment).filter(
            BatchEnrollment.id == enrollment_id,
            BatchEnrollment.is_deleted == False
        ).first()
        
        if not enrollment:
            raise Exception("Enrollment not found")
        
        skill.enrollment_id = enrollment_id
    
    # Update speaking skill
    speaking_input = input.get("speakingSkill")
    if speaking_input:
        speaking_skill = db.query(SpeakingSkill).filter(
            SpeakingSkill.skill_id == skill.id
        ).first()
        
        if not speaking_skill:
            speaking_skill = SpeakingSkill(skill_id=skill.id)
            db.add(speaking_skill)
        
        if "pronunciation" in speaking_input:
            speaking_skill.pronunciation = speaking_input["pronunciation"]
        if "fluency" in speaking_input:
            speaking_skill.fluency = speaking_input["fluency"]
        if "grammar" in speaking_input:
            speaking_skill.grammar = speaking_input["grammar"]
        if "vocabulary" in speaking_input:
            speaking_skill.vocabulary = speaking_input["vocabulary"]
        if "coherence" in speaking_input:
            speaking_skill.coherence = speaking_input["coherence"]
        
        speaking_skill.final_result = calculate_final_grade([
            speaking_skill.pronunciation,
            speaking_skill.fluency,
            speaking_skill.grammar,
            speaking_skill.vocabulary,
            speaking_skill.coherence
        ])
    
    # Update reading skill
    reading_input = input.get("readingSkill")
    if reading_input:
        reading_skill = db.query(ReadingSkill).filter(
            ReadingSkill.skill_id == skill.id
        ).first()
        
        if not reading_skill:
            reading_skill = ReadingSkill(skill_id=skill.id)
            db.add(reading_skill)
        
        if "comprehension" in reading_input:
            reading_skill.comprehension = reading_input["comprehension"]
        if "speed" in reading_input:
            reading_skill.speed = reading_input["speed"]
        if "vocabulary" in reading_input:
            reading_skill.vocabulary = reading_input["vocabulary"]
        
        reading_skill.final_result = calculate_final_grade([
            reading_skill.comprehension,
            reading_skill.speed,
            reading_skill.vocabulary
        ])
    
    # Update writing skill
    writing_input = input.get("writingSkill")
    if writing_input:
        writing_skill = db.query(WritingSkill).filter(
            WritingSkill.skill_id == skill.id
        ).first()
        
        if not writing_skill:
            writing_skill = WritingSkill(skill_id=skill.id)
            db.add(writing_skill)
        
        if "coherence" in writing_input:
            writing_skill.coherence = writing_input["coherence"]
        if "grammar" in writing_input:
            writing_skill.grammar = writing_input["grammar"]
        if "vocabulary" in writing_input:
            writing_skill.vocabulary = writing_input["vocabulary"]
        if "punctuation" in writing_input:
            writing_skill.punctuation = writing_input["punctuation"]
        
        writing_skill.final_result = calculate_final_grade([
            writing_skill.coherence,
            writing_skill.grammar,
            writing_skill.vocabulary,
            writing_skill.punctuation
        ])
    
    # Update listening skill
    listening_input = input.get("listeningSkill")
    if listening_input:
        listening_skill = db.query(ListeningSkill).filter(
            ListeningSkill.skill_id == skill.id
        ).first()
        
        if not listening_skill:
            listening_skill = ListeningSkill(skill_id=skill.id)
            db.add(listening_skill)
        
        if "comprehension" in listening_input:
            listening_skill.comprehension = listening_input["comprehension"]
        if "retention" in listening_input:
            listening_skill.retention = listening_input["retention"]
        if "interpretation" in listening_input:
            listening_skill.interpretation = listening_input["interpretation"]
        
        listening_skill.final_result = calculate_final_grade([
            listening_skill.comprehension,
            listening_skill.retention,
            listening_skill.interpretation
        ])
    
    # Recalculate final skill grade
    final_grades = []
    if speaking_input or skill.speaking_skill:
        final_grades.append(skill.speaking_skill.final_result if skill.speaking_skill else Grade.F)
    if reading_input or skill.reading_skill:
        final_grades.append(skill.reading_skill.final_result if skill.reading_skill else Grade.F)
    if writing_input or skill.writing_skill:
        final_grades.append(skill.writing_skill.final_result if skill.writing_skill else Grade.F)
    if listening_input or skill.listening_skill:
        final_grades.append(skill.listening_skill.final_result if skill.listening_skill else Grade.F)
    
    skill.final_result = calculate_final_grade(final_grades)
    skill.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(skill)
    
    return skill


@mutation.field("deleteSkill")
def resolve_delete_skill(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Only tutors and admins can delete skills
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        raise Exception("Unauthorized: Only admins and tutors can delete skills")
    
    skill = db.query(Skill).filter(
        Skill.id == id,
        Skill.is_deleted == False
    ).first()
    
    if not skill:
        raise Exception("Skill not found")
    
    # Verify user can delete this skill
    if current_user.role == UserRole.tutor and current_user.id != skill.instructor_id:
        raise Exception("Unauthorized: You can only delete skills you created")
    
    skill.is_deleted = True
    skill.deleted_at = datetime.utcnow()
    
    db.commit()
    
    return True


@mutation.field("sendExamLink")
def resolve_send_exam_link(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Only tutors and admins can send exam links
    if current_user.role not in [UserRole.admin, UserRole.tutor]:
        raise Exception("Unauthorized: Only admins and tutors can send exam links")
    
    enrollment_id = input["enrollmentId"]
    exam_date = input.get("examDate")
    
    # Verify enrollment exists
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == enrollment_id,
        BatchEnrollment.is_deleted == False
    ).first()
    
    if not enrollment:
        raise Exception("Enrollment not found")
    
    # Get the student user
    from ..model.student_profile import StudentProfile
    student_user = db.query(StudentProfile).filter(
        StudentProfile.id == enrollment.profile_id,
        StudentProfile.is_deleted == False
    ).options(
        joinedload(StudentProfile.user)
    ).first()
    
    # Create the exam link
    exam_link = f"https://meet.jit.si/{enrollment_id}"
    
    # Format exam date for notification
    exam_date_str = ""
    if exam_date:
        exam_date_str = f" on {exam_date}"
    
    # Send notification to student and tutor
    student_title = "Exam Link Available"
    student_content = f"Your exam link is ready{exam_date_str}. Please use the following link to join your exam: {exam_link}"
    send_notification(student_user.user.id, student_title, student_content, db)
    
    tutor_title = "Exam Link Sent to Student"
    tutor_content = f"Exam link has been sent to student {student_user.user.first_name} {student_user.user.last_name}{exam_date_str}. Exam link: {exam_link}"
    send_notification(current_user.id, tutor_title, tutor_content, db)

    return True


@skill.field("enrollmentId")
def resolve_enrollment(skill_obj, info):
    return skill_obj.enrollment_id


@skill.field("instructorId")
def resolve_enrollment(skill_obj, info):
    return skill_obj.instructor_id


@skill.field("enrollment")
def resolve_enrollment(skill_obj, info):
    db: Session = info.context["db"]
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == skill_obj.enrollment_id,
        BatchEnrollment.is_deleted == False
    ).first()
    return enrollment


@skill.field("instructor")
def resolve_instructor(skill_obj, info):
    db: Session = info.context["db"]
    instructor = db.query(User).filter(
        User.id == skill_obj.instructor_id,
        User.is_deleted == False
    ).first()
    return instructor


@skill.field("speakingSkill")
def resolve_speaking_skill(skill_obj, info):
    db: Session = info.context["db"]
    speaking_skill = db.query(SpeakingSkill).filter(
        SpeakingSkill.skill_id == skill_obj.id
    ).first()
    return speaking_skill


@skill.field("readingSkill")
def resolve_reading_skill(skill_obj, info):
    db: Session = info.context["db"]
    reading_skill = db.query(ReadingSkill).filter(
        ReadingSkill.skill_id == skill_obj.id
    ).first()
    return reading_skill


@skill.field("writingSkill")
def resolve_writing_skill(skill_obj, info):
    db: Session = info.context["db"]
    writing_skill = db.query(WritingSkill).filter(
        WritingSkill.skill_id == skill_obj.id
    ).first()
    return writing_skill


@skill.field("listeningSkill")
def resolve_listening_skill(skill_obj, info):
    db: Session = info.context["db"]
    listening_skill = db.query(ListeningSkill).filter(
        ListeningSkill.skill_id == skill_obj.id
    ).first()
    return listening_skill


@skill.field("certificate")
def resolve_certificate(skill_obj, info):
    db: Session = info.context["db"]
    certificate = db.query(Certificate).filter(
        Certificate.skill_id == skill_obj.id,
        Certificate.is_deleted == False
    ).first()
    return certificate


@skill.field("finalResult")
def resolve_final_result(skill_obj, info):
    return skill_obj.final_result.value if skill_obj.final_result else None


@skill.field("createdAt")
def resolve_created_at(skill_obj, info):
    return skill_obj.created_at


@skill.field("updatedAt")
def resolve_updated_at(skill_obj, info):
    return skill_obj.updated_at


@skill.field("isDeleted")
def resolve_is_deleted(skill_obj, info):
    return skill_obj.is_deleted


@skill.field("deletedAt")
def resolve_deleted_at(skill_obj, info):
    return skill_obj.deleted_at