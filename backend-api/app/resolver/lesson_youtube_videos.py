from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.lesson_youtube_videos import LessonYouTubeVideos
from ..model.module_lessons import ModuleLessons
from ..model.modules import Modules
from ..model.user import User, UserRole

query = QueryType()
mutation = MutationType()
lesson_youtube_videos = ObjectType("LessonYouTubeVideos")


@query.field("videos")
def resolve_videos(_, info, lessonId: str):
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
    module = db.query(Modules).filter(Modules.id == lesson.module_id).first()

    from ..model.student_profile import StudentProfile

    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    videos = (
        db.query(LessonYouTubeVideos)
        .filter(
            LessonYouTubeVideos.lesson_id == lessonId,
            LessonYouTubeVideos.is_deleted == False,
        )
        .all()
    )

    return videos


@query.field("video")
def resolve_video(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    video = (
        db.query(LessonYouTubeVideos)
        .filter(LessonYouTubeVideos.id == id, LessonYouTubeVideos.is_deleted == False)
        .first()
    )

    if not video:
        raise Exception("Video not found")

    # Check ownership through lesson, module and profile
    lesson = db.query(ModuleLessons).filter(ModuleLessons.id == video.lesson_id).first()

    module = db.query(Modules).filter(Modules.id == lesson.module_id).first()

    from ..model.student_profile import StudentProfile

    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    return video


@mutation.field("updateVideo")
def resolve_update_video(_, info, id: str, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    video = (
        db.query(LessonYouTubeVideos)
        .filter(LessonYouTubeVideos.id == id, LessonYouTubeVideos.is_deleted == False)
        .first()
    )

    if not video:
        raise Exception("Video not found")

    # Check ownership
    lesson = db.query(ModuleLessons).filter(ModuleLessons.id == video.lesson_id).first()

    module = db.query(Modules).filter(Modules.id == lesson.module_id).first()

    from ..model.student_profile import StudentProfile

    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    # Update fields if provided
    if "title" in input:
        video.title = input["title"]
    if "thumbnailUrl" in input:
        video.thumbnail_url = input["thumbnailUrl"]
    if "description" in input:
        video.description = input["description"]
    if "videoUrl" in input:
        video.video_url = input["videoUrl"]

    db.commit()
    db.refresh(video)

    return video


@mutation.field("deleteVideo")
def resolve_delete_video(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    video = (
        db.query(LessonYouTubeVideos)
        .filter(LessonYouTubeVideos.id == id, LessonYouTubeVideos.is_deleted == False)
        .first()
    )

    if not video:
        raise Exception("Video not found")

    # Check ownership
    lesson = db.query(ModuleLessons).filter(ModuleLessons.id == video.lesson_id).first()

    module = db.query(Modules).filter(Modules.id == lesson.module_id).first()

    from ..model.student_profile import StudentProfile

    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    video.is_deleted = True
    video.deleted_at = datetime.utcnow()
    db.commit()

    return True


@lesson_youtube_videos.field("id")
def resolve_id(video, info):
    return video.id


@lesson_youtube_videos.field("lessonId")
def resolve_lesson_id(video, info):
    return video.lesson_id


@lesson_youtube_videos.field("title")
def resolve_title(video, info):
    return video.title


@lesson_youtube_videos.field("thumbnailUrl")
def resolve_thumbnail_url(video, info):
    return video.thumbnail_url


@lesson_youtube_videos.field("description")
def resolve_description(video, info):
    return video.description


@lesson_youtube_videos.field("videoUrl")
def resolve_video_url(video, info):
    return video.video_url


@lesson_youtube_videos.field("createdAt")
def resolve_created_at(video, info):
    return video.created_at


@lesson_youtube_videos.field("updatedAt")
def resolve_updated_at(video, info):
    return video.updated_at


@lesson_youtube_videos.field("isDeleted")
def resolve_is_deleted(video, info):
    return video.is_deleted


@lesson_youtube_videos.field("deletedAt")
def resolve_deleted_at(video, info):
    return video.deleted_at


@lesson_youtube_videos.field("lesson")
def resolve_lesson(video, info):
    db: Session = info.context["db"]
    lesson = db.query(ModuleLessons).filter(ModuleLessons.id == video.lesson_id).first()
    return lesson
