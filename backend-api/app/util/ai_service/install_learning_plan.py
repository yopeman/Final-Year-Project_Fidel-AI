import json
from typing import List
from concurrent.futures import ThreadPoolExecutor

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
    Search YouTube for educational videos and return results.
    """
    videos = YoutubeSearch(
        search_terms=search_terms, max_results=max_results, retries=retries
    ).to_dict(clear_cache=True)

    for video in videos:
        video["full_url"] = "https://www.youtube.com" + video["url_suffix"]
    return videos


def install_learning_plan(profile: StudentProfile, db: Session) -> bool:
    """
    Parse the AI learning plan into a module/lesson skeleton and persist it.
    Content, vocabularies, articles, and videos are generated lazily on first
    lesson access (see resolve_lesson in module_lessons resolver).
    """
    prompts = PromptTemplate.from_template(INSTALL_LEARNING_PLAN_PROMPT).format(
        **{
            "age_range": profile.age_range,
            "proficiency": profile.proficiency,
            "learning_goal": profile.learning_goal,
            "learning_plan": profile.ai_learning_plan,
        }
    )

    try:
        json_prompt = (
            prompts
            + "\n\nIMPORTANT: Output ONLY valid JSON. No markdown, no explanation, no preamble. "
            "Use this exact format:\n"
            '{"modules": [{"name": "module_name", "description": "module_description", '
            '"lessons": [{"name": "lesson_name", "description": "lesson_description"}]}]}'
        )

        response = llm.invoke([HumanMessage(content=json_prompt)])

        print(f"LLM raw response: {repr(response.content)}")

        if not response.content or not response.content.strip():
            print("Error: LLM returned empty response")
            return False

        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        print(f"Cleaned content for parsing: {repr(content[:200])}...")

        response_data = json.loads(content)

        modules = []
        for module_data in response_data.get("modules", []):
            lessons = [
                LessonOutput(
                    name=lesson_data.get("name", ""),
                    description=lesson_data.get("description", ""),
                )
                for lesson_data in module_data.get("lessons", [])
            ]
            modules.append(
                ModuleOutput(
                    name=module_data.get("name", ""),
                    description=module_data.get("description", ""),
                    lessons=lessons,
                )
            )

        module_response = ModuleResponse(modules=modules)
        print(f"Successfully parsed {len(modules)} modules")

    except Exception as e:
        print(f"Error generating modules: {e}")
        import traceback
        traceback.print_exc()
        return False

    # Persist skeleton — no content/vocab/articles/videos yet
    for i, module in enumerate(module_response.modules, start=1):
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
            new_lesson = ModuleLessons(
                module_id=new_module.id,
                title=lesson.name,
                description=lesson.description,
                content=None,  # generated lazily on first access
                display_order=j,
                is_locked=not (i == 1 and j == 1),
            )
            db.add(new_lesson)

    db.commit()
    return True


# ---------------------------------------------------------------------------
# Lazy content generation — called from resolve_lesson on first access
# ---------------------------------------------------------------------------

def generate_lesson_content(
    profile: StudentProfile,
    module_name: str,
    lesson: ModuleLessons,
    db: Session,
) -> ModuleLessons:
    """
    Generate and persist content, vocabularies, articles, and YouTube videos
    for a lesson that has not yet been populated.  Runs the three resource
    tasks (vocab, web search, YouTube) in parallel after content is ready.
    """
    # 1. Generate lesson content (LLM)
    content = _generate_content_for_lesson(profile, module_name, lesson.title)

    # 2. Generate vocab + fetch articles + fetch videos in parallel
    with ThreadPoolExecutor(max_workers=3) as executor:
        vocab_future = executor.submit(
            _generate_vocabularies_for_lesson, profile, lesson.title
        )
        articles_future = executor.submit(web_search.invoke, lesson.title)
        videos_future = executor.submit(youtube_search, lesson.title)

        vocabularies: VocabularyResponse = vocab_future.result()
        articles = articles_future.result()[:5]
        videos = videos_future.result()[:5]

    # 3. Persist everything
    lesson.content = content
    db.flush()

    for vocabulary in vocabularies.vocabularies:
        db.add(
            LessonVocabularies(
                lesson_id=lesson.id,
                vocabulary=vocabulary.vocabulary,
                meaning=vocabulary.meaning,
                description=vocabulary.description,
            )
        )

    for article in articles:
        db.add(
            LessonOnlineArticles(
                lesson_id=lesson.id,
                title=article.get("title", "")[:200],
                favicon_url=article.get("favicon_url", [None]),
                description=article.get("snippet", ""),
                page_url=article.get("link", ""),
            )
        )

    for video in videos:
        db.add(
            LessonYouTubeVideos(
                lesson_id=lesson.id,
                title=video.get("title", "")[:200],
                thumbnail_url=(
                    video.get("thumbnails", [None])[0]
                    if video.get("thumbnails")
                    else None
                ),
                description=video.get("long_desc", ""),
                video_url=video.get("full_url", ""),
            )
        )

    db.commit()
    db.refresh(lesson)
    return lesson


def _generate_content_for_lesson(
    profile: StudentProfile, module_title: str, lesson_title: str
) -> str:
    prompts = PromptTemplate.from_template(LESSON_CONTENT_GENERATION_PROMPT).format(
        **{
            "age_range": profile.age_range,
            "proficiency": profile.proficiency,
            "learning_goal": profile.learning_goal,
            "module_title": module_title,
            "lesson_title": lesson_title,
        }
    )
    return llm.invoke([HumanMessage(content=prompts)]).content


def _generate_vocabularies_for_lesson(
    profile: StudentProfile, lesson_title: str
) -> VocabularyResponse:
    prompts = PromptTemplate.from_template(VOCABULARY_GENERATION_PROMPT).format(
        **{
            "proficiency": profile.proficiency,
            "lesson_title": lesson_title,
        }
    )

    json_prompt = (
        prompts
        + "\n\nIMPORTANT: Output ONLY valid JSON. No markdown, no explanation, no preamble. "
        "Use this exact format:\n"
        '{"vocabularies": [{"vocabulary": "word", "meaning": "definition", "description": "description"}]}'
    )

    try:
        response = llm.invoke([HumanMessage(content=json_prompt)])

        print(f"Vocabulary LLM raw response: {repr(response.content)}")

        if not response.content or not response.content.strip():
            print(f"Error: LLM returned empty vocabulary response for lesson {lesson_title}")
            return VocabularyResponse(vocabularies=[])

        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        response_data = json.loads(content)
        vocabularies = [
            VocabularyOutput(
                vocabulary=v.get("vocabulary", ""),
                meaning=v.get("meaning", ""),
                description=v.get("description", ""),
            )
            for v in response_data.get("vocabularies", [])
        ]

        print(f"Successfully parsed {len(vocabularies)} vocabularies for lesson {lesson_title}")
        return VocabularyResponse(vocabularies=vocabularies)

    except Exception as e:
        print(f"Error generating vocabularies for lesson {lesson_title}: {e}")
        import traceback
        traceback.print_exc()
        return VocabularyResponse(vocabularies=[])
