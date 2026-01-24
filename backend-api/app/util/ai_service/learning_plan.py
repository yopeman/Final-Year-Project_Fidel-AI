from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from ...model.student_profile import StudentProfile
import logging

logger = logging.getLogger(__name__)

def generate_learning_plan(profile: StudentProfile) -> str:
    """
    Generate a personalized learning plan for English language based on the student's profile.

    Args:
        profile (StudentProfile): The student's profile containing age range, proficiency, etc.

    Returns:
        str: The generated learning plan structured in modules and lessons.
    """

    llm = ChatOllama(model='gemma3:4b')
    prompts = PromptTemplate.from_template("""
Based on the following student profile, create a structured learning plan for English language.

Student Profile:
- Age range: {age_range}
- Proficiency: {proficiency}
- Native language: {native_language}
- Learning goal: {learning_goal}
- Target duration: {target_duration} {duration_unit}
- Constraints: {constraints}

Requirements:
- The plan must be structured with modules and their lessons.
- Each module should have a title and description.
- Each lesson should have a title, description, and estimated time.
- Ensure the plan is age-appropriate, considers proficiency level, and respects constraints.
- Format the output clearly with headings for modules and lessons.
- Produce **clear, well-structured Markdown output**

Generate the learning plan:
""")

    chain = prompts | llm
    try:
        response = chain.invoke({
            'age_range': profile.age_range,
            'proficiency': profile.proficiency,
            'native_language': profile.native_language,
            'learning_goal': profile.learning_goal,
            'target_duration': profile.target_duration,
            'duration_unit': profile.duration_unit,
            'constraints': profile.constraints,
        })
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

    llm = ChatOllama(model='gemma3:4b')
    prompts = PromptTemplate.from_template("""
Based on the following student profile and current plan, improve the plan according to the given instructions.

Student Profile:
- Age range: {age_range}
- Proficiency: {proficiency}
- Native language: {native_language}
- Learning goal: {learning_goal}
- Target duration: {target_duration} {duration_unit}
- Constraints: {constraints}

Current Plan:
{current_plan}

Improvement Instructions:
{improvements}

Requirements:
- Maintain the structure with modules and their lessons.
- Incorporate the improvement instructions while keeping the plan age-appropriate, proficiency-level suitable, and constraint-compliant.
- Each module should have a title and description.
- Each lesson should have a title, description, and estimated time.
- Format the output clearly with headings for modules and lessons.
- Produce **clear, well-structured Markdown output**

Generate the updated learning plan:
""")

    chain = prompts | llm
    try:
        response = chain.invoke({
            'age_range': profile.age_range,
            'proficiency': profile.proficiency,
            'native_language': profile.native_language,
            'learning_goal': profile.learning_goal,
            'target_duration': profile.target_duration,
            'duration_unit': profile.duration_unit,
            'constraints': profile.constraints,
            'current_plan': profile.ai_learning_plan,
            'improvements': improvements,
        })
        return response.content
    except Exception as err:
        raise err