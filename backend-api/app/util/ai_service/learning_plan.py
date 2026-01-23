from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langchain_community.tools import DuckDuckGoSearchResults
from youtube_search import YoutubeSearch
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
import logging

from ...model.student_profile import StudentProfile
from ...model.modules import Modules
from ...model.module_lessons import ModuleLessons
from ...model.lesson_vocabularies import LessonVocabularies
from ...model.lesson_online_articles import LessonOnlineArticles
from ...model.lesson_youtube_videos import LessonYouTubeVideos

MODEL_NAME = 'llama3.1:8b'
llm = ChatOllama(model=MODEL_NAME, verbose=True)
logger = logging.getLogger(__name__)

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

class ModuleResponse(BaseModel):
    name: str
    description: str
    lessons: List[ModuleLessonResponse]

class Response(BaseModel):
    modules: List[ModuleResponse]


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
    """
    Install or activate the learning plan for the student by creating modules, lessons,
    vocabularies, online articles, and YouTube videos in the database.

    Args:
        profile (StudentProfile): The student's profile.
        db (Session): Database session for operations.

    Returns:
        bool: True if the installation is successful, False otherwise.
    """

    logger.info(f"Starting installation of learning plan for profile {profile.id}")

    try:
        prompts = """
You are a language teacher. Based on the following information, provide structured learning resources.

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

        user_prompts = PromptTemplate.from_template(prompts).format(**{
            'age_range': profile.age_range,
            'proficiency': profile.proficiency,
            'native_language': profile.native_language,
            'learning_goal': profile.learning_goal,
            'target_duration': profile.target_duration,
            'duration_unit': profile.duration_unit,
            'constraints': profile.constraints,
            'learning_plan': profile.ai_learning_plan,
        })

        structured_llm = llm.with_structured_output(Response)
        response: Response = structured_llm.invoke([HumanMessage(content=user_prompts)])

        for i, module in enumerate(response.modules, start=1):
            new_module = Modules(
                profile_id=profile.id,
                name=module.name,
                description=module.description,
                display_order=i,
                is_locked= not (i==1)
            )

            db.add(new_module)
            db.flush()  # Flush to get module.id

            for j, lesson in enumerate(module.lessons, start=1):
                new_lesson = ModuleLessons(
                    module_id=new_module.id,
                    title=lesson.title,
                    content=lesson.content,
                    display_order=j,
                    is_locked= not (i==1 and j==1)
                )

                db.add(new_lesson)
                db.flush()  # Flush to get lesson.id

                for vocabulary in lesson.vocabularies:
                    new_vocabulary = LessonVocabularies(
                        lesson_id=new_lesson.id,
                        vocabulary=vocabulary.vocabulary,
                        meaning=vocabulary.meaning,
                        description=vocabulary.description
                    )

                    db.add(new_vocabulary)

                # Limit to 3 articles per lesson
                online_articles = web_search.invoke(new_lesson.title)[:3]
                for online_article in online_articles:
                    new_article = LessonOnlineArticles(
                        lesson_id=new_lesson.id,
                        title=online_article.get('title', '')[:200],
                        favicon_url=online_article.get('favicon_url', [None]),
                        description=online_article.get('snippet', ''),
                        page_url=online_article.get('link', '')
                    )

                    db.add(new_article)

                # Limit to 3 videos per lesson
                youtube_videos = youtube_search(new_lesson.title)[:3]
                for youtube_video in youtube_videos:
                    thumbnail_url = youtube_video.get('thumbnails', [None])[0] if youtube_video.get('thumbnails') else None
                    new_video = LessonYouTubeVideos(
                        lesson_id=new_lesson.id,
                        title=youtube_video.get('title', '')[:200],
                        thumbnail_url=thumbnail_url,
                        description=youtube_video.get('long_desc', ''),
                        video_url=youtube_video.get('full_url', '')
                    )

                    db.add(new_video)

        db.commit()
        logger.info(f"Successfully installed learning plan for profile {profile.id}")
        return True

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to install learning plan for profile {profile.id}: {e}")
        return False
