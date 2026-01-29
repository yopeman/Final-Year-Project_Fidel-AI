from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.module_lessons import ModuleLessons
from ..model.modules import Modules
from ..model.user import User, UserRole

query = QueryType()
mutation = MutationType()
module_lessons = ObjectType("ModuleLessons")


@query.field("lessons")
def resolve_lessons(_, info, moduleId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Get the module to check ownership
    module = (
        db.query(Modules)
        .filter(Modules.id == moduleId, Modules.is_deleted == False)
        .first()
    )

    if not module:
        raise Exception("Module not found")

    # Check ownership through profile
    from ..model.student_profile import StudentProfile

    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    lessons = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.module_id == moduleId, ModuleLessons.is_deleted == False)
        .order_by(ModuleLessons.display_order)
        .all()
    )

    return lessons


@query.field("lesson")
def resolve_lesson(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == id, ModuleLessons.is_deleted == False)
        .first()
    )

    if not lesson:
        raise Exception("Lesson not found")

    # Check ownership through module and profile
    module = db.query(Modules).filter(Modules.id == lesson.module_id).first()

    from ..model.student_profile import StudentProfile

    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    return lesson


@mutation.field("completeLesson")
def resolve_complete_lesson(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == id, ModuleLessons.is_deleted == False)
        .first()
    )

    if not lesson:
        raise Exception("Lesson not found")

    # Check ownership
    module = (
        db.query(Modules)
        .filter(Modules.id == lesson.module_id, Modules.is_deleted == False)
        .first()
    )

    from ..model.student_profile import StudentProfile

    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    lesson.is_completed = True
    db.commit()
    db.refresh(lesson)

    next_lesson = (
        db.query(ModuleLessons)
        .filter(
            ModuleLessons.module_id == module.id,
            ModuleLessons.display_order == (lesson.display_order + 1),
            ModuleLessons.is_deleted == False,
        )
        .first()
    )

    if not next_lesson:
        next_module = (
            db.query(Modules)
            .filter(
                Modules.profile_id == module.profile_id,
                Modules.display_order == (module.display_order + 1),
                Modules.is_deleted == False,
            )
            .first()
        )
        next_module.is_locked = False
        db.commit()
        db.refresh(next_module)

    return lesson


@mutation.field("updateLesson")
def resolve_update_lesson(_, info, id: str, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == id, ModuleLessons.is_deleted == False)
        .first()
    )

    if not lesson:
        raise Exception("Lesson not found")

    # Check ownership
    module = db.query(Modules).filter(Modules.id == lesson.module_id).first()

    from ..model.student_profile import StudentProfile

    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    # Update fields if provided
    if "title" in input:
        lesson.title = input["title"]
    if "content" in input:
        lesson.content = input["content"]
    if "displayOrder" in input:
        lesson.display_order = input["displayOrder"]
    if "isCompleted" in input:
        lesson.is_completed = input["isCompleted"]
    if "isLocked" in input:
        lesson.is_locked = input["isLocked"]

    db.commit()
    db.refresh(lesson)

    return lesson


@mutation.field("deleteLesson")
def resolve_delete_lesson(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == id, ModuleLessons.is_deleted == False)
        .first()
    )

    if not lesson:
        raise Exception("Lesson not found")

    # Check ownership
    module = db.query(Modules).filter(Modules.id == lesson.module_id).first()

    from ..model.student_profile import StudentProfile

    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    lesson.is_deleted = True
    lesson.deleted_at = datetime.utcnow()
    db.commit()

    return True


@module_lessons.field("id")
def resolve_id(lesson, info):
    return lesson.id


@module_lessons.field("moduleId")
def resolve_module_id(lesson, info):
    return lesson.module_id


@module_lessons.field("title")
def resolve_title(lesson, info):
    return lesson.title


@module_lessons.field("content")
def resolve_content(lesson, info):
    return lesson.content


@module_lessons.field("displayOrder")
def resolve_display_order(lesson, info):
    return lesson.display_order


@module_lessons.field("isCompleted")
def resolve_is_completed(lesson, info):
    return lesson.is_completed


@module_lessons.field("isLocked")
def resolve_is_locked(lesson, info):
    return lesson.is_locked


@module_lessons.field("createdAt")
def resolve_created_at(lesson, info):
    return lesson.created_at


@module_lessons.field("updatedAt")
def resolve_updated_at(lesson, info):
    return lesson.updated_at


@module_lessons.field("isDeleted")
def resolve_is_deleted(lesson, info):
    return lesson.is_deleted


@module_lessons.field("deletedAt")
def resolve_deleted_at(lesson, info):
    return lesson.deleted_at


@module_lessons.field("module")
def resolve_module(lesson, info):
    db: Session = info.context["db"]
    module = db.query(Modules).filter(Modules.id == lesson.module_id).first()
    return module


@module_lessons.field("vocabularies")
def resolve_vocabularies(lesson, info):
    db: Session = info.context["db"]
    from ..model.lesson_vocabularies import LessonVocabularies

    vocabularies = (
        db.query(LessonVocabularies)
        .filter(
            LessonVocabularies.lesson_id == lesson.id,
            LessonVocabularies.is_deleted == False,
        )
        .all()
    )
    return vocabularies


@module_lessons.field("onlineArticles")
def resolve_online_articles(lesson, info):
    db: Session = info.context["db"]
    from ..model.lesson_online_articles import LessonOnlineArticles

    articles = (
        db.query(LessonOnlineArticles)
        .filter(
            LessonOnlineArticles.lesson_id == lesson.id,
            LessonOnlineArticles.is_deleted == False,
        )
        .all()
    )
    return articles


@module_lessons.field("youtubeVideos")
def resolve_youtube_videos(lesson, info):
    db: Session = info.context["db"]
    from ..model.lesson_youtube_videos import LessonYouTubeVideos

    videos = (
        db.query(LessonYouTubeVideos)
        .filter(
            LessonYouTubeVideos.lesson_id == lesson.id,
            LessonYouTubeVideos.is_deleted == False,
        )
        .all()
    )
    return videos


@module_lessons.field("interactions")
def resolve_interactions(lesson, info):
    db: Session = info.context["db"]
    from ..model.lesson_interactions import LessonInteractions

    interactions = (
        db.query(LessonInteractions)
        .filter(
            LessonInteractions.lesson_id == lesson.id,
            LessonInteractions.is_deleted == False,
        )
        .all()
    )
    return interactions


@query.field("studentProgress")
def resolve_get_student_progress(_, info, studentId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if current user is admin or the student themselves
    if current_user.role != UserRole.admin and current_user.id != studentId:
        raise Exception("Unauthorized")

    # Get all modules and lessons for the student
    from ..model.modules import Modules
    from ..model.student_profile import StudentProfile

    # Find student profile
    profile = (
        db.query(StudentProfile).filter(StudentProfile.user_id == studentId).first()
    )

    if not profile:
        raise Exception("Student profile not found")

    # Get all modules for this student
    modules = (
        db.query(Modules)
        .filter(Modules.profile_id == profile.id, Modules.is_deleted == False)
        .all()
    )

    total_modules = len(modules)
    # Get all lessons for these modules
    lessons = (
        db.query(ModuleLessons)
        .filter(
            ModuleLessons.module_id.in_([module.id for module in modules]),
            ModuleLessons.is_deleted == False,
        )
        .all()
    )

    total_lessons = len(lessons)
    completed_lessons = sum(1 for lesson in lessons if lesson.is_completed)
    remaining_lessons = total_lessons - completed_lessons
    progress_percentage = (
        (completed_lessons * 100 // total_lessons) if total_lessons > 0 else 0
    )

    return {
        "totalModules": total_modules,
        "totalLessons": total_lessons,
        "completedLessons": completed_lessons,
        "remainingLessons": remaining_lessons,
        "progressPercentage": progress_percentage,
    }


@query.field("myProgress")
def resolve_get_my_progress(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Get the current user's progress
    return resolve_get_student_progress(_, info, current_user.id)
