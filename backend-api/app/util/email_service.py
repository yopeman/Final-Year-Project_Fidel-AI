import resend
from sqlalchemy.orm import Session

from ..config.settings import settings
from ..model.user import User, UserRole
from ..model.notification import Notification

resend.api_key = settings.resend_api_key


def send_verification_email(email: str, verification_code: str) -> bool:
    """Send verification email with code to user"""
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": [email],
            "subject": "Email Verification Code",
            "text": f"""Hello,

Your verification code is: {verification_code}

This code will expire in 10 minutes.

If you didn't request this verification, please ignore this email.

Best regards,
Fidel AI Team""",
        })
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def send_notification(user_id: str, title: str, content: str, db: Session):
    """Send notification email to user"""

    target_user = db.query(User).filter(
        User.id == user_id,
        User.is_deleted == False
    ).first()

    if not target_user:
        raise Exception("User not found")

    notification_obj = Notification(
        user_id=target_user.id,
        title=title,
        content=content
    )

    db.add(notification_obj)
    db.commit()
    db.refresh(notification_obj)

    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": [target_user.email],
            "subject": f"Notification: {title}",
            "text": f"""Hello,

You have a new notification:

Title: {title}
Content: {content}

Best regards,
Fidel AI Team""",
        })
    except Exception as e:
        print(f"Failed to send notification email: {e}")

    return notification_obj


def send_feedback_email_to_admins(db: Session, feedback_obj) -> bool:
    """Send feedback notification email to all admin users"""
    try:
        admin_users = db.query(User).filter(
            User.role == UserRole.admin,
            User.is_deleted == False
        ).all()

        if not admin_users:
            print("No admin users found to send feedback notification")
            return False

        user_info = (
            f"User: {feedback_obj.user.first_name} {feedback_obj.user.last_name} ({feedback_obj.user.email})"
            if feedback_obj.user
            else "User: Anonymous"
        )

        body = f"""Hello Admin,

A new feedback has been received:

{user_info}
Context: {feedback_obj.context or 'N/A'}
Content: {feedback_obj.content}
Rate: {feedback_obj.rate}/5

Please review this feedback in the admin panel.

Best regards,
Fidel AI Team"""

        success_count = 0
        for admin in admin_users:
            try:
                resend.Emails.send({
                    "from": "onboarding@resend.dev",
                    "to": [admin.email],
                    "subject": "New Feedback Received",
                    "text": body,
                })
                success_count += 1
            except Exception as e:
                print(f"Failed to send feedback email to {admin.email}: {e}")

        return success_count > 0
    except Exception as e:
        print(f"Failed to send feedback email to admins: {e}")
        return False
