from app.model.lesson_youtube_videos import LessonYouTubeVideos
from app.model.module_lessons import ModuleLessons
from app.model.modules import Modules
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT
from seeds.lesson_seed_helpers import SEED_MODULE_PREFIX, load_seeded_lessons

SEED_VIDEO_PREFIX = "Seed Video"


def _load_seeded_videos(db):
    return (
        db.query(LessonYouTubeVideos)
        .join(ModuleLessons, LessonYouTubeVideos.lesson_id == ModuleLessons.id)
        .join(Modules, ModuleLessons.module_id == Modules.id)
        .join(StudentProfile, Modules.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(LessonYouTubeVideos.title.like(f"{SEED_VIDEO_PREFIX}%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_lesson_youtube_videos(db, lesson_ids=None):
    """Seed 25 YouTube video links (one per seeded lesson)."""
    existing = _load_seeded_videos(db)
    if len(existing) >= SEED_COUNT:
        return [v.id for v in existing]

    lessons = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id.in_(lesson_ids[:SEED_COUNT]))
        .all()
        if lesson_ids
        else load_seeded_lessons(db)
    )

    video_topics = [
        "English Basics Explained",
        "Conversation Starters",
        "Listening Practice A1",
        "Listening Practice B1",
        "Pronunciation Masterclass",
        "Grammar in 10 Minutes",
        "Writing Better Emails",
        "IELTS Speaking Demo",
        "TOEFL Tips & Tricks",
        "Business Meeting English",
        "Travel English Phrases",
        "Academic Lecture Skills",
        "Storytelling in English",
        "Debate Techniques",
        "STEM English Vocabulary",
        "Medical English Overview",
        "Creative Writing Workshop",
        "Public Speaking Confidence",
        "Idioms Made Easy",
        "Fluency Drills",
        "Interview English",
        "News English Analysis",
        "Presentation Skills",
        "Capstone Review Session",
        "Course Wrap-Up & Next Steps",
    ]

    existing_lesson_ids = {v.lesson_id for v in existing}
    videos_to_add = []

    for i, lesson in enumerate(lessons[:SEED_COUNT]):
        if lesson.id in existing_lesson_ids:
            continue
        video_id = f"seed{i + 1:02d}abc"
        videos_to_add.append(
            LessonYouTubeVideos(
                lesson_id=lesson.id,
                title=f"{SEED_VIDEO_PREFIX}: {video_topics[i]}",
                thumbnail_url=f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                description=f"Video resource for lesson {i + 1}.",
                video_url=f"https://www.youtube.com/watch?v={video_id}",
            )
        )

    if videos_to_add:
        db.add_all(videos_to_add)
        db.flush()

    return [v.id for v in _load_seeded_videos(db)]
