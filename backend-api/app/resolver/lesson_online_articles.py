from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.lesson_online_articles import LessonOnlineArticles
from ..model.module_lessons import ModuleLessons
from ..model.modules import Modules
from ..model.user import User, UserRole

query = QueryType()
mutation = MutationType()
lesson_online_articles = ObjectType("LessonOnlineArticles")


@query.field("articles")
def resolve_articles(_, info, lessonId: str):
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

    articles = (
        db.query(LessonOnlineArticles)
        .filter(LessonOnlineArticles.lesson_id == lessonId, LessonOnlineArticles.is_deleted == False)
        .all()
    )

    return articles


@query.field("article")
def resolve_article(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    article = (
        db.query(LessonOnlineArticles)
        .filter(LessonOnlineArticles.id == id, LessonOnlineArticles.is_deleted == False)
        .first()
    )

    if not article:
        raise Exception("Article not found")

    # Check ownership through lesson, module and profile
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == article.lesson_id)
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

    return article


@mutation.field("updateArticle")
def resolve_update_article(_, info, id: str, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    article = (
        db.query(LessonOnlineArticles)
        .filter(LessonOnlineArticles.id == id, LessonOnlineArticles.is_deleted == False)
        .first()
    )

    if not article:
        raise Exception("Article not found")

    # Check ownership
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == article.lesson_id)
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
    if "title" in input:
        article.title = input["title"]
    if "faviconUrl" in input:
        article.favicon_url = input["faviconUrl"]
    if "description" in input:
        article.description = input["description"]
    if "pageUrl" in input:
        article.page_url = input["pageUrl"]

    db.commit()
    db.refresh(article)

    return article


@mutation.field("deleteArticle")
def resolve_delete_article(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    article = (
        db.query(LessonOnlineArticles)
        .filter(LessonOnlineArticles.id == id, LessonOnlineArticles.is_deleted == False)
        .first()
    )

    if not article:
        raise Exception("Article not found")

    # Check ownership
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == article.lesson_id)
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

    article.is_deleted = True
    article.deleted_at = datetime.utcnow()
    db.commit()

    return True


@lesson_online_articles.field("id")
def resolve_id(article, info):
    return article.id


@lesson_online_articles.field("lessonId")
def resolve_lesson_id(article, info):
    return article.lesson_id


@lesson_online_articles.field("title")
def resolve_title(article, info):
    return article.title


@lesson_online_articles.field("faviconUrl")
def resolve_favicon_url(article, info):
    return article.favicon_url


@lesson_online_articles.field("description")
def resolve_description(article, info):
    return article.description


@lesson_online_articles.field("pageUrl")
def resolve_page_url(article, info):
    return article.page_url


@lesson_online_articles.field("createdAt")
def resolve_created_at(article, info):
    return article.created_at


@lesson_online_articles.field("updatedAt")
def resolve_updated_at(article, info):
    return article.updated_at


@lesson_online_articles.field("isDeleted")
def resolve_is_deleted(article, info):
    return article.is_deleted


@lesson_online_articles.field("deletedAt")
def resolve_deleted_at(article, info):
    return article.deleted_at


@lesson_online_articles.field("lesson")
def resolve_lesson(article, info):
    db: Session = info.context["db"]
    lesson = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id == article.lesson_id)
        .first()
    )
    return lesson
