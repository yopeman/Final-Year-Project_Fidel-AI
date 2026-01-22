from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchResults
from youtube_search import YoutubeSearch
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session

from .ai_agent import AIAgent
from ...model.student_profile import StudentProfile
from ...model.modules import Modules
from ...model.module_lessons import ModuleLessons
from ...model.lesson_vocabularies import LessonVocabularies
from ...model.lesson_online_articles import LessonOnlineArticles
from ...model.lesson_youtube_videos import LessonYouTubeVideos

MODEL_NAME = 'gemma3:4b'
llm = ChatOllama(model=MODEL_NAME, verbose=True)

def generate_learning_plan(profile: StudentProfile) -> str:
    """
    Generate a personalized learning plan for English language based on the student's profile.

    Args:
        profile (StudentProfile): The student's profile containing age range, proficiency, etc.

    Returns:
        str: The generated learning plan structured in modules and lessons.
    """
    prompt = PromptTemplate.from_template("""
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

Generate the learning plan:
""")

    chain = prompt | llm
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
    prompt = PromptTemplate.from_template("""
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

Generate the updated learning plan:
""")

    chain = prompt | llm
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



class YouTubeVideoResponse(BaseModel):
    title: str
    thumbnail_url: Optional[str]
    description: str
    video_url: str

class OnlineArticleResponse(BaseModel):
    title: str
    favicon_url: Optional[str]
    description: str
    page_url: str

class LessonVocabularyResponse(BaseModel):
    vocabulary: str
    meaning: str
    description: str

class ModuleLessonResponse(BaseModel):
    title: str
    content: str
    vocabularies: List[LessonVocabularyResponse]
    # online_articles: List[OnlineArticleResponse]
    # youtube_videos: List[YouTubeVideoResponse]

class ModuleResponse(BaseModel):
    name: str
    description: str
    lessons: List[ModuleLessonResponse]

class Response(BaseModel):
    modules: List[ModuleResponse]


@tool
def search_youtube_video(search_terms: str, max_results=5, retries=3):
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
    """
    Install or activate the learning plan for the student.

    This function is not yet implemented.

    Args:
        profile (StudentProfile): The student's profile.

    Returns:
        bool: The installation is successful.
    """
    
    system_prompts = """
You are Language teacher. give me structured relevant resources.
"""

    prompts = """
Based on the following information give me structured learning resources

Student Profile:
- Age range: {age_range}
- Proficiency: {proficiency}
- Native language: {native_language}
- Learning goal: {learning_goal}
- Target duration: {target_duration} {duration_unit}
- Constraints: {constraints}

Learning Plan:
{learning_plan}
"""

    user_prompts = PromptTemplate.from_template(prompts).format({
        'age_range': profile.age_range,
        'proficiency': profile.proficiency,
        'native_language': profile.native_language,
        'learning_goal': profile.learning_goal,
        'target_duration': profile.target_duration,
        'duration_unit': profile.duration_unit,
        'constraints': profile.constraints,
        'learning_plan': profile.ai_learning_plan,
    })

    search_tool = DuckDuckGoSearchResults(output_format='json')
    tools = [search_youtube_video, search_tool]
    agent = AIAgent(llm=llm, tools=tools, system_prompt=system_prompts, response_format=Response, debug=True)

    response: Response = agent.invoke(user_prompts)

    print('\n\n\n', response, '\n\n\n')

    for i, module in enumerate(response.modules, start=1):
        new_module = Modules(
            profile_id=profile.id,
            name=module.name,
            description=module.description,
            display_order=i,
            is_locked= not (i==1)
        )
        
        db.add(new_module)
        db.commit()
        db.flush()

        for j, lesson in enumerate(module.lessons, start=1):
            new_lesson = ModuleLessons(
                module_id=new_module.id,
                title=lesson.title,
                content=lesson.content,
                display_order=j,
                is_locked= not (i==1 and j==1)
            )

            db.add(new_lesson)
            db.commit()
            db.flush()

            for vocabulary in lesson.vocabularies:
                new_vocabulary = LessonVocabularies(
                    lesson_id=new_lesson.id,
                    vocabulary=vocabulary.vocabulary,
                    meaning=vocabulary.meaning,
                    description=vocabulary.description
                )

                db.add(new_vocabulary)
                db.commit()
                db.flush()

            for online_article in lesson.online_articles:
                new_article = LessonOnlineArticles(
                    lesson_id=new_lesson.id,
                    title=online_article.title,
                    favicon_url=online_article.favicon_url,
                    description=online_article.description,
                    page_url=online_article.page_url
                )

                db.add(new_article)
                db.commit()
                db.flush()

            for youtube_video in lesson.youtube_videos:
                new_video = LessonYouTubeVideos(
                    lesson_id=new_lesson.id,
                    title=youtube_video.title,
                    thumbnail_url=youtube_video.thumbnail_url,
                    description=youtube_video.description,
                    video_url=youtube_video.video_url
                )

                db.add(new_video)
                db.commit()
                db.flush()

    return True