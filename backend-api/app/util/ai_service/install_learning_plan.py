from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from pydantic import BaseModel
from typing import List
from langchain_core.messages import HumanMessage
from langchain_community.tools import DuckDuckGoSearchResults
from youtube_search import YoutubeSearch
from sqlalchemy.orm import Session

from ...model.student_profile import StudentProfile
from ...model.modules import Modules
from ...model.module_lessons import ModuleLessons
from ...model.lesson_vocabularies import LessonVocabularies
from ...model.lesson_online_articles import LessonOnlineArticles
from ...model.lesson_youtube_videos import LessonYouTubeVideos


class VocabularyOutput(BaseModel):
    vocabulary: str
    meaning: str
    description: str

class LessonOutput(BaseModel):
    name: str
    description: str

class ModuleOutput(BaseModel):
    name: str
    description: str
    lessons: List[LessonOutput]

class ModuleResponse(BaseModel):
    modules: List[ModuleOutput]

class VocabularyResponse(BaseModel):
    vocabularies: List[VocabularyOutput]


web_search = DuckDuckGoSearchResults(output_format='list')
def youtube_search(search_terms: str, max_results=5, retries=3):
    """
    Search YouTube video for educational videos and return results.
    """
    videos = YoutubeSearch(
        search_terms=search_terms, 
        max_results=max_results, 
        retries=retries
    ).to_dict(clear_cache=True)

    for video in videos:
        video["full_url"] = "https://www.youtube.com" + video["url_suffix"]
    return videos


def install_learning_plan(profile: StudentProfile, db: Session) -> bool:
    prompts = PromptTemplate.from_template("""
    # LANGUAGE LEARNING PLAN GENERATOR
    
    ## ROLE
    You are an expert language learning curriculum designer with expertise in:
    - Creating age-appropriate language learning materials
    - Structuring progressive learning paths based on proficiency levels
    - Adapting content for native language interference patterns
    - Designing practical learning modules aligned with specific goals
    
    ## STUDENT PROFILE ANALYSIS
    Please analyze this student profile carefully:
    
    ### Demographic & Background
    - **Age Range**: {age_range}
    - **Native Language**: {native_language}
    - **Current Proficiency Level**: {proficiency}
    
    ### Learning Objectives & Constraints
    - **Primary Goal**: {learning_goal}
    - **Target Duration**: {target_duration} {duration_unit}
    - **Constraints**: {constraints}
    
    ## TASK: CREATE STRUCTURED LEARNING MODULES
    
    Based on the student's profile and their AI-generated learning plan below, create comprehensive learning modules. Each module should:
    1. Build progressively from previous knowledge
    2. Include practical, real-world applications
    3. Address common challenges for {native_language} speakers
    4. Fit within the overall time constraint of {target_duration} {duration_unit}
    
    ### AI Learning Plan Context:
    {learning_plan}
    
    ## OUTPUT REQUIREMENTS
    
    Return a structured curriculum with:
    1. **3-5 modules** (adjust based on duration and complexity)
    2. **Each module** should contain:
       - Clear, descriptive name
       - Learning objectives summary
       - 3-7 lessons that build progressively
    3. **Each lesson** should have:
       - Practical, action-oriented title
       - Clear description of what will be learned
    
    ## IMPORTANT CONSIDERATIONS
    
    - **Progression**: Ensure each module logically leads to the next
    - **Practicality**: Focus on immediately usable language skills
    - **Motivation**: Include engaging topics that maintain interest
    - **Assessment**: Consider how progress will be measured
    
    Now, generate the structured learning modules:
    """).format(**{
        'age_range': profile.age_range,
        'proficiency': profile.proficiency,
        'native_language': profile.native_language,
        'learning_goal': profile.learning_goal,
        'target_duration': profile.target_duration,
        'duration_unit': profile.duration_unit,
        'constraints': profile.constraints,
        'learning_plan': profile.ai_learning_plan
    })


    response: ModuleResponse = (
        ChatOllama(model='llama3.1:8b')
        .with_structured_output(ModuleResponse)
        .invoke([HumanMessage(content=prompts)])
    )


    for i, module in enumerate(response.modules, start=1):
        new_module = Modules(
            profile_id=profile.id,
            name=module.name,
            description=module.description,
            display_order=i,
            is_locked= not (i==1)
        )
        db.add(new_module)
        db.flush()

        for j, lesson in enumerate(module.lessons, start=1):
            content = _generate_content(profile, module, lesson)
            new_lesson = ModuleLessons(
                module_id=new_module.id,
                title=lesson.name,
                content=content,
                display_order=j,
                is_locked= not (i==1 and j==1)
            )
            db.add(new_lesson)
            db.flush()

            vocabularies: VocabularyResponse = _generate_vocabularies(profile, module, lesson, content)
            for vocabulary in vocabularies.vocabularies:
                new_vocabulary = LessonVocabularies(
                    lesson_id=new_lesson.id,
                    vocabulary=vocabulary.vocabulary,
                    meaning=vocabulary.meaning,
                    description=vocabulary.description
                )
                db.add(new_vocabulary)
                db.flush()

            articles = web_search.invoke(lesson.name)[:5]
            for article in articles:
                new_article = LessonOnlineArticles(
                    lesson_id=new_lesson.id,
                    title=article.get('title', '')[:200],
                    favicon_url=article.get('favicon_url', [None]),
                    description=article.get('snippet', ''),
                    page_url=article.get('link', '')
                )
                db.add(new_article)
                db.flush()

            videos = youtube_search(lesson.name)[:5]
            for video in videos:
                new_video = LessonYouTubeVideos(
                    lesson_id=new_lesson.id,
                    title=video.get('title', '')[:200],
                    thumbnail_url=video.get('thumbnails', [None])[0] if video.get('thumbnails') else None,
                    description=video.get('long_desc', ''),
                    video_url=video.get('full_url', '')
                )
                db.add(new_video)
                db.flush()

    db.commit()
    return True

def _generate_content(profile: StudentProfile, module: ModuleOutput, lesson: LessonOutput) -> str:
    prompts = PromptTemplate.from_template("""
    # COMPREHENSIVE LANGUAGE LESSON DESIGN
    
    ## ROLE & INSTRUCTIONAL APPROACH
    You are an expert language educator specializing in teaching {target_language} to {native_language} speakers. Your teaching philosophy emphasizes:
    - **Scaffolded Learning**: Building from simple to complex concepts
    - **Contextual Understanding**: Teaching language in meaningful contexts
    - **Error Prevention**: Anticipating and addressing common mistakes
    - **Active Engagement**: Creating opportunities for practice and application
    
    ## STUDENT-CENTERED ADAPTATION
    Customize this lesson for:
    - **Age Group**: {age_range} (use age-appropriate examples and activities)
    - **Proficiency Level**: {proficiency} (adjust complexity accordingly)
    - **Native Language**: {native_language} (address specific interference patterns)
    - **Learning Goal**: {learning_goal} (ensure alignment with ultimate objective)
    
    ## LESSON CONTEXT
    **Module**: {module_title}
    *{module_description}*
    
    **Lesson**: {lesson_title}
    *{lesson_description}*
    
    **Overall Learning Plan Context**:
    {learning_plan}
    
    ## LESSON STRUCTURE REQUIREMENTS
    
    Create a comprehensive, ready-to-use lesson in Markdown format with these exact sections:
    
    ### 1. 🎯 Lesson Objectives & Relevance
    - **What**: Clearly state what students will be able to DO by the end
    - **Why**: Explain practical relevance to real-life situations
    - **Connection**: Link to previous learning and future applications
    
    ### 2. 📚 Foundational Concepts
    - **Prerequisite Knowledge**: List and briefly explain needed background
    - **Key Terminology**: Define 3-5 essential terms with simple explanations
    - **Mental Models**: Provide analogies or frameworks for understanding
    
    ### 3. 🧩 Core Content & Step-by-Step Instruction
    Organize into logical segments with this pattern for each concept:
    1. **Concept Introduction**: What it is and why it matters
    2. **Clear Explanation**: Simple language with minimal jargon
    3. **Concrete Examples**: Multiple examples showing varied usage
    4. **Visual/Conceptual Aid**: Table, diagram, or comparison if helpful
    5. **Check for Understanding**: Quick self-check question
    
    ### 4. 🔍 Contrastive Analysis & Error Prevention
    - **Native Language Interference**: Specific challenges for {native_language} speakers
    - **Common Mistakes**: List with explanations of why they occur
    - **Correct vs. Incorrect**: Side-by-side comparisons
    - **Memory Aids**: Mnemonics or tricks to remember correct usage
    
    ### 5. 🎭 Real-World Application
    - **Practical Scenarios**: Dialogue examples or situational usage
    - **Cultural Notes**: Relevant cultural context if applicable
    - **Immediate Application**: Quick practice activity
    
    ### 6. ✅ Understanding Checkpoints
    Create 3-5 varied exercises WITHOUT answers (for teacher/self-assessment):
    - **Format 1**: Multiple choice with plausible distractors
    - **Format 2**: Fill-in-the-blank with context
    - **Format 3**: Short answer requiring application
    - **Format 4**: Error correction exercise
    - **Format 5**: Mini-production task
    
    ### 7. 📝 Summary & Integration
    - **Key Takeaways**: Bulleted list of most important points
    - **Skill Integration**: How this fits with previously learned material
    - **Progression Path**: What comes next in the learning journey
    
    ### 8. 🚀 Practice & Extension Activities
    Provide 2-3 targeted practice suggestions:
    - **Activity 1**: Quick, low-prep practice (5-10 minutes)
    - **Activity 2**: Applied practice with real-world connection
    - **Activity 3**: Creative extension for advanced learners
    
    ## FORMATTING & PRESENTATION GUIDELINES
    1. **Accessibility**: Use clear headings, bullet points, and white space
    2. **Engagement**: Incorporate icons (🎯, 📚, etc.) for visual organization
    3. **Clarity**: Bold key terms and important concepts
    4. **Practicality**: All examples should be immediately useful
    
    ## CONSTRAINTS & ADAPTATIONS
    - **Time Allocation**: Lesson should fit within overall {target_duration} plan
    - **Complexity Limits**: Respect {proficiency} level - don't overwhelm
    - **Constraints**: {constraints}
    
    Now, create an engaging, pedagogically sound lesson for "{lesson_title}":
    """).format(**{
        'target_language': 'the target language',  # You might want to add this to profile
        'age_range': profile.age_range,
        'proficiency': profile.proficiency,
        'native_language': profile.native_language,
        'learning_goal': profile.learning_goal,
        'constraints': profile.constraints,
        'target_duration': profile.target_duration,
        'learning_plan': profile.ai_learning_plan,
        'module_title': module.name,
        'module_description': module.description,
        'lesson_title': lesson.name,
        'lesson_description': lesson.description,
    })
    
    response: str = (
        ChatOllama(model='gemma3:4b')
        .invoke([HumanMessage(content=prompts)])
        .content
    )

    return response

def _generate_vocabularies(profile: StudentProfile, module: ModuleOutput, lesson: LessonOutput, content: str) -> str:
    prompts = PromptTemplate.from_template("""
    # TARGETED VOCABULARY SELECTION FOR LANGUAGE LEARNING
    
    ## VOCABULARY SELECTION CRITERIA
    Select 8-12 key vocabulary items for this lesson that are:
    1. **Essential**: Critical for understanding the lesson content
    2. **High-Frequency**: Commonly used in real communication
    3. **Learnable**: Appropriate for {proficiency} level
    4. **Transferable**: Useful across multiple contexts
    
    ## CONTEXT & LEARNING FOCUS
    **Student Profile**:
    - Age: {age_range}
    - Native Language: {native_language}
    - Current Level: {proficiency}
    - Learning Goal: {learning_goal}
    
    **Lesson Context**:
    - Module: {module_title} ({module_description})
    - Lesson: {lesson_title} ({lesson_description})
    
    **Lesson Content**:
    {lesson_content}
    
    ## VOCABULARY FORMAT REQUIREMENTS
    For each vocabulary item, provide:
    
    1. **Vocabulary**: The target word/phrase
    2. **Meaning**: Clear, simple definition in context
    3. **Description**: Include:
       - Part of speech
       - Pronunciation guidance (if challenging for {native_language} speakers)
       - Example sentence showing natural usage
       - Common collocations or patterns
       - Memory aid or connection to {native_language} if helpful
    
    ## SELECTION PRIORITIES
    Prioritize vocabulary that:
    - Addresses specific {native_language} speaker challenges
    - Supports the practical application of {lesson_title}
    - Builds toward {learning_goal}
    - Includes both receptive and productive vocabulary
    
    ## OUTPUT STRUCTURE
    Provide a balanced mix of:
    - 40% Core functional vocabulary
    - 30% Topic-specific terminology
    - 20% Collocations and phrases
    - 10% Higher-level expressions for extension
    
    Now, select and describe the most valuable vocabulary for this lesson:
    """).format(**{
    'age_range': profile.age_range,
    'proficiency': profile.proficiency,
    'native_language': profile.native_language,
    'learning_goal': profile.learning_goal,
    'constraints': profile.constraints,
    'module_title': module.name,
    'module_description': module.description,
    'lesson_title': lesson.name,
    'lesson_description': lesson.description,
    'lesson_content': content,
})
    
    response: VocabularyResponse = (
        ChatOllama(model='llama3.1:8b')
        .with_structured_output(VocabularyResponse)
        .invoke([HumanMessage(content=prompts)])
    )

    return response
