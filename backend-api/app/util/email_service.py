import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from ..config.settings import settings


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
