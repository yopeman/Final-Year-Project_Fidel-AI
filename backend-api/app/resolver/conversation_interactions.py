from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.conversation_interactions import ConversationInteractions
from ..model.free_conversation import FreeConversation
from ..model.student_profile import StudentProfile
from ..model.user import User, UserRole
from ..util.ai_service.conversation_interaction import ask_on_conversation

query = QueryType()
mutation = MutationType()
conversation_interactions = ObjectType("ConversationInteractions")


@query.field("conversationInteractions")
def resolve_conversation_interactions(_, info, conversationId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if the conversation exists and user has access
    conversation = (
        db.query(FreeConversation)
        .filter(FreeConversation.id == conversationId, FreeConversation.is_deleted == False)
        .first()
    )

    if not conversation:
        raise Exception("Conversation not found")

    # Check ownership through profile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == conversation.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    interactions = (
        db.query(ConversationInteractions)
        .filter(
            ConversationInteractions.conversation_id == conversationId,
            ConversationInteractions.is_deleted == False,
        )
        .order_by(ConversationInteractions.created_at)
        .all()
    )

    return interactions


@query.field("conversationInteraction")
def resolve_conversation_interaction(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    interaction = (
        db.query(ConversationInteractions)
        .filter(ConversationInteractions.id == id, ConversationInteractions.is_deleted == False)
        .first()
    )

    if not interaction:
        raise Exception("Conversation interaction not found")

    # Check ownership through conversation and profile
    conversation = (
        db.query(FreeConversation)
        .filter(FreeConversation.id == interaction.conversation_id)
        .first()
    )

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == conversation.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    return interaction


@mutation.field("createConversationInteraction")
def resolve_create_conversation_interaction(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if the conversation exists and user has access
    conversation = (
        db.query(FreeConversation)
        .filter(FreeConversation.id == input["conversationId"], FreeConversation.is_deleted == False)
        .first()
    )

    if not conversation:
        raise Exception("Conversation not found")

    # Check ownership through profile
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == conversation.profile_id)
        .first()
    )

    prev_conversation_interactions = (
        db.query(ConversationInteractions)
        .filter(ConversationInteractions.conversation_id == conversation.id, ConversationInteractions.is_deleted == False)
        .all()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")
    
    answer = ask_on_conversation(input["question"], profile, conversation, prev_conversation_interactions)

    # Create interaction
    interaction = ConversationInteractions(
        conversation_id=input["conversationId"],
        question=input["question"],
        answer=answer
    )

    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return interaction


@mutation.field("deleteConversationInteraction")
def resolve_delete_conversation_interaction(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    interaction = (
        db.query(ConversationInteractions)
        .filter(ConversationInteractions.id == id, ConversationInteractions.is_deleted == False)
        .first()
    )

    if not interaction:
        raise Exception("Conversation interaction not found")

    # Check ownership through conversation and profile
    conversation = (
        db.query(FreeConversation)
        .filter(FreeConversation.id == interaction.conversation_id)
        .first()
    )

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == conversation.profile_id)
        .first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    interaction.is_deleted = True
    interaction.deleted_at = datetime.utcnow()
    db.commit()

    return True


@conversation_interactions.field("id")
def resolve_id(interaction, info):
    return interaction.id


@conversation_interactions.field("conversationId")
def resolve_conversation_id(interaction, info):
    return interaction.conversation_id


@conversation_interactions.field("question")
def resolve_question(interaction, info):
    return interaction.question


@conversation_interactions.field("answer")
def resolve_answer(interaction, info):
    return interaction.answer


@conversation_interactions.field("createdAt")
def resolve_created_at(interaction, info):
    return interaction.created_at


@conversation_interactions.field("updatedAt")
def resolve_updated_at(interaction, info):
    return interaction.updated_at


@conversation_interactions.field("isDeleted")
def resolve_is_deleted(interaction, info):
    return interaction.is_deleted


@conversation_interactions.field("deletedAt")
def resolve_deleted_at(interaction, info):
    return interaction.deleted_at


@conversation_interactions.field("conversation")
def resolve_conversation(interaction, info):
    db: Session = info.context["db"]
    conversation = (
        db.query(FreeConversation)
        .filter(FreeConversation.id == interaction.conversation_id)
        .first()
    )
    return conversation
