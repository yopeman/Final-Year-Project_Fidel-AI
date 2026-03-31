from typing import List

from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama

from ...model.lesson_interactions import LessonInteractions
from ...model.module_lessons import ModuleLessons
from ...model.modules import Modules
from ...model.student_profile import StudentProfile
from .prompts import LESSON_QA_PROMPT


def ask_on_lesson(
    question: str,
    profile: StudentProfile,
    module: Modules,
    lesson: ModuleLessons,
    prev_lesson_interactions: List[LessonInteractions],
) -> str:
    """
    Generate Q&A by AI for language learning interactions
    """
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")

    if not profile:
        raise ValueError("Student profile is required")

    if not module:
        raise ValueError("Module is required")

    if not lesson:
        raise ValueError("Lesson is required")

    # Format previous interactions
    prev_interactions_str = ""
    if prev_lesson_interactions:
        interactions = []
        for interaction in prev_lesson_interactions:
            interactions.append(f"Student: {interaction.student_question}")
            interactions.append(f"Teacher: {interaction.ai_answer}")
        prev_interactions_str = "\n".join(interactions) + "\n"

    llm = ChatOllama(model="smollm2:135m")
    prompts = PromptTemplate.from_template(LESSON_QA_PROMPT)

    try:
        chain = prompts | llm
        response = chain.invoke(
            {
                "age_range": profile.age_range,
                "proficiency": profile.proficiency,
                "native_language": profile.native_language,
                "learning_goal": profile.learning_goal,
                "target_duration": profile.target_duration,
                "duration_unit": profile.duration_unit,
                "constraints": profile.constraints,
                "learning_plan": profile.ai_learning_plan,
                "module_name": module.name,
                "module_description": module.description,
                "lesson_title": lesson.title,
                "lesson_content": lesson.content,
                "prev_lesson_interactions": prev_interactions_str,
                "question": question,
            }
        )
        return response.content.strip()
    except Exception as e:
        print(e)
        return f"I'm sorry, I encountered an issue while processing your question. Please try again or contact support. Error: {str(e)}"
