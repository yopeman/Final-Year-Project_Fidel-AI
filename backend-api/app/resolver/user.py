from datetime import datetime, timedelta
from typing import Optional
from collections import defaultdict
import time
import random
import string

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.user import User, UserRole
from ..util.auth import verify_password, get_password_hash, create_access_token, create_refresh_token
from ..model.verification_code import VerificationCode
from ..model.student_profile import StudentProfile
from ..model.batch_instructor import BatchInstructor
from ..model.batch_community import BatchCommunity
from ..model.community_reactions import CommunityReactions
from ..model.community_comment import CommunityComment
from ..model.comment_reactions import CommentReactions
from ..model.feedback import Feedback
from ..model.notification import Notification
from ..model.attendance import Attendance
from ..util.email_service import send_verification_email
from ..config.settings import settings

query = QueryType()
mutation = MutationType()
user = ObjectType("User")

# Rate limiting for verification attempts
verification_attempts = defaultdict(list)
MAX_VERIFICATION_ATTEMPTS = 5
VERIFICATION_WINDOW_SECONDS = 300  # 5 minutes

ACCESS_TOKEN_EXPIRE_DAYS = settings.jwt_access_token_expire_days

@query.field("users")
def resolve_users(_, info, pagination=None):
    current_user: User = info.context.get("current_user")
    if not current_user or current_user.role != UserRole.admin:
        raise Exception("Unauthorized")

    db: Session = info.context["db"]
    query_obj = db.query(User).filter(User.is_deleted == False)
    if pagination:
        page = pagination.get("page", 1)
        limit = pagination.get("limit", 10)
        offset = (page - 1) * limit
        query_obj = query_obj.offset(offset).limit(limit)
    return query_obj.all()


@query.field("user")
def resolve_user(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user or current_user.role != UserRole.admin:
        raise Exception("Unauthorized")

    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == id, User.is_deleted == False).first()

    if not user:
        raise Exception("User not found")
    return user


@query.field("me")
def resolve_me(_, info):
    # Assuming user is in context, need to add auth middleware
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    return current_user


def map_role(role_str: str) -> UserRole:
    role_map = {
        "ADMIN": UserRole.admin,
        "STUDENT": UserRole.student,
        "TUTOR": UserRole.tutor,
        "UNDETERMINED": UserRole.undetermined,
    }
    return role_map.get(role_str.upper(), UserRole.undetermined)

def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))


def create_verification_code(db: Session, email: str, user_id: Optional[int] = None):
    """Create and store a new verification code in database"""
    # Invalidate any existing unused codes for this email
    db.query(VerificationCode).filter(
        VerificationCode.email == email,
        VerificationCode.is_used == 0
    ).update({"is_used": 1})

    # Generate new code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    verification_code = VerificationCode(
        email=email,
        code=code,
        expires_at=expires_at,
        user_id=user_id
    )

    db.add(verification_code)
    db.commit()
    db.refresh(verification_code)

    return verification_code

@mutation.field("register")
def resolve_register(_, info, input):
    db: Session = info.context["db"]

    hashed_password = get_password_hash(input["password"])
    role = map_role(input.get("role", "UNDETERMINED"))

    # Check if user exists
    existing_user = db.query(User).filter(User.email == input["email"]).first()
    if existing_user:
        if existing_user.is_deleted:
            existing_user.first_name = input["firstName"]
            existing_user.last_name = input["lastName"]
            existing_user.email = input["email"]
            existing_user.password = hashed_password
            existing_user.role = role
            existing_user.is_verified = False
            existing_user.is_deleted = False
            existing_user.access_token = None
            existing_user.refresh_token = None
            db.commit()
            db.refresh(existing_user)
            return True
        else:
            raise Exception("Email already registered")

    new_user = User(
        first_name=input["firstName"],
        last_name=input["lastName"],
        email=input["email"],
        password=hashed_password,
        role=role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create verification code
    verification_code = create_verification_code(db, input["email"], new_user.id)

    # Send verification email
    email_sent = send_verification_email(input["email"], verification_code.code)
    if not email_sent:
        # Log error but don't fail registration
        print(f"Failed to send verification email to {input['email']}")

    return True

@mutation.field('resendVerification')
def resolve_resend_verification(_, info, input):
    db: Session = info.context["db"]

    # Check if user exists
    user = db.query(User).filter(User.email == input["email"], User.is_deleted == False).first()
    if not user:
        raise Exception("User not found")

    # Check if user is already verified
    if user.is_verified:
        raise Exception("User is already verified")

    # Create new verification code
    verification_code = create_verification_code(db, input["email"], user.id)

    # Send verification email
    email_sent = send_verification_email(input["email"], verification_code.code)
    if not email_sent:
        raise Exception("Failed to send verification email")

    return True

@mutation.field("verify")
def resolve_verify(_, info, input):
    email = input["email"]
    current_time = time.time()

    # Rate limiting check
    attempts = verification_attempts[email]
    # Remove old attempts outside the window
    attempts[:] = [t for t in attempts if current_time - t < VERIFICATION_WINDOW_SECONDS]

    if len(attempts) >= MAX_VERIFICATION_ATTEMPTS:
        raise Exception(f"Too many verification attempts. Please try again in {VERIFICATION_WINDOW_SECONDS // 60} minutes.")

    # Record this attempt
    attempts.append(current_time)

    db: Session = info.context["db"]

    # Get the latest unused verification code for this email
    verification_code = db.query(VerificationCode).filter(
        VerificationCode.email == email,
        VerificationCode.is_used == 0
    ).order_by(VerificationCode.created_at.desc()).first()

    if not verification_code:
        raise Exception('No verification code found. Please request a new one.')

    if verification_code.code != input['verificationCode']:
        raise Exception("Invalid verification code")

    if verification_code.expires_at < datetime.utcnow():
        raise Exception('Verification code has expired. Please request a new one.')

    # Clear rate limiting on successful verification
    verification_attempts[email].clear()

    # Mark code as used
    verification_code.is_used = 1

    # Verify the user
    user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not user:
        raise Exception('User not found')

    user.is_verified = True
    db.commit()
    db.refresh(user)

    return True


@mutation.field("login")
def resolve_login(_, info, input):
    db: Session = info.context["db"]
    user = db.query(User).filter(User.email == input["email"], User.is_deleted == False).first()
    if not user or not verify_password(input["password"], user.password):
        raise Exception("Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    user.access_token = access_token
    user.refresh_token = refresh_token
    db.commit()
    db.refresh(user)
    
    return {
        "user": user,
        "accessToken": access_token,
        "refreshToken": refresh_token,
    }


@mutation.field("logout")
def resolve_logout(_, info):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    current_user.access_token = None
    current_user.refresh_token = None
    db.commit()
    db.refresh(current_user)
    return True


@mutation.field("refreshToken")
def resolve_refresh_token(_, info):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    access_token = create_access_token(
        data={"sub": current_user.email}, expires_delta=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    current_user.access_token = access_token
    db.commit()
    db.refresh(current_user)
    return access_token


@mutation.field("updateUser")
def resolve_update_user(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user or current_user.role != UserRole.admin:
        raise Exception("Unauthorized")

    # Assuming admin check, but for now allow
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == input["id"], User.is_deleted == False).first()
    if not user:
        raise Exception("User not found")
    
    if "firstName" in input:
        user.first_name = input["firstName"]
    if "lastName" in input:
        user.last_name = input["lastName"]
    if "email" in input:
        user.email = input["email"]
    if "password" in input:
        user.password = get_password_hash(input["password"])
    if "role" in input:
        user.role = map_role(input["role"])
    if "isVerified" in input:
        user.is_verified = input["isVerified"]
    
    db.commit()
    db.refresh(user)
    return user


@mutation.field("updateMe")
def resolve_update_me(_, info, input):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    if "firstName" in input:
        current_user.first_name = input["firstName"]
    if "lastName" in input:
        current_user.last_name = input["lastName"]
    if "email" in input:
        current_user.email = input["email"]
    if "password" in input:
        current_user.password = get_password_hash(input["password"])
    
    db.commit()
    db.refresh(current_user)
    return current_user


@mutation.field("deleteUser")
def resolve_delete_user(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user or current_user.role != UserRole.admin:
        raise Exception("Unauthorized")

    # Assuming admin check
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == id, User.is_deleted == False).first()
    if not user:
        raise Exception("User not found")
    
    user.is_deleted = True
    user.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return True


@mutation.field("deleteMe")
def resolve_delete_me(_, info):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    current_user.is_deleted = True
    current_user.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return True


@user.field("profile")
def resolve_profile(user_obj, info):
    db: Session = info.context["db"]
    student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_obj.id).first()
    return student_profile


@user.field("batchInstructors")
def resolve_batch_instructors(user_obj, info):
    db: Session = info.context["db"]
    batch_instructors = db.query(BatchInstructor).filter(BatchInstructor.user_id == user_obj.id).all()
    return batch_instructors


@user.field("batchCommunities")
def resolve_batch_communities(user_obj, info):
    db: Session = info.context["db"]
    batch_communities = db.query(BatchCommunity).filter(BatchCommunity.user_id == user_obj.id).all()
    return batch_communities


@user.field("communityReactions")
def resolve_community_reactions(user_obj, info):
    db: Session = info.context["db"]
    community_reactions = db.query(CommunityReactions).filter(CommunityReactions.user_id == user_obj.id).all()
    return community_reactions


@user.field("communityComments")
def resolve_community_comments(user_obj, info):
    db: Session = info.context["db"]
    community_comments = db.query(CommunityComment).filter(CommunityComment.user_id == user_obj.id).all()
    return community_comments


@user.field("commentReactions")
def resolve_comment_reactions(user_obj, info):
    db: Session = info.context["db"]
    comment_reactions = db.query(CommentReactions).filter(CommentReactions.user_id == user_obj.id).all()
    return comment_reactions


@user.field("feedbacks")
def resolve_feedbacks(user_obj, info):
    db: Session = info.context["db"]
    feedback = db.query(Feedback).filter(Feedback.user_id == user_obj.id).all()
    return feedback


@user.field("notifications")
def resolve_notifications(user_obj, info):
    db: Session = info.context["db"]
    notifications = db.query(Notification).filter(Notification.user_id == user_obj.id).all()
    return notifications


@user.field("attendances")
def resolve_attendances(user_obj, info):
    db: Session = info.context["db"]
    attendances = db.query(Attendance).filter(Attendance.user_id == user_obj.id).all()
    return attendances


@user.field("verificationCodes")
def resolve_user_verification_codes(user_obj, info):
    db: Session = info.context["db"]
    verification_codes = db.query(VerificationCode).filter(VerificationCode.user_id == user_obj.id).all()
    return verification_codes


@user.field("firstName")
def resolve_first_name(user_obj, info):
    return user_obj.first_name


@user.field("lastName")
def resolve_last_name(user_obj, info):
    return user_obj.last_name


@user.field("email")
def resolve_email(user_obj, info):
    return user_obj.email


@user.field("password")
def resolve_password(user_obj, info):
    return None


@user.field("role")
def resolve_role(user_obj, info):
    return user_obj.role.value.upper()  # Since enum


@user.field("isVerified")
def resolve_is_verified(user_obj, info):
    return user_obj.is_verified


@user.field("accessToken")
def resolve_access_token(user_obj, info):
    return user_obj.access_token


@user.field("refreshToken")
def resolve_refresh_token(user_obj, info):
    return user_obj.refresh_token


@user.field("createdAt")
def resolve_created_at(user_obj, info):
    return user_obj.created_at


@user.field("updatedAt")
def resolve_updated_at(user_obj, info):
    return user_obj.updated_at


@user.field("isDeleted")
def resolve_is_deleted(user_obj, info):
    return user_obj.is_deleted


@user.field("deletedAt")
def resolve_deleted_at(user_obj, info):
    return user_obj.deleted_at
