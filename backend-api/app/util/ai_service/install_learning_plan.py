from typing import List

from langchain_community.tools import DuckDuckGoSearchResults
from langchain_core.messages import HumanMessage
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel
from sqlalchemy.orm import Session
from youtube_search import YoutubeSearch

from ...model.lesson_online_articles import LessonOnlineArticles
from ...model.lesson_vocabularies import LessonVocabularies
from ...model.lesson_youtube_videos import LessonYouTubeVideos
from ...model.module_lessons import ModuleLessons
from ...model.modules import Modules
from ...model.student_profile import StudentProfile
from . import llm
from .prompts import (
    INSTALL_LEARNING_PLAN_PROMPT,
    LESSON_CONTENT_GENERATION_PROMPT,
    VOCABULARY_GENERATION_PROMPT,
)


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


web_search = DuckDuckGoSearchResults(output_format="list")


def youtube_search(search_terms: str, max_results=5, retries=3):
    """
    Search YouTube video for educational videos and return results.
    """
    videos = YoutubeSearch(
        search_terms=search_terms, max_results=max_results, retries=retries
    ).to_dict(clear_cache=True)

    for video in videos:
        video["full_url"] = "https://www.youtube.com" + video["url_suffix"]
    return videos


def install_learning_plan(profile: StudentProfile, db: Session) -> bool:
    prompts = PromptTemplate.from_template(INSTALL_LEARNING_PLAN_PROMPT).format(
        **{
            "age_range": profile.age_range,
            "proficiency": profile.proficiency,
            "native_language": profile.native_language,
            "learning_goal": profile.learning_goal,
            "target_duration": profile.target_duration,
            "duration_unit": profile.duration_unit,
            "constraints": profile.constraints,
            "learning_plan": profile.ai_learning_plan,
        }
    )

    response: ModuleResponse = (
        llm.with_structured_output(ModuleResponse)
        .invoke([HumanMessage(content=prompts)])
    )

    for i, module in enumerate(response.modules, start=1):
        new_module = Modules(
            profile_id=profile.id,
            name=module.name,
            description=module.description,
            display_order=i,
            is_locked=not (i == 1),
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
                is_locked=not (i == 1 and j == 1),
            )
            db.add(new_lesson)
            db.flush()

            vocabularies: VocabularyResponse = _generate_vocabularies(
                profile, module, lesson, content
            )
            for vocabulary in vocabularies.vocabularies:
                new_vocabulary = LessonVocabularies(
                    lesson_id=new_lesson.id,
                    vocabulary=vocabulary.vocabulary,
                    meaning=vocabulary.meaning,
                    description=vocabulary.description,
                )
                db.add(new_vocabulary)
                db.flush()

            articles = web_search.invoke(lesson.name)[:5]
            for article in articles:
                new_article = LessonOnlineArticles(
                    lesson_id=new_lesson.id,
                    title=article.get("title", "")[:200],
                    favicon_url=article.get("favicon_url", [None]),
                    description=article.get("snippet", ""),
                    page_url=article.get("link", ""),
                )
                db.add(new_article)
                db.flush()

            videos = youtube_search(lesson.name)[:5]
            for video in videos:
                new_video = LessonYouTubeVideos(
                    lesson_id=new_lesson.id,
                    title=video.get("title", "")[:200],
                    thumbnail_url=(
                        video.get("thumbnails", [None])[0]
                        if video.get("thumbnails")
                        else None
                    ),
                    description=video.get("long_desc", ""),
                    video_url=video.get("full_url", ""),
                )
                db.add(new_video)
                db.flush()

    db.commit()
    return True


def _generate_content(
    profile: StudentProfile, module: ModuleOutput, lesson: LessonOutput
) -> str:
    prompts = PromptTemplate.from_template(LESSON_CONTENT_GENERATION_PROMPT).format(
        **{
            "target_language": "the target language",  # You might want to add this to profile
            "age_range": profile.age_range,
            "proficiency": profile.proficiency,
            "native_language": profile.native_language,
            "learning_goal": profile.learning_goal,
            "constraints": profile.constraints,
            "target_duration": profile.target_duration,
            "learning_plan": profile.ai_learning_plan,
            "module_title": module.name,
            "module_description": module.description,
            "lesson_title": lesson.name,
            "lesson_description": lesson.description,
        }
    )

    response: str = (
        llm.invoke([HumanMessage(content=prompts)]).content
    )

    return response


def _generate_vocabularies(
    profile: StudentProfile, module: ModuleOutput, lesson: LessonOutput, content: str
) -> str:
    prompts = PromptTemplate.from_template(VOCABULARY_GENERATION_PROMPT).format(
        **{
            "age_range": profile.age_range,
            "proficiency": profile.proficiency,
            "native_language": profile.native_language,
            "learning_goal": profile.learning_goal,
            "constraints": profile.constraints,
            "module_title": module.name,
            "module_description": module.description,
            "lesson_title": lesson.name,
            "lesson_description": lesson.description,
            "lesson_content": content,
        }
    )

    response: VocabularyResponse = (
        llm.with_structured_output(VocabularyResponse)
        .invoke([HumanMessage(content=prompts)])
    )

    return response
