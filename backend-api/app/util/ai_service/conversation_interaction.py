import uuid
from typing import Dict, List

from fastapi import UploadFile
from faster_whisper import WhisperModel
from gtts import gTTS
from langchain_core.prompts import PromptTemplate

from ...model.conversation_interactions import ConversationInteractions
from ...model.free_conversation import FreeConversation
from ...model.student_profile import StudentProfile
from .normalize_text_for_tts import normalize_text_for_tts
from . import llm
from .prompts import (
    TOPIC_SUMMARY_PROMPT,
    TOPIC_GENERATION_PROMPT,
    CONVERSATION_RESPONSE_PROMPT,
    POSSIBLE_TALK_PROMPT,
)

# Prompt templates imported from .prompts module


def ai_topic_summary(idea: str) -> str:
    """
    Generate a concise topic summary phrase from the given idea.
    """
    if not idea or not idea.strip():
        raise ValueError("Idea cannot be empty")

    prompts = PromptTemplate.from_template(TOPIC_SUMMARY_PROMPT)
    chain = prompts | llm
    response = chain.invoke({"idea": idea})
    return response.content


def ai_generated_topic(profile: StudentProfile) -> str:
    """
    Generate a conversation topic and summary based on the student's profile.
    """
    if not profile:
        raise ValueError("Student profile is required")

    prompts = PromptTemplate.from_template(TOPIC_GENERATION_PROMPT)
    chain = prompts | llm
    response = chain.invoke(
        {
            "age_range": profile.age_range,
            "proficiency": profile.proficiency,
            "native_language": profile.native_language,
            "learning_goal": profile.learning_goal,
        }
    )
    return response.content


def ask_on_conversation(
    question: str,
    profile: StudentProfile,
    conversation: FreeConversation,
    prev_conversation_interactions: List[ConversationInteractions],
) -> Dict[str, str]:
    """
    Generate an AI response for language learning conversation interactions.
    """
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")

    if not profile:
        raise ValueError("Student profile is required")

    if not conversation:
        raise ValueError("Conversation is required")

    # Format previous interactions
    prev_interactions_str = ""
    if prev_conversation_interactions:
        interactions = []
        for interaction in prev_conversation_interactions:
            interactions.append(f"Student: {interaction.student_text}")
            interactions.append(f"AI: {interaction.ai_text}")
        prev_interactions_str = "\n".join(interactions) + "\n"

    prompts = PromptTemplate.from_template(CONVERSATION_RESPONSE_PROMPT)
    try:
        chain = prompts | llm
        response = chain.invoke(
            {
                "age_range": profile.age_range,
                "proficiency": profile.proficiency,
                "native_language": profile.native_language,
                "learning_goal": profile.learning_goal,
                "starting_topic": conversation.starting_topic,
                "topic_summary_phrase": conversation.topic_summary_phrase,
                "prev_lesson_interactions": prev_interactions_str,
                "question": question,
            }
        )

        ai_text = response.content.strip()
        ai_audio_path = text_to_speech(normalize_text_for_tts(ai_text))

        return {"ai_text": ai_text, "ai_audio_path": ai_audio_path}

    except Exception as e:
        print(e)
        return f"I'm sorry, I encountered an issue while processing your question. Please try again or contact support. Error: {str(e)}"


def text_to_speech(text: str) -> str:
    ai_audio_path = f"static/{uuid.uuid4()}.mp3"
    tts = gTTS(text)
    tts.save(ai_audio_path)
    return ai_audio_path


def speech_to_text(filepath: str) -> str:
    model = WhisperModel("base", compute_type="int8")
    segments, _ = model.transcribe(filepath)
    return " ".join(segment.text for segment in segments)


def generate_possible_talk(
    profile: StudentProfile,
    conversation: FreeConversation,
    prev_conversation_interactions: List[ConversationInteractions],
) -> str:
    """
    Generate 3 possible things the student could say in this conversation.
    Returns newline-separated suggestions that will be split into an array by the resolver.
    """
    if not profile:
        raise ValueError("Student profile is required")

    if not conversation:
        raise ValueError("Conversation is required")

    # Format previous interactions (last 3 exchanges for context)
    prev_interactions_str = ""
    if prev_conversation_interactions:
        interactions = []
        # Take last 3 exchanges only to keep context relevant
        recent = prev_conversation_interactions[-3:] if len(prev_conversation_interactions) > 3 else prev_conversation_interactions
        for interaction in recent:
            interactions.append(f"Student: {interaction.student_text}")
            interactions.append(f"AI: {interaction.ai_text}")
        prev_interactions_str = "\n".join(interactions) + "\n"

    prompts = PromptTemplate.from_template(POSSIBLE_TALK_PROMPT)
    try:
        chain = prompts | llm
        response = chain.invoke(
            {
                "age_range": profile.age_range,
                "proficiency": profile.proficiency,
                "native_language": profile.native_language,
                "learning_goal": profile.learning_goal,
                "starting_topic": conversation.starting_topic,
                "topic_summary_phrase": conversation.topic_summary_phrase,
                "prev_lesson_interactions": prev_interactions_str,
            }
        )
        return response.content.strip()

    except Exception as e:
        print(e)
        return "What do you think about this?\nCan you tell me more?\nI have a question about that."
