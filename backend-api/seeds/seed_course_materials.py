from app.model.course import Course
from app.model.course_material import CourseMaterial

from seeds.common import SEED_COUNT


def seed_course_materials(db, course_ids=None):
    """Seed 25 course materials (one per seeded course)."""
    prefix = "Seed Material"
    existing = (
        db.query(CourseMaterial)
        .filter(CourseMaterial.name.like(f"{prefix}%"))
        .order_by(CourseMaterial.name)
        .all()
    )
    if len(existing) >= SEED_COUNT:
        return [m.id for m in existing[:SEED_COUNT]]

    if not course_ids:
        course_ids = [
            c.id
            for c in (
                db.query(Course)
                .filter(Course.name.like("Seed Course%"))
                .order_by(Course.name)
                .limit(SEED_COUNT)
                .all()
            )
        ]

    material_types = [
        "Syllabus",
        "Lecture Slides",
        "Workbook",
        "Audio Pack",
        "Video Lessons",
        "Practice Tests",
        "Vocabulary List",
        "Reading Pack",
        "Writing Guide",
        "Grammar Reference",
        "Discussion Prompts",
        "Homework Set",
        "Quiz Bank",
        "Pronunciation Drills",
        "Case Studies",
        "Flashcards",
        "Sample Essays",
        "Listening Transcripts",
        "Role-play Scripts",
        "Peer Review Rubric",
        "Instructor Notes",
        "Glossary",
        "Supplementary Articles",
        "Capstone Brief",
        "Certificate Prep Kit",
    ]

    materials = [
        CourseMaterial(
            course_id=course_ids[i],
            name=f"{prefix}: {material_types[i]}",
            description=f"Core {material_types[i].lower()} for course {i + 1}.",
        )
        for i in range(min(SEED_COUNT, len(course_ids)))
    ]
    db.add_all(materials)
    db.flush()
    return [m.id for m in materials]
