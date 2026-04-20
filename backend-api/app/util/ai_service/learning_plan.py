import logging

from langchain_core.prompts import PromptTemplate

from ...model.student_profile import StudentProfile
from . import llm
from .prompts import LEARNING_PLAN_GENERATION_PROMPT, LEARNING_PLAN_UPDATE_PROMPT

logger = logging.getLogger(__name__)


def generate_learning_plan(profile: StudentProfile) -> str:
    """
    Generate a personalized learning plan for English language based on the student's profile.

    Args:
        profile (StudentProfile): The student's profile containing age range, proficiency, etc.

    Returns:
        str: The generated learning plan structured in modules and lessons.
    """

    prompts = PromptTemplate.from_template(LEARNING_PLAN_GENERATION_PROMPT)

    chain = prompts | llm
    try:
        response = chain.invoke(
            {
                "age_range": profile.age_range,
                "proficiency": profile.proficiency,
                "native_language": profile.native_language,
                "learning_goal": profile.learning_goal,
                "target_duration": profile.target_duration,
                "duration_unit": profile.duration_unit,
                "constraints": profile.constraints,
            }
        )
        return response.content
    except Exception as err:
        raise err


def update_learning_plan(profile: StudentProfile, improvements: str) -> str:
    """
    Update an existing learning plan for English language based on improvement instructions.

    Args:
        profile (StudentProfile): The student's profile containing age range, proficiency, etc.
        improvements (str): Instructions for improving the current plan.

    Returns:
        str: The updated learning plan structured in modules and lessons.
    """

    prompts = PromptTemplate.from_template(LEARNING_PLAN_UPDATE_PROMPT)

    chain = prompts | llm
    try:
        response = chain.invoke(
            {
                "proficiency": profile.proficiency,
                "native_language": profile.native_language,
                "learning_goal": profile.learning_goal,
                "target_duration": profile.target_duration,
                "duration_unit": profile.duration_unit,
                "current_plan": profile.ai_learning_plan,
                "improvements": improvements,
            }
        )
        return response.content
    except Exception as err:
        raise err
