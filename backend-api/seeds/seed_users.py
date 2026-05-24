from app.model.user import User, UserRole
from app.util.auth import get_password_hash

from seeds.common import DEFAULT_PASSWORD, SEED_COUNT, SEED_EMAIL_DOMAIN, seed_email


def _load_seeded_users(db):
    return (
        db.query(User)
        .filter(User.email.like(f"seed.%@{SEED_EMAIL_DOMAIN}"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_users(db):
    """Seed 25 users (2 admins, 3 tutors, 20 students). Password: 12345678."""
    users = _load_seeded_users(db)
    if len(users) >= SEED_COUNT:
        pass
    else:
        hashed = get_password_hash(DEFAULT_PASSWORD)
        first_names = [
            "Alice", "Bob", "Carol", "David", "Eva", "Frank", "Grace", "Henry",
            "Ivy", "Jack", "Kate", "Leo", "Mia", "Noah", "Olivia", "Paul",
            "Quinn", "Rosa", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara",
        ]
        last_names = [
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
            "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
            "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
            "Lee", "Perez", "Thompson", "White", "Harris",
        ]
        roles = (
            [UserRole.admin] * 2
            + [UserRole.tutor] * 3
            + [UserRole.student] * 20
        )
        role_prefix = {
            UserRole.admin: "admin",
            UserRole.tutor: "tutor",
            UserRole.student: "student",
        }
        role_counters = {UserRole.admin: 0, UserRole.tutor: 0, UserRole.student: 0}

        users = []
        for i in range(SEED_COUNT):
            role = roles[i]
            role_counters[role] += 1
            users.append(
                User(
                    first_name=first_names[i],
                    last_name=last_names[i],
                    email=seed_email(role_prefix[role], role_counters[role]),
                    password=hashed,
                    role=role,
                    is_verified=True,
                )
            )
        db.add_all(users)
        db.flush()
        users = _load_seeded_users(db)

    return {
        "all": [u.id for u in users],
        "admin": [u.id for u in users if u.role == UserRole.admin],
        "tutor": [u.id for u in users if u.role == UserRole.tutor],
        "student": [u.id for u in users if u.role == UserRole.student],
    }
