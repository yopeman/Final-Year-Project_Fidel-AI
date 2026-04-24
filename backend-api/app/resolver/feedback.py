from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.feedback import Feedback
from ..model.user import User, UserRole
from ..util.email_service import send_feedback_email_to_admins

query = QueryType()
mutation = MutationType()
feedback = ObjectType("Feedback")

@query.field("feedbacks")
def resolve_feedbacks(_, info, pagination=None):
    current_user: User = info.context.get("current_user")
    if not current_user or current_user.role != UserRole.admin:
        raise Exception("Unauthorized")

    db: Session = info.context["db"]
    query_obj = db.query(Feedback).filter(Feedback.is_deleted == False)
    
    if pagination:
        page = pagination.get("page", 1)
        limit = pagination.get("limit", 10)
        offset = (page - 1) * limit
        query_obj = query_obj.offset(offset).limit(limit)
    
    return query_obj.all()

@query.field("feedback")
def resolve_feedback(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    feedback_obj = db.query(Feedback).filter(Feedback.id == id, Feedback.is_deleted == False).first()

    if not feedback_obj:
        raise Exception("Feedback not found")
    
    # Only allow users to see their own feedback or admins to see all
    if current_user.role != UserRole.admin and feedback_obj.user_id != current_user.id:
        raise Exception("Unauthorized")
    
    return feedback_obj

@mutation.field("submitFeedback")
def resolve_submit_feedback(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Validate rate is between 1 and 5
    rate = input.get("rate")
    if rate is None or rate < 1 or rate > 5:
        raise Exception("Rate must be between 1 and 5")
    
    feedback_obj = Feedback(
        user_id=current_user.id,
        context=input.get("context"),
        content=input["content"],
        rate=rate,
        is_read=False
    )
    
    db.add(feedback_obj)
    db.commit()
    db.refresh(feedback_obj)
    
    # Send email notification to all admins
    send_feedback_email_to_admins(db, feedback_obj)
    
    return feedback_obj

@mutation.field("submitFeedbackAnonymously")
def resolve_submit_feedback_anonymously(_, info, input):
    db: Session = info.context["db"]
    
    # Validate rate is between 1 and 5
    rate = input.get("rate")
    if rate is None or rate < 1 or rate > 5:
        raise Exception("Rate must be between 1 and 5")
    
    feedback_obj = Feedback(
        user_id=None,  # Anonymous feedback
        context=input.get("context"),
        content=input["content"],
        rate=rate,
        is_read=False
    )
    
    db.add(feedback_obj)
    db.commit()
    db.refresh(feedback_obj)
    
    # Send email notification to all admins
    send_feedback_email_to_admins(db, feedback_obj)
    
    return feedback_obj

@mutation.field("markAsReadFeedback")
def resolve_mark_as_read_feedback(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    feedback_obj = db.query(Feedback).filter(Feedback.id == id, Feedback.is_deleted == False).first()

    if not feedback_obj:
        raise Exception("Feedback not found")
    
    # Only allow admins to mark feedback as read
    if current_user.role != UserRole.admin:
        raise Exception("Unauthorized")
    
    feedback_obj.is_read = True
    feedback_obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(feedback_obj)
    
    return feedback_obj

@mutation.field("markAsReadAllFeedbacks")
def resolve_mark_as_read_all_feedbacks(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user or current_user.role != UserRole.admin:
        raise Exception("Unauthorized")

    db: Session = info.context["db"]
    
    # Mark all unread feedback as read
    updated_count = db.query(Feedback).filter(
        Feedback.is_read == False,
        Feedback.is_deleted == False
    ).update({
        "is_read": True,
        "updated_at": datetime.utcnow()
    })
    
    db.commit()
    
    return updated_count > 0

@mutation.field("deleteFeedback")
def resolve_delete_feedback(_, info, id):
    current_user: User = info.context.get("current_user")
    if not current_user or current_user.role != UserRole.admin:
        raise Exception("Unauthorized")

    db: Session = info.context["db"]
    feedback_obj = db.query(Feedback).filter(Feedback.id == id, Feedback.is_deleted == False).first()

    if not feedback_obj:
        raise Exception("Feedback not found")
    
    feedback_obj.is_deleted = True
    feedback_obj.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(feedback_obj)
    
    return True

@feedback.field("user")
def resolve_user(feedback_obj, info):
    if feedback_obj.user_id is None:
        return None
    
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == feedback_obj.user_id).first()
    return user

@feedback.field("id")
def resolve_id(feedback_obj, info):
    return feedback_obj.id

@feedback.field("userId")
def resolve_user_id(feedback_obj, info):
    return feedback_obj.user_id

@feedback.field("context")
def resolve_context(feedback_obj, info):
    return feedback_obj.context

@feedback.field("content")
def resolve_content(feedback_obj, info):
    return feedback_obj.content

@feedback.field("rate")
def resolve_rate(feedback_obj, info):
    return feedback_obj.rate

@feedback.field("isRead")
def resolve_is_read(feedback_obj, info):
    return feedback_obj.is_read

@feedback.field("createdAt")
def resolve_created_at(feedback_obj, info):
    return feedback_obj.created_at

@feedback.field("updatedAt")
def resolve_updated_at(feedback_obj, info):
    return feedback_obj.updated_at

@feedback.field("isDeleted")
def resolve_is_deleted(feedback_obj, info):
    return feedback_obj.is_deleted

@feedback.field("deletedAt")
def resolve_deleted_at(feedback_obj, info):
    return feedback_obj.deleted_at