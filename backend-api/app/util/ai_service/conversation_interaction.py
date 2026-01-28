from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from ...model.student_profile import StudentProfile
from ...model.free_conversation import FreeConversation
from ...model.conversation_interactions import ConversationInteractions
from .normalize_text_for_tts import normalize_text_for_tts
from faster_whisper import WhisperModel
from typing import Dict, List
from gtts import gTTS
from fastapi import UploadFile
import uuid

# Prompt templates as constants for better readability and maintainability
TOPIC_SUMMARY_PROMPT = """
# CONVERSATION TOPIC DISTILLATION

## TASK
Distill the following conversation idea into a concise, memorable phrase that:
1. Captures the core theme in 3-7 words
2. Is engaging and conversation-provoking
3. Suggests natural language use opportunities

## ORIGINAL IDEA
{idea}

## GUIDELINES
- Focus on the most conversationally rich aspect
- Use action-oriented or question-based phrasing when possible
- Ensure age-appropriateness for language learning
- Make it immediately understandable

## OUTPUT FORMAT
Provide ONLY the summary phrase without any additional text.
"""

TOPIC_GENERATION_PROMPT = """
# PERSONALIZED CONVERSATION TOPIC GENERATION

## ROLE
You are a conversation designer specializing in language learning through authentic dialogue. Your expertise includes:
- Creating engaging conversation starters
- Matching topics to learner interests and proficiency
- Designing culturally relevant dialogue contexts

## STUDENT PROFILE ANALYSIS

### Demographic & Learning Context
- **Age Group**: {age_range}
- **Current Proficiency**: {proficiency}
- **Native Language Background**: {native_language}
- **Primary Learning Goal**: {learning_goal}
- **Time Commitment**: {target_duration} {duration_unit}
- **Constraints/Preferences**: {constraints}

### Learning Plan Context
{learning_plan}

## CONVERSATION DESIGN PRINCIPLES

Create conversation topics that:
1. **Authenticity**: Reflect real-world communication situations
2. **Engagement**: Spark genuine interest and participation
3. **Language Richness**: Provide opportunities for varied vocabulary and structures
4. **Proficiency Alignment**: Match complexity to {proficiency} level
5. **Goal Relevance**: Support progress toward {learning_goal}

## TOPIC CATEGORY GUIDANCE

Based on {age_range} and {proficiency}, prioritize:
- **Children ({age_range})**: Play-based, imaginative, simple scenarios
- **Teens ({age_range})**: Social media, hobbies, school life, peer interactions
- **Adults ({age_range})**: Work situations, travel, cultural exchange, practical tasks

## GENERATION REQUIREMENTS

Produce ONE conversation topic that includes:

### Core Idea
A clear, specific conversation scenario or question

### Language Learning Value
- Vocabulary opportunities
- Grammar structures practice
- Functional language use

### Engagement Factors
- Personal relevance to {age_range}
- Cultural appropriateness
- Open-ended discussion potential

## OUTPUT FORMAT
Provide only the conversation topic/idea without additional commentary.
"""

CONVERSATION_RESPONSE_PROMPT = """
# NATURAL LANGUAGE CONVERSATION SIMULATION

## ROLE & PERSONA
You are a friendly, patient conversation partner helping an English learner practice through authentic dialogue. You adapt your language to match the student's proficiency while maintaining natural conversational flow.

## CONVERSATION CONTEXT

### Student Profile Context
- **Age**: {age_range}
- **Proficiency Level**: {proficiency}
- **Native Language**: {native_language}
- **Learning Objectives**: {learning_goal}
- **Constraints**: {constraints}

### Learning Journey Context
**Overall Learning Plan**:
{learning_plan}

### Current Conversation Framework
**Starting Topic**: {starting_topic}
**Theme Summary**: {topic_summary_phrase}

## DIALOGUE HISTORY
{prev_lesson_interactions}

## CURRENT STUDENT MESSAGE
"{question}"

## RESPONSE STRATEGY FRAMEWORK

### 1. NATURAL FLOW MAINTENANCE
- Continue the conversational thread naturally
- Match the tone and style of previous exchanges
- Maintain appropriate pace for {proficiency} level

### 2. LANGUAGE MODELING
- Use correct grammar and natural phrasing
- Incorporate relevant vocabulary from the conversation theme
- Provide implicit correction through modeling when appropriate

### 3. PROFIENCY-ADAPTED COMPLEXITY
- **Beginner ({proficiency})**: Short sentences, simple vocabulary, clear structure
- **Intermediate ({proficiency})**: Longer sentences, varied structures, some idioms
- **Advanced ({proficiency})**: Complex sentences, nuanced expressions, cultural references

### 4. CONVERSATION DEVELOPMENT
- Add new but related information
- Ask open-ended follow-up questions
- Introduce natural turns in the conversation

### 5. ERROR HANDLING & SUPPORT
- If message has errors: Model correct language without explicit correction
- If message is unclear: Clarify while maintaining engagement
- If off-topic: Gently steer back with connection

## SPECIFIC GUIDELINES

### For {age_range} Learners
- Use age-appropriate references and scenarios
- Adjust formality level appropriately
- Consider developmental appropriateness

### For {native_language} Speakers
- Be aware of common interference patterns
- Use contrastive examples when helpful
- Bridge cultural references when relevant

### Conversation Mechanics
- **Length**: 1-3 sentences typically (adjust for {proficiency})
- **Turn-taking**: Leave natural openings for response
- **Engagement**: Show genuine interest in student's message

### Language Support Features
- **Vocabulary Recycling**: Reuse recently introduced words naturally
- **Structure Modeling**: Demonstrate target grammar in context
- **Pronunciation Hints**: Include phonetic clues for difficult words if needed

## RESPONSE STRUCTURE

1. **Acknowledgment**: Recognize the student's message
2. **Content Response**: Address the substance of their message
3. **Conversation Extension**: Add new information or perspective
4. **Engagement Prompt**: Ask a related question or invite continuation

Now, generate a natural, supportive conversation response:
"""

def ai_topic_summary(idea: str) -> str:
    """
    Generate a concise topic summary phrase from the given idea.
    """
    if not idea or not idea.strip():
        raise ValueError("Idea cannot be empty")
    
    llm = ChatOllama(model='gemma3:4b')
    prompts = PromptTemplate.from_template(TOPIC_SUMMARY_PROMPT)
    chain = prompts | llm
    response = chain.invoke({'idea': idea})
    return response.content


def ai_generated_topic(profile: StudentProfile) -> str:
    """
    Generate a conversation topic and summary based on the student's profile.
    """
    if not profile:
        raise ValueError("Student profile is required")

    llm = ChatOllama(model='gemma3:4b')
    prompts = PromptTemplate.from_template(TOPIC_GENERATION_PROMPT)
    chain = prompts | llm
    response = chain.invoke({
        'age_range': profile.age_range,
        'proficiency': profile.proficiency,
        'native_language': profile.native_language,
        'learning_goal': profile.learning_goal,
        'target_duration': profile.target_duration,
        'duration_unit': profile.duration_unit,
        'constraints': profile.constraints,
        'learning_plan': profile.ai_learning_plan,
    })
    return response.content


def ask_on_conversation(question: str, profile: StudentProfile, conversation: FreeConversation, prev_conversation_interactions: List[ConversationInteractions]) -> Dict[str, str]:
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

    llm = ChatOllama(model='gemma3:4b')
    prompts = PromptTemplate.from_template(CONVERSATION_RESPONSE_PROMPT)
    try:
        chain = prompts | llm
        response = chain.invoke({
            'age_range': profile.age_range,
            'proficiency': profile.proficiency,
            'native_language': profile.native_language,
            'learning_goal': profile.learning_goal,
            'target_duration': profile.target_duration,
            'duration_unit': profile.duration_unit,
            'constraints': profile.constraints,
            'learning_plan': profile.ai_learning_plan,

            'starting_topic': conversation.starting_topic,
            'topic_summary_phrase': conversation.topic_summary_phrase,

            'prev_lesson_interactions': prev_interactions_str,
            'question': question
        })

        ai_text = response.content.strip()
        ai_audio_path = text_to_speech(
            normalize_text_for_tts(ai_text)
        )

        return {
            'ai_text': ai_text,
            'ai_audio_path': ai_audio_path
        }

    except Exception as e:
        # Fallback response in case of LLM failure
        return f"I'm sorry, I encountered an issue while processing your question. Please try again or contact support. Error: {str(e)}"


def text_to_speech(text: str) -> str:
    ai_audio_path = f'static/{uuid.uuid4()}.mp3'
    tts = gTTS(text)
    tts.save(ai_audio_path)
    return ai_audio_path

def speech_to_text(filepath: str) -> str:
    model = WhisperModel("base", compute_type="int8")
    segments, _ = model.transcribe(filepath)
    return " ".join(segment.text for segment in segments)
