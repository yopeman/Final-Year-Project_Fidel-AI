from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.free_conversation import FreeConversation
from ..model.student_profile import StudentProfile
from ..model.user import User, UserRole
from ..util.ai_service.conversation_interaction import (ai_generated_topic,
                                                        ai_topic_summary)

query = QueryType()
mutation = MutationType()
free_conversation = ObjectType("FreeConversation")


@query.field("freeConversations")
def resolve_free_conversations(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if the profile exists and user has access
    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False,
        )
        .first()
    )

    if not profile:
        raise Exception("Profile not found")

    # Allow admins to view any conversations, students/tutors can only view their own
    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    conversations = (
        db.query(FreeConversation)
        .filter(
            FreeConversation.profile_id == profile.id,
            FreeConversation.is_deleted == False,
        )
        .order_by(FreeConversation.created_at.desc())
        .all()
    )

    return conversations


@query.field("freeConversation")
def resolve_free_conversation(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    conversation = (
        db.query(FreeConversation)
        .filter(FreeConversation.id == id, FreeConversation.is_deleted == False)
        .first()
    )

    if not conversation:
        raise Exception("Free conversation not found")

    # Check ownership through profile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == conversation.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    return conversation


@mutation.field("createConversation")
def resolve_create_conversation(_, info, startingTopic: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if the profile exists and user has access
    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False,
        )
        .first()
    )

    if not profile:
        raise Exception("Profile not found")

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    topic_summary_phrase = ai_topic_summary(startingTopic)
    # Create conversation
    conversation = FreeConversation(
        profile_id=profile.id,
        starting_topic=startingTopic,
        topic_summary_phrase=topic_summary_phrase,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


@mutation.field("generateIdea")
def resolve_generate_idea(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if the profile exists and user has access
    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False,
        )
        .first()
    )

    if not profile:
        raise Exception("Profile not found")

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    generated_idea = ai_generated_topic(profile)
    return generated_idea


@mutation.field("deleteConversation")
def resolve_delete_conversation(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    conversation = (
        db.query(FreeConversation)
        .filter(FreeConversation.id == id, FreeConversation.is_deleted == False)
        .first()
    )

    if not conversation:
        raise Exception("Free conversation not found")

    # Check ownership through profile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == conversation.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    conversation.is_deleted = True
    conversation.deleted_at = datetime.utcnow()
    db.commit()

    return True


@free_conversation.field("id")
def resolve_id(conversation, info):
    return conversation.id


@free_conversation.field("profileId")
def resolve_profile_id(conversation, info):
    return conversation.profile_id


@free_conversation.field("startingTopic")
def resolve_starting_topic(conversation, info):
    return conversation.starting_topic


@free_conversation.field("topicSummaryPhrase")
def resolve_topic_summary_phrase(conversation, info):
    return conversation.topic_summary_phrase


@free_conversation.field("createdAt")
def resolve_created_at(conversation, info):
    return conversation.created_at


@free_conversation.field("updatedAt")
def resolve_updated_at(conversation, info):
    return conversation.updated_at


@free_conversation.field("isDeleted")
def resolve_is_deleted(conversation, info):
    return conversation.is_deleted


@free_conversation.field("deletedAt")
def resolve_deleted_at(conversation, info):
    return conversation.deleted_at


@free_conversation.field("profile")
def resolve_profile(conversation, info):
    db: Session = info.context["db"]
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == conversation.profile_id)
        .first()
    )
    return profile


@free_conversation.field("interactions")
def resolve_interactions(conversation, info):
    db: Session = info.context["db"]
    from ..model.conversation_interactions import ConversationInteractions

    interactions = (
        db.query(ConversationInteractions)
        .filter(ConversationInteractions.conversation_id == conversation.id)
        .order_by(ConversationInteractions.created_at)
        .all()
    )
    return interactions
