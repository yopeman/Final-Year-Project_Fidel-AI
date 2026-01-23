from langchain_core.prompts import PromptTemplate
from ...model.student_profile import StudentProfile
from ...model.free_conversation import FreeConversation
from ...model.conversation_interactions import ConversationInteractions
from typing import Dict, List
from . import llm

# Prompt templates as constants for better readability and maintainability
TOPIC_SUMMARY_PROMPT = """
Summarize the following idea in a single, very short phrase:
- Idea: {idea}
"""

TOPIC_GENERATION_PROMPT = """
Students are able to deal with you. The student has the following information:

**Student Profile:**
- Age: {age_range}
- Proficiency Level: {proficiency}
- Native Language: {native_language}
- Learning Goal: {learning_goal}
- Study Duration: {target_duration} {duration_unit}
- Special Constraints: {constraints}

**Learning Plan:**
{learning_plan}

* Based on this, give me one conversation title/idea.
"""

CONVERSATION_RESPONSE_PROMPT = """
You are a native English-speaking friend of the student. Based on the following information, deal with the student:

**Student Profile:**
- Age: {age_range}
- Proficiency Level: {proficiency}
- Native Language: {native_language}
- Learning Goal: {learning_goal}
- Study Duration: {target_duration} {duration_unit}
- Special Constraints: {constraints}

**Learning Plan:**
{learning_plan}

Student information is as follows:

* You and the student are dealing with:
- {starting_topic}
- {topic_summary_phrase}

**Previous Lesson Interactions:**
{prev_lesson_interactions}

**Student's Now Says:**
{question}
"""

def ai_topic_summary(idea: str) -> str:
    """
    Generate a concise topic summary phrase from the given idea.
    """
    if not idea or not idea.strip():
        raise ValueError("Idea cannot be empty")

    prompts = PromptTemplate.from_template(TOPIC_SUMMARY_PROMPT)
    chain = prompts | llm
    response = chain.invoke({'idea': idea})
    return response.content


def ai_generated_topic(profile: StudentProfile) -> Dict[str, str]:
    """
    Generate a conversation topic and summary based on the student's profile.
    """
    if not profile:
        raise ValueError("Student profile is required")

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
    generated_idea = response.content

    return {
        'starting_topic': generated_idea,
        'topic_summary_phrase': ai_topic_summary(generated_idea)
    }

def ask_on_conversation(question: str, profile: StudentProfile, conversation: FreeConversation, prev_conversation_interactions: List[ConversationInteractions]) -> str:
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
            interactions.append(f"Student: {interaction.question}")
            interactions.append(f"AI: {interaction.answer}")
        prev_interactions_str = "\n".join(interactions) + "\n"

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
        return response.content.strip()
    except Exception as e:
        # Fallback response in case of LLM failure
        return f"I'm sorry, I encountered an issue while processing your question. Please try again or contact support. Error: {str(e)}"
