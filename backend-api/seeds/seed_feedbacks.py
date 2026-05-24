from app.model.feedback import Feedback
from app.model.user import User

from seeds.common import SEED_COUNT
from seeds.community_seed_helpers import load_seeded_users

SEED_FEEDBACK_MARKER = "[seed-feedback]"


def _load_seeded_feedbacks(db):
    return (
        db.query(Feedback)
        .filter(Feedback.content.like(f"{SEED_FEEDBACK_MARKER}%"))
        .order_by(Feedback.content)
        .limit(SEED_COUNT)
        .all()
    )


def seed_feedbacks(db, user_ids=None):
    """Seed 25 feedback entries (one per seeded user)."""
    existing = _load_seeded_feedbacks(db)
    if len(existing) >= SEED_COUNT:
        return [f.id for f in existing]

    users = load_seeded_users(db)
    if user_ids and user_ids.get("all"):
        users = (
            db.query(User)
            .filter(User.id.in_(user_ids["all"][:SEED_COUNT]))
            .order_by(User.email)
            .all()
        )

    contexts = [
        "course", "lesson", "batch", "community", "payment",
        "app", "tutor", "certificate", "module", "conversation",
    ]
    messages = [
        "The course content is clear and well structured.",
        "Lessons load quickly and exercises are helpful.",
        "Batch discussions make learning more engaging.",
        "Community posts are a great way to collaborate.",
        "Payment flow was smooth and easy to follow.",
        "The app interface is intuitive on desktop.",
        "My tutor gives useful and timely feedback.",
        "Certificate download worked without issues.",
        "Modules are organized in a logical order.",
        "Free conversation practice boosted my confidence.",
        "More listening exercises would be appreciated.",
        "Grammar explanations are easy to understand.",
        "Speaking drills helped my pronunciation a lot.",
        "Writing tasks with rubrics are very practical.",
        "Vocabulary lists are relevant to real situations.",
        "Notifications keep me on track with deadlines.",
        "Attendance tracking is convenient for students.",
        "Video resources complement the lessons well.",
        "I'd like more advanced optional content.",
        "Progress tracking motivates me to continue.",
        "Mobile experience could use minor improvements.",
        "Study materials are high quality overall.",
        "Peer interaction features are valuable.",
        "Onboarding was simple for new users.",
        "Overall experience exceeds my expectations.",
    ]

    existing_user_ids = {f.user_id for f in existing if f.user_id}
    feedbacks_to_add = []

    for i, user in enumerate(users[:SEED_COUNT]):
        if user.id in existing_user_ids:
            continue
        feedbacks_to_add.append(
            Feedback(
                user_id=user.id,
                context=contexts[i % len(contexts)],
                content=f"{SEED_FEEDBACK_MARKER} {messages[i]}",
                rate=(i % 5) + 1,
                is_read=i % 4 == 0,
            )
        )

    if feedbacks_to_add:
        db.add_all(feedbacks_to_add)
        db.flush()

    return [f.id for f in _load_seeded_feedbacks(db)]
