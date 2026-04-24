import json
from typing import List
from concurrent.futures import ThreadPoolExecutor, as_completed

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


def _process_lesson_resources(profile: StudentProfile, module: ModuleOutput, lesson: LessonOutput, content: str):
    """Process vocabulary generation, web search, and YouTube search in parallel for a lesson."""
    with ThreadPoolExecutor(max_workers=3) as executor:
        vocab_future = executor.submit(
            _generate_vocabularies, profile, module, lesson, content
        )
        articles_future = executor.submit(web_search.invoke, lesson.name)
        videos_future = executor.submit(youtube_search, lesson.name)
        
        vocabularies = vocab_future.result()
        articles = articles_future.result()[:5]
        videos = videos_future.result()[:5]
    
    return vocabularies, articles, videos


def install_learning_plan(profile: StudentProfile, db: Session) -> bool:
    prompts = PromptTemplate.from_template(INSTALL_LEARNING_PLAN_PROMPT).format(
        **{
            "age_range": profile.age_range,
            "proficiency": profile.proficiency,
            "native_language": profile.native_language,
            "learning_goal": profile.learning_goal,
            "learning_plan": profile.ai_learning_plan,
        }
    )

    try:
        # Use JSON mode instead of structured output to avoid function call confusion
        json_prompt = prompts + "\n\nIMPORTANT: Output ONLY valid JSON. No markdown, no explanation, no preamble. Use this exact format:\n{\"modules\": [{\"name\": \"module_name\", \"description\": \"module_description\", \"lessons\": [{\"name\": \"lesson_name\", \"description\": \"lesson_description\"}]}]}"
        
        response = llm.invoke([HumanMessage(content=json_prompt)])
        
        # Debug logging
        print(f"LLM raw response: {repr(response.content)}")
        
        # Handle empty response
        if not response.content or not response.content.strip():
            print("Error: LLM returned empty response")
            return False
        
        # Clean up response - remove markdown code blocks if present
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        print(f"Cleaned content for parsing: {repr(content[:200])}...")
        
        # Parse the JSON response
        response_data = json.loads(content)
        
        # Create ModuleResponse object
        modules = []
        for module_data in response_data.get("modules", []):
            lessons = []
            for lesson_data in module_data.get("lessons", []):
                lessons.append(LessonOutput(
                    name=lesson_data.get("name", ""),
                    description=lesson_data.get("description", "")
                ))
            
            modules.append(ModuleOutput(
                name=module_data.get("name", ""),
                description=module_data.get("description", ""),
                lessons=lessons
            ))
        
        response = ModuleResponse(modules=modules)
        print(f"Successfully parsed {len(modules)} modules")
    except Exception as e:
        print(f"Error generating modules: {e}")
        import traceback
        traceback.print_exc()
        return False

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

        # Generate content for all lessons in parallel
        lesson_data = []
        with ThreadPoolExecutor() as executor:
            future_to_lesson = {
                executor.submit(_generate_content, profile, module, lesson): (j, lesson)
                for j, lesson in enumerate(module.lessons, start=1)
            }
            
            for future in as_completed(future_to_lesson):
                j, lesson = future_to_lesson[future]
                try:
                    content = future.result()
                    lesson_data.append((j, lesson, content))
                except Exception as e:
                    print(f"Error generating content for lesson {lesson.name}: {e}")
        
        # Sort lessons by display order to maintain sequence
        lesson_data.sort(key=lambda x: x[0])
        
        for j, lesson, content in lesson_data:
            new_lesson = ModuleLessons(
                module_id=new_module.id,
                title=lesson.name,
                content=content,
                display_order=j,
                is_locked=not (i == 1 and j == 1),
            )
            db.add(new_lesson)
            db.flush()

            # Process vocabularies, articles, and videos in parallel
            vocabularies, articles, videos = _process_lesson_resources(
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

            for article in articles:
                new_article = LessonOnlineArticles(
                    lesson_id=new_lesson.id,
                    title=article.get("title", "")[:200],
                    favicon_url=article.get("favicon_url", [None]),
                    description=article.get("snippet", ""),
                    page_url=article.get("link", ""),
                )
                db.add(new_article)

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
            "age_range": profile.age_range,
            "proficiency": profile.proficiency,
            "native_language": profile.native_language,
            "learning_goal": profile.learning_goal,
            "module_title": module.name,
            "lesson_title": lesson.name,
        }
    )

    response: str = (
        llm.invoke([HumanMessage(content=prompts)]).content
    )

    return response


def _generate_vocabularies(
    profile: StudentProfile, module: ModuleOutput, lesson: LessonOutput, content: str
) -> VocabularyResponse:
    prompts = PromptTemplate.from_template(VOCABULARY_GENERATION_PROMPT).format(
        **{
            "proficiency": profile.proficiency,
            "native_language": profile.native_language,
            "lesson_title": lesson.name,
        }
    )

    try:
        # Use JSON mode instead of structured output to avoid function call confusion
        json_prompt = prompts + "\n\nIMPORTANT: Output ONLY valid JSON. No markdown, no explanation, no preamble. Use this exact format:\n{\"vocabularies\": [{\"vocabulary\": \"word\", \"meaning\": \"definition\", \"description\": \"description\"}]}"
        
        response = llm.invoke([HumanMessage(content=json_prompt)])
        
        # Debug logging
        print(f"Vocabulary LLM raw response: {repr(response.content)}")
        
        # Handle empty response
        if not response.content or not response.content.strip():
            print(f"Error: LLM returned empty vocabulary response for lesson {lesson.name}")
            return VocabularyResponse(vocabularies=[])
        
        # Clean up response - remove markdown code blocks if present
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        # Parse the JSON response
        response_data = json.loads(content)
        
        # Create VocabularyResponse object
        vocabularies = []
        for vocab_data in response_data.get("vocabularies", []):
            vocabularies.append(VocabularyOutput(
                vocabulary=vocab_data.get("vocabulary", ""),
                meaning=vocab_data.get("meaning", ""),
                description=vocab_data.get("description", "")
            ))
        
        print(f"Successfully parsed {len(vocabularies)} vocabularies for lesson {lesson.name}")
        return VocabularyResponse(vocabularies=vocabularies)
    except Exception as e:
        print(f"Error generating vocabularies for lesson {lesson.name}: {e}")
        import traceback
        traceback.print_exc()
        # Return empty response as fallback
        return VocabularyResponse(vocabularies=[])
