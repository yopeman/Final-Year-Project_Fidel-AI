from langchain_core.prompts import PromptTemplate
from typing import List
from ...model.student_profile import StudentProfile
from ...model.modules import Modules
from ...model.module_lessons import ModuleLessons
from ...model.lesson_interactions import LessonInteractions
from . import llm

def ask_on_lesson(question: str, profile: StudentProfile, module: Modules, lesson: ModuleLessons, prev_lesson_interactions: List[LessonInteractions]) -> str:
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
            interactions.append(f"Student: {interaction.question}")
            interactions.append(f"Teacher: {interaction.answer}")
        prev_interactions_str = "\n".join(interactions) + "\n"

    prompts = PromptTemplate.from_template("""
You are an experienced language teacher helping a student learn. Answer the student's question based on the provided context.

**Student Profile:**
- Age: {age_range}
- Proficiency Level: {proficiency}
- Native Language: {native_language}
- Learning Goal: {learning_goal}
- Study Duration: {target_duration} {duration_unit}
- Special Constraints: {constraints}

**Learning Plan:**
{learning_plan}

**Current Module:**
- Name: {module_name}
- Description: {module_description}

**Current Lesson:**
- Title: {lesson_title}
- Content: {lesson_content}

**Previous Lesson Interactions:**
{prev_lesson_interactions}

**Student's New Question:**
{question}

Instructions:
- Provide a clear, helpful, and accurate answer tailored to the student's proficiency level
- Use simple language if the student is a beginner
- Include relevant examples from the lesson content when appropriate
- Encourage the student and provide positive reinforcement
- Keep your response focused and not too long
- If the question is not related to the lesson, gently redirect back to the topic
""")

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

            'module_name': module.name,
            'module_description': module.description,

            'lesson_title': lesson.title,
            'lesson_content': lesson.content,

            'prev_lesson_interactions': prev_interactions_str,
            'question': question
        })
        return response.content.strip()
    except Exception as e:
        # Fallback response in case of LLM failure
        return f"I'm sorry, I encountered an issue while processing your question. Please try again or contact support. Error: {str(e)}"
