from ariadne import ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.user import User

query = QueryType()
user = ObjectType("User")


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


@user.field("id")
def resolve_user_id(user_obj, info):
    return str(user_obj.id)


@user.field("firstName")
def resolve_user_first_name(user_obj, info):
    return user_obj.first_name


@user.field("lastName")
def resolve_user_last_name(user_obj, info):
    return user_obj.last_name


@user.field("email")
def resolve_user_email(user_obj, info):
    return user_obj.email


@user.field("password")
def resolve_user_password(user_obj, info):
    return user_obj.password


@user.field("role")
def resolve_user_role(user_obj, info):
    return user_obj.role.value


@user.field("isVerified")
def resolve_user_is_verified(user_obj, info):
    return user_obj.is_verified


@user.field("accessToken")
def resolve_user_access_token(user_obj, info):
    return user_obj.access_token


@user.field("refreshToken")
def resolve_user_refresh_token(user_obj, info):
    return user_obj.refresh_token
