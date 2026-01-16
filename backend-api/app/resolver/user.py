from datetime import datetime, timedelta
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..config.settings import settings
from ..model.user import User, UserRole
from ..model.student_profile import StudentProfile
from ..model.batch_instructor import BatchInstructor
from ..model.batch_community import BatchCommunity
from ..model.community_reactions import CommunityReactions
from ..model.community_comment import CommunityComment
from ..model.comment_reactions import CommentReactions
from ..model.feedback import Feedback
from ..model.notification import Notification
from ..model.attendance import Attendance

# Auth utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = settings.jwt_secret_key
ALGORITHM = settings.jwt_algorithm
ACCESS_TOKEN_EXPIRE_DAYS = settings.jwt_access_token_expire_days
REFRESH_TOKEN_EXPIRE_DAYS = settings.jwt_refresh_token_expire_days

query = QueryType()
mutation = MutationType()
user = ObjectType("User")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.email == email).first()
    return user


@query.field("users")
def resolve_users(_, info, pagination=None):
    db: Session = info.context["db"]
    query_obj = db.query(User)
    if pagination:
        page = pagination.get("page", 1)
        limit = pagination.get("limit", 10)
        offset = (page - 1) * limit
        query_obj = query_obj.offset(offset).limit(limit)
    return query_obj.all()


@query.field("user")
def resolve_user(_, info, id):
    db: Session = info.context["db"]
    return db.query(User).filter(User.id == id).first()


@query.field("me")
def resolve_me(_, info):
    # Assuming user is in context, need to add auth middleware
    current_user = info.context.get("current_user")
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


@mutation.field("register")
def resolve_register(_, info, input):
    db: Session = info.context["db"]
    # Check if user exists
    existing_user = db.query(User).filter(User.email == input["email"]).first()
    if existing_user:
        raise Exception("Email already registered")
    
    hashed_password = get_password_hash(input["password"])
    role = map_role(input.get("role", "UNDETERMINED"))
    
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
    
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    refresh_token = create_refresh_token(data={"sub": new_user.email})
    
    new_user.access_token = access_token
    new_user.refresh_token = refresh_token
    db.commit()
    
    return {
        "user": new_user,
        "accessToken": access_token,
        "refreshToken": refresh_token,
    }


@mutation.field("login")
def resolve_login(_, info, input):
    db: Session = info.context["db"]
    user = db.query(User).filter(User.email == input["email"]).first()
    if not user or not verify_password(input["password"], user.password):
        raise Exception("Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    user.access_token = access_token
    user.refresh_token = refresh_token
    db.commit()
    
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
    return access_token


@mutation.field("updateUser")
def resolve_update_user(_, info, input):
    # Assuming admin check, but for now allow
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == input["id"]).first()
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
    # Assuming admin check
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise Exception("User not found")
    
    user.is_deleted = True
    user.deleted_at = datetime.utcnow()
    db.commit()
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
    return True


@user.field("profile")
def resolve_profile(user_obj, info):
    db: Session = info.context["db"]
    user_profile = db.query(StudentProfile).filter(StudentProfile.id == user_obj.id).all()
    return user_profile


@user.field("batchInstructors")
def resolve_batch_instructors(user_obj, info):
    return user_obj.batch_instructors


@user.field("batchCommunities")
def resolve_batch_communities(user_obj, info):
    return user_obj.batch_communities


@user.field("communityReactions")
def resolve_community_reactions(user_obj, info):
    return user_obj.community_reactions


@user.field("communityComments")
def resolve_community_comments(user_obj, info):
    return user_obj.community_comments


@user.field("commentReactions")
def resolve_comment_reactions(user_obj, info):
    return user_obj.comment_reactions


@user.field("feedbacks")
def resolve_feedbacks(user_obj, info):
    return user_obj.feedbacks


@user.field("notifications")
def resolve_notifications(user_obj, info):
    return user_obj.notifications


@user.field("attendances")
def resolve_attendances(user_obj, info):
    return user_obj.attendances
