from app.model.course import Course

from seeds.common import SEED_COUNT


def seed_courses(db, *_args):
    """Seed 25 language-learning courses."""
    prefix = "Seed Course"
    existing = (
        db.query(Course)
        .filter(Course.name.like(f"{prefix}%"))
        .order_by(Course.name)
        .all()
    )
    if len(existing) >= SEED_COUNT:
        return [c.id for c in existing[:SEED_COUNT]]

    titles = [
        "English Foundations",
        "Business English Essentials",
        "IELTS Preparation",
        "TOEFL Mastery",
        "Conversational Fluency",
        "Academic Writing",
        "Professional Presentations",
        "Grammar Intensive",
        "Listening & Comprehension",
        "Pronunciation Workshop",
        "Interview English",
        "Medical English Basics",
        "Legal English Intro",
        "STEM English",
        "Creative Writing",
        "Debate & Discussion",
        "Email & Report Writing",
        "Customer Service English",
        "Travel English",
        "Public Speaking",
        "Reading Strategies",
        "Vocabulary Builder",
        "Idioms & Expressions",
        "Cross-Cultural Communication",
        "Advanced Composition",
    ]
    descriptions = [
        f"Structured curriculum for {title.lower()} with weekly milestones."
        for title in titles
    ]

    courses = [
        Course(name=f"{prefix}: {titles[i]}", description=descriptions[i])
        for i in range(SEED_COUNT)
    ]
    db.add_all(courses)
    db.flush()
    return [c.id for c in courses]
