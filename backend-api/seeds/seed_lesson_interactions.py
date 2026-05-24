from app.model.lesson_interactions import LessonInteractions
from app.model.module_lessons import ModuleLessons
from app.model.modules import Modules
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT
from seeds.lesson_seed_helpers import SEED_MODULE_PREFIX, load_seeded_lessons

SEED_INTERACTION_PREFIX = "seed-qa"


def _load_seeded_interactions(db):
    return (
        db.query(LessonInteractions)
        .join(ModuleLessons, LessonInteractions.lesson_id == ModuleLessons.id)
        .join(Modules, ModuleLessons.module_id == Modules.id)
        .join(StudentProfile, Modules.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(LessonInteractions.student_question.like(f"[{SEED_INTERACTION_PREFIX}]%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_lesson_interactions(db, lesson_ids=None):
    """Seed 25 lesson Q&A interactions (one per seeded lesson)."""
    existing = _load_seeded_interactions(db)
    if len(existing) >= SEED_COUNT:
        return [interaction.id for interaction in existing]

    lessons = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.id.in_(lesson_ids[:SEED_COUNT]))
        .all()
        if lesson_ids
        else load_seeded_lessons(db)
    )

    questions = [
        "What is the main topic of this lesson?",
        "Can you give me an example sentence?",
        "How do I pronounce this word correctly?",
        "What are common mistakes to avoid?",
        "Could you explain this grammar rule simply?",
        "How can I practice this at home?",
        "What is the difference between these two phrases?",
        "When should I use formal vs informal language?",
        "Can you summarize the key vocabulary?",
        "How do I use this in a business email?",
        "What listening exercise do you recommend?",
        "How long should my answer be in the speaking task?",
        "Can you check my sentence for errors?",
        "What connectors can I use in writing?",
        "How do I improve my fluency?",
        "What cultural context should I know?",
        "Can you provide a role-play scenario?",
        "How is this assessed in the exam?",
        "What synonyms can I use here?",
        "How do I structure a short essay?",
        "Can you give feedback on my paragraph?",
        "What follow-up questions might appear?",
        "How do I self-correct while speaking?",
        "What resources should I review next?",
        "Can you quiz me on this lesson?",
    ]

    existing_lesson_ids = {interaction.lesson_id for interaction in existing}
    interactions_to_add = []

    for i, lesson in enumerate(lessons[:SEED_COUNT]):
        if lesson.id in existing_lesson_ids:
            continue
        question = questions[i]
        interactions_to_add.append(
            LessonInteractions(
                lesson_id=lesson.id,
                student_question=f"[{SEED_INTERACTION_PREFIX}] {question}",
                ai_answer=(
                    f"Great question about lesson {i + 1}. "
                    f"Here's a clear explanation with an example you can practice."
                ),
            )
        )

    if interactions_to_add:
        db.add_all(interactions_to_add)
        db.flush()

    return [interaction.id for interaction in _load_seeded_interactions(db)]
