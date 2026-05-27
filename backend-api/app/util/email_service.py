import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from sqlalchemy.orm import Session

from ..config.settings import settings
from ..model.user import User, UserRole
from ..model.notification import Notification


def send_verification_email(email: str, verification_code: str):
    """Send verification email with code to user"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg["From"] = settings.email_from
        msg["To"] = email
        msg["Subject"] = "Email Verification Code"

        # Email body
        body = f"""
        Hello,

        Your verification code is: {verification_code}

        This code will expire in 10 minutes.

        If you didn't request this verification, please ignore this email.

        Best regards,
        Fidel AI Team
        """

        msg.attach(MIMEText(body, "plain"))

        # Connect to SMTP server
        server = smtplib.SMTP(settings.smtp_server, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)

        # Send email
        text = msg.as_string()
        server.sendmail(settings.email_from, email, text)
        server.quit()

        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def send_notification(user_id: str, title: str, content: str, db: Session):
    """Send notification email to user"""

    # Check if user exists
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
        # Create message
        msg = MIMEMultipart()
        msg["From"] = settings.email_from
        msg["To"] = target_user.email
        msg["Subject"] = f"Notification: {title}"

        # Email body
        body = f"""
        Hello,

        You have a new notification:

        Title: {title}
        Content: {content}

        Best regards,
        Fidel AI Team
        """

        msg.attach(MIMEText(body, "plain"))

        # Connect to SMTP server
        server = smtplib.SMTP(settings.smtp_server, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)

        # Send email
        text = msg.as_string()
        server.sendmail(settings.email_from, target_user.email, text)
        server.quit()
    except Exception as e:
        print(f"Failed to send notification email: {e}")
        
    return notification_obj


def send_feedback_email_to_admins(db: Session, feedback_obj):
    """Send feedback notification email to all admin users"""
    try:
        # Get all admin users
        admin_users = db.query(User).filter(User.role == UserRole.admin, User.is_deleted == False).all()
        
        if not admin_users:
            print("No admin users found to send feedback notification")
            return False

        # Create message
        msg = MIMEMultipart()
        msg["From"] = settings.email_from
        msg["Subject"] = "New Feedback Received"

        # Email body
        user_info = f"User: {feedback_obj.user.first_name} {feedback_obj.user.last_name} ({feedback_obj.user.email})" if feedback_obj.user else "User: Anonymous"
        
        body = f"""
        Hello Admin,

        A new feedback has been received:

        {user_info}
        Context: {feedback_obj.context or 'N/A'}
        Content: {feedback_obj.content}
        Rate: {feedback_obj.rate}/5

        Please review this feedback in the admin panel.

        Best regards,
        Fidel AI Team
        """

        msg.attach(MIMEText(body, "plain"))

        # Connect to SMTP server
        server = smtplib.SMTP(settings.smtp_server, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)

        # Send email to all admins
        success_count = 0
        for admin in admin_users:
            try:
                msg["To"] = admin.email
                text = msg.as_string()
                server.sendmail(settings.email_from, admin.email, text)
                success_count += 1
            except Exception as e:
                print(f"Failed to send feedback email to {admin.email}: {e}")

        server.quit()

        return success_count > 0
    except Exception as e:
        print(f"Failed to send feedback email to admins: {e}")
        return False
