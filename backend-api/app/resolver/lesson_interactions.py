from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.lesson_interactions import LessonInteractions
from ..model.modules import Modules
from ..model.module_lessons import ModuleLessons
from ..model.student_profile import StudentProfile
from ..model.user import User, UserRole
from ..util.ai_service.lesson_interaction import ask_on_lesson

query = QueryType()
mutation = MutationType()
lesson_interactions = ObjectType("LessonInteractions")


@query.field("lessonInteractions")
def resolve_lesson_interactions(_, info, lessonId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if the lesson exists and user has access
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == lessonId, ModuleLessons.is_deleted == False)
        .first()
    )

    if not lesson:
        raise Exception("Lesson not found")

    # Check ownership through profile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == lesson.module.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    interactions = (
        db.query(LessonInteractions)
        .filter(
            LessonInteractions.lesson_id == lessonId,
            LessonInteractions.is_deleted == False,
        )
        .order_by(LessonInteractions.created_at)
        .all()
    )

    return interactions


@query.field("lessonInteraction")
def resolve_lesson_interaction(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    interaction = (
        db.query(LessonInteractions)
        .filter(LessonInteractions.id == id, LessonInteractions.is_deleted == False)
        .first()
    )

    if not interaction:
        raise Exception("Lesson interaction not found")

    # Check ownership through lesson and profile
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == interaction.lesson_id)
        .first()
    )

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == lesson.module.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    return interaction


@mutation.field("createLessonInteraction")
def resolve_create_lesson_interaction(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if the lesson exists and user has access
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == input["lessonId"], ModuleLessons.is_deleted == False)
        .first()
    )

    if not lesson:
        raise Exception("Lesson not found")

    module = (
        db.query(Modules)
        .filter(Modules.id == lesson.module_id, Modules.is_deleted == False)
        .first()
    )

    if not lesson:
        raise Exception("Module not found")

    # Check ownership through profile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == lesson.module.profile_id)
        .first()
    )

    prev_lesson_interactions = (
        db.query(LessonInteractions)
        .filter(LessonInteractions.lesson_id == lesson.id, LessonInteractions.is_deleted == False)
        .all()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    answer = ask_on_lesson(input["question"], profile, module, lesson, prev_lesson_interactions)

    # Create interaction
    interaction = LessonInteractions(
        lesson_id=input["lessonId"],
        question=input["question"],
        answer=answer
    )

    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return interaction


@mutation.field("deleteLessonInteraction")
def resolve_delete_lesson_interaction(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    interaction = (
        db.query(LessonInteractions)
        .filter(LessonInteractions.id == id, LessonInteractions.is_deleted == False)
        .first()
    )

    if not interaction:
        raise Exception("Lesson interaction not found")

    # Check ownership through lesson and profile
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == interaction.lesson_id)
        .first()
    )

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == lesson.module.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    interaction.is_deleted = True
    interaction.deleted_at = datetime.utcnow()
    db.commit()

    return True


@lesson_interactions.field("id")
def resolve_id(interaction, info):
    return interaction.id


@lesson_interactions.field("lessonId")
def resolve_lesson_id(interaction, info):
    return interaction.lesson_id


@lesson_interactions.field("question")
def resolve_question(interaction, info):
    return interaction.question


@lesson_interactions.field("answer")
def resolve_answer(interaction, info):
    return interaction.answer


@lesson_interactions.field("createdAt")
def resolve_created_at(interaction, info):
    return interaction.created_at


@lesson_interactions.field("updatedAt")
def resolve_updated_at(interaction, info):
    return interaction.updated_at


@lesson_interactions.field("isDeleted")
def resolve_is_deleted(interaction, info):
    return interaction.is_deleted


@lesson_interactions.field("deletedAt")
def resolve_deleted_at(interaction, info):
    return interaction.deleted_at


@lesson_interactions.field("lesson")
def resolve_lesson(interaction, info):
    db: Session = info.context["db"]
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == interaction.lesson_id)
        .first()
    )
    return lesson
