from app.model.lesson_online_articles import LessonOnlineArticles
from app.model.module_lessons import ModuleLessons
from app.model.modules import Modules
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT
from seeds.lesson_seed_helpers import SEED_MODULE_PREFIX, load_seeded_lessons

SEED_ARTICLE_PREFIX = "Seed Article"


def _load_seeded_articles(db):
    return (
        db.query(LessonOnlineArticles)
        .join(ModuleLessons, LessonOnlineArticles.lesson_id == ModuleLessons.id)
        .join(Modules, ModuleLessons.module_id == Modules.id)
        .join(StudentProfile, Modules.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(LessonOnlineArticles.title.like(f"{SEED_ARTICLE_PREFIX}%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_lesson_online_articles(db, lesson_ids=None):
    """Seed 25 online article links (one per seeded lesson)."""
    existing = _load_seeded_articles(db)
    if len(existing) >= SEED_COUNT:
        return [a.id for a in existing]

    lessons = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id.in_(lesson_ids[:SEED_COUNT]))
        .all()
        if lesson_ids
        else load_seeded_lessons(db)
    )

    article_topics = [
        "English Grammar Guide",
        "IELTS Reading Tips",
        "Business Email Etiquette",
        "TOEFL Listening Strategies",
        "Academic Writing Overview",
        "Pronunciation for Beginners",
        "Travel Phrases Handbook",
        "Interview Preparation",
        "News English Practice",
        "Storytelling Techniques",
        "Debate & Argumentation",
        "STEM Vocabulary",
        "Medical English Basics",
        "Legal English Intro",
        "Creative Writing Prompts",
        "Public Speaking Skills",
        "Cross-Cultural Communication",
        "Idioms in Context",
        "Email Templates",
        "Presentation Design",
        "Listening Comprehension",
        "Vocabulary Building",
        "Grammar Mistakes to Avoid",
        "Fluency Exercises",
        "Capstone Study Guide",
    ]

    existing_lesson_ids = {a.lesson_id for a in existing}
    articles_to_add = []

    for i, lesson in enumerate(lessons[:SEED_COUNT]):
        if lesson.id in existing_lesson_ids:
            continue
        slug = article_topics[i].lower().replace(" ", "-")
        articles_to_add.append(
            LessonOnlineArticles(
                lesson_id=lesson.id,
                title=f"{SEED_ARTICLE_PREFIX}: {article_topics[i]}",
                favicon_url=f"https://fidel.seed.local/favicons/{i + 1:02d}.ico",
                description=f"Supplementary reading for lesson {i + 1}.",
                page_url=f"https://learn.fidel.seed.local/articles/{slug}",
            )
        )

    if articles_to_add:
        db.add_all(articles_to_add)
        db.flush()

    return [a.id for a in _load_seeded_articles(db)]
