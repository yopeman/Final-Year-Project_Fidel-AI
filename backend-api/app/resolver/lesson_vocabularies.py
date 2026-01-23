from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.lesson_vocabularies import LessonVocabularies
from ..model.module_lessons import ModuleLessons
from ..model.modules import Modules
from ..model.user import User, UserRole

query = QueryType()
mutation = MutationType()
lesson_vocabularies = ObjectType("LessonVocabularies")


@query.field("vocabularies")
def resolve_vocabularies(_, info, lessonId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Get the lesson to check ownership
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == lessonId, ModuleLessons.is_deleted == False)
        .first()
    )

    if not lesson:
        raise Exception("Lesson not found")

    # Check ownership through module and profile
    module = (
        db.query(Modules)
        .filter(Modules.id == lesson.module_id)
        .first()
    )

    from ..model.student_profile import StudentProfile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == module.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    vocabularies = (
        db.query(LessonVocabularies)
        .filter(LessonVocabularies.lesson_id == lessonId, LessonVocabularies.is_deleted == False)
        .all()
    )

    return vocabularies


@query.field("vocabulary")
def resolve_vocabulary(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    vocabulary = (
        db.query(LessonVocabularies)
        .filter(LessonVocabularies.id == id, LessonVocabularies.is_deleted == False)
        .first()
    )

    if not vocabulary:
        raise Exception("Vocabulary not found")

    # Check ownership through lesson, module and profile
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == vocabulary.lesson_id)
        .first()
    )

    module = (
        db.query(Modules)
        .filter(Modules.id == lesson.module_id)
        .first()
    )

    from ..model.student_profile import StudentProfile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == module.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    return vocabulary


@mutation.field("updateVocabulary")
def resolve_update_vocabulary(_, info, id: str, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    vocabulary = (
        db.query(LessonVocabularies)
        .filter(LessonVocabularies.id == id, LessonVocabularies.is_deleted == False)
        .first()
    )

    if not vocabulary:
        raise Exception("Vocabulary not found")

    # Check ownership
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == vocabulary.lesson_id)
        .first()
    )

    module = (
        db.query(Modules)
        .filter(Modules.id == lesson.module_id)
        .first()
    )

    from ..model.student_profile import StudentProfile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == module.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    # Update fields if provided
    if "vocabulary" in input:
        vocabulary.vocabulary = input["vocabulary"]
    if "meaning" in input:
        vocabulary.meaning = input["meaning"]
    if "description" in input:
        vocabulary.description = input["description"]

    db.commit()
    db.refresh(vocabulary)

    return vocabulary


@mutation.field("deleteVocabulary")
def resolve_delete_vocabulary(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    vocabulary = (
        db.query(LessonVocabularies)
        .filter(LessonVocabularies.id == id, LessonVocabularies.is_deleted == False)
        .first()
    )

    if not vocabulary:
        raise Exception("Vocabulary not found")

    # Check ownership
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == vocabulary.lesson_id)
        .first()
    )

    module = (
        db.query(Modules)
        .filter(Modules.id == lesson.module_id)
        .first()
    )

    from ..model.student_profile import StudentProfile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == module.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    vocabulary.is_deleted = True
    vocabulary.deleted_at = datetime.utcnow()
    db.commit()

    return True


@lesson_vocabularies.field("id")
def resolve_id(vocabulary, info):
    return vocabulary.id


@lesson_vocabularies.field("lessonId")
def resolve_lesson_id(vocabulary, info):
    return vocabulary.lesson_id


@lesson_vocabularies.field("vocabulary")
def resolve_vocabulary_field(vocabulary, info):
    return vocabulary.vocabulary


@lesson_vocabularies.field("meaning")
def resolve_meaning(vocabulary, info):
    return vocabulary.meaning


@lesson_vocabularies.field("description")
def resolve_description(vocabulary, info):
    return vocabulary.description


@lesson_vocabularies.field("createdAt")
def resolve_created_at(vocabulary, info):
    return vocabulary.created_at


@lesson_vocabularies.field("updatedAt")
def resolve_updated_at(vocabulary, info):
    return vocabulary.updated_at


@lesson_vocabularies.field("isDeleted")
def resolve_is_deleted(vocabulary, info):
    return vocabulary.is_deleted


@lesson_vocabularies.field("deletedAt")
def resolve_deleted_at(vocabulary, info):
    return vocabulary.deleted_at


@lesson_vocabularies.field("lesson")
def resolve_lesson(vocabulary, info):
    db: Session = info.context["db"]
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == vocabulary.lesson_id)
        .first()
    )
    return lesson
