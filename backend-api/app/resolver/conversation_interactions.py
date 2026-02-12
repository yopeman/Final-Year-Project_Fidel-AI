import uuid
import base64
import os
from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.conversation_interactions import ConversationInteractions
from ..model.free_conversation import FreeConversation
from ..model.student_profile import StudentProfile
from ..model.user import User, UserRole
from ..util.ai_service.conversation_interaction import (ask_on_conversation,
                                                        generate_possible_talk,
                                                        speech_to_text,
                                                        text_to_speech)

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
        .filter(
            FreeConversation.id == conversationId, FreeConversation.is_deleted == False
        )
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
        .filter(
            ConversationInteractions.id == id,
            ConversationInteractions.is_deleted == False,
        )
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


@mutation.field("talkWithAi")
async def resolve_talk_with_ai(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if the conversation exists and user has access
    conversation = (
        db.query(FreeConversation)
        .filter(
            FreeConversation.id == input["conversationId"],
            FreeConversation.is_deleted == False,
        )
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

    # Get previous interactions for context
    prev_interactions = (
        db.query(ConversationInteractions)
        .filter(ConversationInteractions.conversation_id == input["conversationId"])
        .order_by(ConversationInteractions.created_at)
        .all()
    )

    # Generate AI response
    if "text" in input and str(input["text"]).strip() != '':
        student_text = input["text"]
        student_audio_url = text_to_speech(input["text"])

    elif "audioFile" in input and str(input["audioFile"]).strip() != '':
        # Handle base64 encoded audio data
        base64_audio = input["audioFile"]
        
        # Remove data URL prefix if present (e.g., "data:audio/wav;base64,")
        if base64_audio.startswith("data:"):
            data_url_parts = base64_audio.split(",")
            base64_audio = data_url_parts[1]
            
            # Extract MIME type from data URL to determine file extension
            mime_type = data_url_parts[0].replace("data:", "")
            if "audio/wav" in mime_type or "audio/x-wav" in mime_type:
                file_extension = ".wav"
            elif "audio/mp3" in mime_type or "audio/mpeg" in mime_type:
                file_extension = ".mp3"
            elif "audio/aac" in mime_type:
                file_extension = ".aac"
            elif "audio/ogg" in mime_type or "audio/oga" in mime_type:
                file_extension = ".ogg"
            elif "audio/flac" in mime_type:
                file_extension = ".flac"
            elif "audio/webm" in mime_type:
                file_extension = ".webm"
            else:
                # Default to wav if MIME type not recognized
                file_extension = ".wav"
        else:
            # If no data URL prefix, default to wav
            file_extension = ".wav"
        
        # Decode base64 audio data
        audio_data = base64.b64decode(base64_audio)
        
        # Generate unique filename with detected extension
        audio_filename = f"{uuid.uuid4()}{file_extension}"
        audio_filepath = f"static/{audio_filename}"
        
        # Save the audio file
        with open(audio_filepath, "wb") as f:
            f.write(audio_data)
        
        student_audio_url = audio_filepath
        student_text = speech_to_text(audio_filepath)

    else:
        raise Exception("Require text or audio")

    if not profile:
        raise Exception("Student profile not found")

    ai_response = ask_on_conversation(
        student_text, profile, conversation, prev_interactions
    )

    if not isinstance(ai_response, dict):
        # Fallback if AI service returns a string (error message) instead of dict
        interaction = ConversationInteractions(
            conversation_id=input["conversationId"],
            student_text=student_text,
            student_audio_url=f'{info.context["base_url"]}{student_audio_url}',
            ai_text=str(ai_response),
            ai_audio_url="",
        )
    else:
        # Create new interaction from valid dict response
        interaction = ConversationInteractions(
            conversation_id=input.get("conversationId"),
            student_text=student_text,
            student_audio_url=f'{info.context["base_url"]}{student_audio_url}',
            ai_text=ai_response.get("ai_text", "Sorry, I couldn't generate a response."),
            ai_audio_url=f'{info.context["base_url"]}{ai_response.get("ai_audio_path", "")}',
        )

    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


@mutation.field("possibleTalk")
def resolve_possible_talk(_, info, conversationId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if the conversation exists and user has access
    conversation = (
        db.query(FreeConversation)
        .filter(
            FreeConversation.id == conversationId, FreeConversation.is_deleted == False
        )
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

    # Get previous interactions for context
    prev_interactions = (
        db.query(ConversationInteractions)
        .filter(ConversationInteractions.conversation_id == conversationId)
        .order_by(ConversationInteractions.created_at)
        .all()
    )

    # Generate possible talk idea
    ai_response = generate_possible_talk(profile, conversation, prev_interactions)
    return ai_response


@mutation.field("deleteConversationInteraction")
def resolve_delete_conversation_interaction(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    interaction = (
        db.query(ConversationInteractions)
        .filter(
            ConversationInteractions.id == id,
            ConversationInteractions.is_deleted == False,
        )
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


@conversation_interactions.field("studentText")
def resolve_student_text(interaction, info):
    return interaction.student_text


@conversation_interactions.field("studentAudioUrl")
def resolve_student_audio_url(interaction, info):
    return interaction.student_audio_url


@conversation_interactions.field("aiText")
def resolve_ai_text(interaction, info):
    return interaction.ai_text


@conversation_interactions.field("aiAudioUrl")
def resolve_ai_audio_url(interaction, info):
    return interaction.ai_audio_url


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
