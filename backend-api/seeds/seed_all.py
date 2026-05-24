"""Run all seed modules in foreign-key dependency order."""

from seeds.seed_attendances import seed_attendances
from seeds.seed_batch_community import seed_batch_community
from seeds.seed_batch_courses import seed_batch_courses
from seeds.seed_batch_enrollments import seed_batch_enrollments
from seeds.seed_batch_instructors import seed_batch_instructors
from seeds.seed_batches import seed_batches
from seeds.seed_certificates import seed_certificates
from seeds.seed_comment_reactions import seed_comment_reactions
from seeds.seed_community_attachment_files import seed_community_attachment_files
from seeds.seed_community_comments import seed_community_comments
from seeds.seed_community_reactions import seed_community_reactions
from seeds.seed_conversation_interactions import seed_conversation_interactions
from seeds.seed_course_materials import seed_course_materials
from seeds.seed_course_schedules import seed_course_schedules
from seeds.seed_courses import seed_courses
from seeds.seed_feedbacks import seed_feedbacks
from seeds.seed_free_conversations import seed_free_conversations
from seeds.seed_lesson_interactions import seed_lesson_interactions
from seeds.seed_lesson_online_articles import seed_lesson_online_articles
from seeds.seed_lesson_vocabularies import seed_lesson_vocabularies
from seeds.seed_lesson_youtube_videos import seed_lesson_youtube_videos
from seeds.seed_listening_skills import seed_listening_skills
from seeds.seed_material_files import seed_material_files
from seeds.seed_module_lessons import seed_module_lessons
from seeds.seed_modules import seed_modules
from seeds.seed_notifications import seed_notifications
from seeds.seed_payments import seed_payments
from seeds.seed_reading_skills import seed_reading_skills
from seeds.seed_schedules import seed_schedules
from seeds.seed_skills import seed_skills
from seeds.seed_speaking_skills import seed_speaking_skills
from seeds.seed_student_profiles import seed_student_profiles
from seeds.seed_users import seed_users
from seeds.seed_verification_codes import seed_verification_codes
from seeds.seed_writing_skills import seed_writing_skills


def seed_all(db):
    """Seed the database. Each step may return IDs for downstream seeders."""
    ctx = {}

    ctx["users"] = seed_users(db)
    ctx["student_profiles"] = seed_student_profiles(db, ctx.get("users"))
    ctx["verification_codes"] = seed_verification_codes(db, ctx.get("users"))

    ctx["courses"] = seed_courses(db)
    ctx["course_materials"] = seed_course_materials(db, ctx.get("courses"))
    ctx["material_files"] = seed_material_files(db, ctx.get("course_materials"))

    ctx["schedules"] = seed_schedules(db)
    ctx["batches"] = seed_batches(db)
    ctx["batch_courses"] = seed_batch_courses(db, ctx.get("batches"), ctx.get("courses"))
    ctx["batch_instructors"] = seed_batch_instructors(
        db, ctx.get("users"), ctx.get("batch_courses")
    )
    ctx["course_schedules"] = seed_course_schedules(
        db, ctx.get("schedules"), ctx.get("batch_courses")
    )

    ctx["batch_enrollments"] = seed_batch_enrollments(
        db, ctx.get("student_profiles"), ctx.get("batches")
    )
    ctx["payments"] = seed_payments(db, ctx.get("batch_enrollments"))

    ctx["skills"] = seed_skills(db, ctx.get("batch_enrollments"), ctx.get("users"))
    ctx["speaking_skills"] = seed_speaking_skills(db, ctx.get("skills"))
    ctx["reading_skills"] = seed_reading_skills(db, ctx.get("skills"))
    ctx["writing_skills"] = seed_writing_skills(db, ctx.get("skills"))
    ctx["listening_skills"] = seed_listening_skills(db, ctx.get("skills"))
    ctx["certificates"] = seed_certificates(db, ctx.get("skills"))

    ctx["modules"] = seed_modules(db, ctx.get("student_profiles"))
    ctx["module_lessons"] = seed_module_lessons(db, ctx.get("modules"))
    ctx["lesson_vocabularies"] = seed_lesson_vocabularies(db, ctx.get("module_lessons"))
    ctx["lesson_online_articles"] = seed_lesson_online_articles(
        db, ctx.get("module_lessons")
    )
    ctx["lesson_youtube_videos"] = seed_lesson_youtube_videos(
        db, ctx.get("module_lessons")
    )
    ctx["lesson_interactions"] = seed_lesson_interactions(db, ctx.get("module_lessons"))

    ctx["free_conversations"] = seed_free_conversations(db, ctx.get("student_profiles"))
    ctx["conversation_interactions"] = seed_conversation_interactions(
        db, ctx.get("free_conversations")
    )

    ctx["batch_community"] = seed_batch_community(db, ctx.get("batches"), ctx.get("users"))
    ctx["community_reactions"] = seed_community_reactions(
        db, ctx.get("batch_community"), ctx.get("users")
    )
    ctx["community_comments"] = seed_community_comments(
        db, ctx.get("batch_community"), ctx.get("users")
    )
    ctx["community_attachment_files"] = seed_community_attachment_files(
        db, ctx.get("batch_community")
    )
    ctx["comment_reactions"] = seed_comment_reactions(
        db, ctx.get("community_comments"), ctx.get("users")
    )

    ctx["feedbacks"] = seed_feedbacks(db, ctx.get("users"))
    ctx["notifications"] = seed_notifications(db, ctx.get("users"))
    ctx["attendances"] = seed_attendances(
        db, ctx.get("course_schedules"), ctx.get("users")
    )

    db.commit()
    return ctx
