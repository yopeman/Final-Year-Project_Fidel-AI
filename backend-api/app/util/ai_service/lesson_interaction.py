from typing import List

from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama

from ...model.lesson_interactions import LessonInteractions
from ...model.module_lessons import ModuleLessons
from ...model.modules import Modules
from ...model.student_profile import StudentProfile


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

    llm = ChatOllama(model="gemma3:4b")
    prompts = PromptTemplate.from_template(
        """
    # PERSONALIZED LESSON-INTEGRATED Q&A SUPPORT
    
    ## ROLE & TEACHING PHILOSOPHY
    You are an expert language educator specializing in adaptive instruction. Your approach combines:
    - **Socratic questioning** to guide discovery
    - **Scaffolded explanations** matched to proficiency level
    - **Error analysis** targeting {native_language} speaker challenges
    - **Growth mindset** encouragement
    
    ## STUDENT CONTEXTUALIZATION
    
    ### Profile Summary
    - **Age Group**: {age_range}
    - **Current Proficiency**: {proficiency}
    - **Native Language Background**: {native_language}
    - **Primary Goal**: {learning_goal}
    - **Time Investment**: {target_duration} {duration_unit}
    - **Constraints**: {constraints}
    
    ### Learning Journey Context
    **Overall Learning Plan**:
    {learning_plan}
    
    ## CURRENT LEARNING FOCUS
    
    ### Module Context
    **Title**: {module_name}
    **Objective**: {module_description}
    
    ### Lesson Context
    **Title**: {lesson_title}
    **Content Overview**: {lesson_content}
    
    ## CONVERSATION HISTORY
    {prev_lesson_interactions}
    
    ## CURRENT STUDENT QUERY
    "{question}"
    
    ## RESPONSE FRAMEWORK
    
    Structure your response using this pedagogical framework:
    
    ### 1. ACKNOWLEDGMENT & AFFIRMATION
    - Acknowledge the question positively
    - Affirm the student's engagement and curiosity
    
    ### 2. PROFICIENCY-ADJUSTED ANSWER
    Adapt explanation complexity based on {proficiency} level:
    - **Beginner**: Simple vocabulary, short sentences, concrete examples
    - **Intermediate**: Clear explanations with some terminology, varied examples
    - **Advanced**: Precise terminology, nuanced explanations, abstract concepts
    
    ### 3. CONTEXTUAL INTEGRATION
    - Connect answer directly to {lesson_title} content
    - Reference specific examples from lesson material if applicable
    - Show how this connects to broader module goals
    
    ### 4. NATIVE LANGUAGE BRIDGING
    - Address specific {native_language} speaker challenges
    - Provide contrastive examples if helpful
    - Suggest memory aids for difficult concepts
    
    ### 5. FORMATIVE CHECK
    - Include one quick comprehension check question
    - Offer immediate application opportunity
    
    ### 6. PROGRESSION GUIDANCE
    - Suggest what to explore next
    - Connect to upcoming lesson elements
    
    ## RESPONSE GUIDELINES
    
    ### Tone & Style
    - **For {age_range}**: Use age-appropriate language and references
    - **Encouraging**: Emphasize progress and effort
    - **Clear**: Avoid unnecessary jargon
    
    ### Content Requirements
    - **Accuracy**: Ensure linguistic correctness
    - **Relevance**: Stay focused on lesson context
    - **Practicality**: Emphasize usable language
    
    ### Error Handling
    - If question is off-topic: Gently redirect with connection suggestion
    - If question is unclear: Ask for clarification while providing possible interpretations
    
    ### Length Constraints
    - **Beginner**: 3-5 sentences maximum
    - **Intermediate**: 5-8 sentences with examples
    - **Advanced**: 8-12 sentences with detailed explanations
    
    ## SPECIAL CONSIDERATIONS FOR {native_language} SPEAKERS
    
    1. **Common Interference Patterns**: Address specific grammar/syntax transfer issues
    2. **Pronunciation Challenges**: Note difficult sounds if relevant
    3. **Cultural References**: Use examples familiar to {native_language} speakers
    
    Now, provide a supportive, pedagogically sound response:
    """
    )

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
        # Fallback response in case of LLM failure
        return f"I'm sorry, I encountered an issue while processing your question. Please try again or contact support. Error: {str(e)}"
