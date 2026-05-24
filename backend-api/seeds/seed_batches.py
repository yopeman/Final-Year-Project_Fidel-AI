from datetime import date, timedelta

from app.model.batch import Batch, BatchLevel, BatchStatus

from seeds.common import SEED_COUNT

SEED_BATCH_PREFIX = "Seed Batch"


def _load_seeded_batches(db):
    return (
        db.query(Batch)
        .filter(Batch.name.like(f"{SEED_BATCH_PREFIX}%"))
        .order_by(Batch.name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_batches(db, *_args):
    """Seed 25 language-learning batches."""
    existing = _load_seeded_batches(db)
    if len(existing) >= SEED_COUNT:
        return [b.id for b in existing]

    levels = list(BatchLevel)
    statuses = list(BatchStatus)
    languages = [
        "English", "French", "Spanish", "German", "Mandarin",
        "Japanese", "Korean", "Italian", "Portuguese", "Arabic",
        "Russian", "Dutch", "Hindi", "Turkish", "Vietnamese",
        "Thai", "Polish", "Swedish", "Greek", "Hebrew",
        "Indonesian", "Malay", "Norwegian", "Danish", "Finnish",
    ]
    cohort_labels = [
        "Spring", "Summer", "Fall", "Winter", "Evening",
        "Morning", "Weekend", "Intensive", "Express", "Foundation",
        "Bridge", "Advanced", "Corporate", "Campus", "Online",
        "Hybrid", "Immersion", "Exam Prep", "Conversation", "Writing",
        "Listening", "Speaking", "Reading", "Grammar", "Fluency",
    ]

    today = date.today()
    batches_to_add = []
    for i in range(SEED_COUNT - len(existing)):
        idx = len(existing) + i
        start = today + timedelta(days=7 * idx)
        batches_to_add.append(
            Batch(
                name=f"{SEED_BATCH_PREFIX}: {languages[idx]} {cohort_labels[idx]}",
                description=f"Cohort {idx + 1} for {languages[idx].lower()} learners.",
                level=levels[idx % len(levels)],
                language=languages[idx],
                start_date=start,
                end_date=start + timedelta(days=90),
                max_students=20 + (idx % 10),
                status=statuses[idx % len(statuses)],
                fee_amount=199.0 + (idx * 25),
            )
        )

    if batches_to_add:
        db.add_all(batches_to_add)
        db.flush()

    return [b.id for b in _load_seeded_batches(db)]
