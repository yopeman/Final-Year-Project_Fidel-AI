from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.notification import Notification
from ..model.user import User, UserRole
from ..util.email_service import send_notification_email

query = QueryType()
mutation = MutationType()
notification = ObjectType("Notification")

@query.field("myNotifications")
def resolve_notifications(_, info, userId=None):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Users can only see their own notifications
    query_obj = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_deleted == False
    )
    
    return query_obj.order_by(Notification.created_at.desc()).all()

@query.field("notifications")
def resolve_notifications(_, info, userId=None):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # If userId is provided, only admins can query other users' notifications
    if userId:
        if current_user.role != UserRole.admin:
            raise Exception("Unauthorized")
        query_obj = db.query(Notification).filter(
            Notification.user_id == userId,
            Notification.is_deleted == False
        )
    else:
        # Users can only see their own notifications
        query_obj = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_deleted == False
        )
    
    return query_obj.order_by(Notification.created_at.desc()).all()

@query.field("notification")
def resolve_notification(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    notification_obj = db.query(Notification).filter(
        Notification.id == id, 
        Notification.is_deleted == False
    ).first()

    if not notification_obj:
        raise Exception("Notification not found")
    
    # Only allow users to see their own notifications or admins to see all
    if current_user.role != UserRole.admin and notification_obj.user_id != current_user.id:
        raise Exception("Unauthorized")
    
    return notification_obj

@mutation.field("sendNotification")
def resolve_send_notification(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user or current_user.role != UserRole.admin:
        raise Exception("Unauthorized")

    db: Session = info.context["db"]
    # Send email notification to the user
    notification_obj = send_notification_email(input["userId"], input["title"], input["content"], db)
    
    return notification_obj

@mutation.field("markAsReadNotification")
def resolve_mark_as_read_notification(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    notification_obj = db.query(Notification).filter(
        Notification.id == id, 
        Notification.is_deleted == False
    ).first()

    if not notification_obj:
        raise Exception("Notification not found")
    
    # Only allow users to mark their own notifications as read or admins to mark any
    if current_user.role != UserRole.admin and notification_obj.user_id != current_user.id:
        raise Exception("Unauthorized")
    
    notification_obj.is_read = True
    notification_obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(notification_obj)
    
    return notification_obj

@mutation.field("markAsReadAllNotifications")
def resolve_mark_as_read_all_notifications(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Only update notifications for the current user, or all if admin
    if current_user.role == UserRole.admin:
        # Admins can mark all notifications as read
        updated_count = db.query(Notification).filter(
            Notification.is_read == False,
            Notification.is_deleted == False
        ).update({
            "is_read": True,
            "updated_at": datetime.utcnow()
        })
    else:
        # Regular users can only mark their own notifications as read
        updated_count = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
            Notification.is_deleted == False
        ).update({
            "is_read": True,
            "updated_at": datetime.utcnow()
        })
    
    db.commit()
    
    return updated_count > 0

@mutation.field("deleteNotification")
def resolve_delete_notification(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    notification_obj = db.query(Notification).filter(
        Notification.id == id, 
        Notification.is_deleted == False
    ).first()

    if not notification_obj:
        raise Exception("Notification not found")
    
    # Only allow users to delete their own notifications or admins to delete any
    if current_user.role != UserRole.admin and notification_obj.user_id != current_user.id:
        raise Exception("Unauthorized")
    
    notification_obj.is_deleted = True
    notification_obj.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(notification_obj)
    
    return True

@notification.field("user")
def resolve_user(notification_obj, info):
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == notification_obj.user_id).first()
    return user

@notification.field("id")
def resolve_id(notification_obj, info):
    return notification_obj.id

@notification.field("userId")
def resolve_user_id(notification_obj, info):
    return notification_obj.user_id

@notification.field("title")
def resolve_title(notification_obj, info):
    return notification_obj.title

@notification.field("content")
def resolve_content(notification_obj, info):
    return notification_obj.content

@notification.field("isRead")
def resolve_is_read(notification_obj, info):
    return notification_obj.is_read

@notification.field("createdAt")
def resolve_created_at(notification_obj, info):
    return notification_obj.created_at

@notification.field("updatedAt")
def resolve_updated_at(notification_obj, info):
    return notification_obj.updated_at

@notification.field("isDeleted")
def resolve_is_deleted(notification_obj, info):
    return notification_obj.is_deleted

@notification.field("deletedAt")
def resolve_deleted_at(notification_obj, info):
    return notification_obj.deleted_at