from app.model.notification import Notification
from app.model.user import User

from seeds.common import SEED_COUNT
from seeds.community_seed_helpers import load_seeded_users

SEED_NOTIFICATION_PREFIX = "Seed Notification"


def _load_seeded_notifications(db):
    return (
        db.query(Notification)
        .filter(Notification.title.like(f"{SEED_NOTIFICATION_PREFIX}%"))
        .order_by(Notification.title)
        .limit(SEED_COUNT)
        .all()
    )


def seed_notifications(db, user_ids=None):
    """Seed 25 notifications (one per seeded user)."""
    existing = _load_seeded_notifications(db)
    if len(existing) >= SEED_COUNT:
        return [n.id for n in existing]

    users = load_seeded_users(db)
    if user_ids and user_ids.get("all"):
        users = (
            db.query(User)
            .filter(User.id.in_(user_ids["all"][:SEED_COUNT]))
            .order_by(User.email)
            .all()
        )

    titles = [
        "Welcome to Fidel AI",
        "New lesson available",
        "Assignment reminder",
        "Batch discussion update",
        "Payment received",
        "Certificate ready",
        "Class schedule change",
        "Tutor feedback posted",
        "Community mention",
        "Module unlocked",
        "Speaking practice tip",
        "Weekly progress summary",
        "Enrollment confirmed",
        "Course material added",
        "Attendance recorded",
        "Quiz results published",
        "Study group invite",
        "Deadline approaching",
        "New comment on your post",
        "Profile update reminder",
        "Free conversation summary",
        "Batch starting soon",
        "Holiday schedule notice",
        "Feature announcement",
        "Thank you for learning with us",
    ]

    existing_user_ids = {n.user_id for n in existing}
    notifications_to_add = []

    for i, user in enumerate(users[:SEED_COUNT]):
        if user.id in existing_user_ids:
            continue
        notifications_to_add.append(
            Notification(
                user_id=user.id,
                title=f"{SEED_NOTIFICATION_PREFIX}: {titles[i]}",
                content=f"Hello {user.first_name}, {titles[i].lower()} — notification {i + 1}.",
                is_read=i % 3 == 0,
            )
        )

    if notifications_to_add:
        db.add_all(notifications_to_add)
        db.flush()

    return [n.id for n in _load_seeded_notifications(db)]
