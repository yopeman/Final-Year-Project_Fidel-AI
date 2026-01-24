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
    """).format(**{
        'age_range': profile.age_range,
        'proficiency': profile.proficiency,
        'native_language': profile.native_language,
        'learning_goal': profile.learning_goal,
        'target_duration': profile.target_duration,
        'duration_unit': profile.duration_unit,
        'constraints': profile.constraints,
        'learning_plan': profile.ai_learning_plan,
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
                    title=article.get('title', ''),
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

def _generate_content(profile, module, lesson) -> str:
    prompts = PromptTemplate.from_template("""
You are an expert language teacher, instructional designer, and curriculum architect.

Your role is to teach the lesson below **from first principles to mastery**.

You must:
- Teach **every required idea, concept, and prerequisite**, even if it seems obvious
- Assume **no hidden knowledge** unless explicitly stated
- Build understanding step by step
- Adapt explanations to the student’s age, proficiency, and native language
- Produce **clear, well-structured Markdown output**

━━━━━━━━━━━━━━━━━━━━━━
📘 STUDENT PROFILE
━━━━━━━━━━━━━━━━━━━━━━
- Age range: {age_range}
- Proficiency level: {proficiency}
- Native language: {native_language}
- Learning goal: {learning_goal}
- Constraints (if any): {constraints}

━━━━━━━━━━━━━━━━━━━━━━
📚 CURRICULUM CONTEXT
━━━━━━━━━━━━━━━━━━━━━━
Learning Plan:
{learning_plan}

Module:
- Title: {module_title}
- Description: {module_description}

Lesson:
- Title: {lesson_title}
- Description: {lesson_description}

━━━━━━━━━━━━━━━━━━━━━━
🧠 TEACHING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━

Teach the lesson in **proper Markdown format** using headings, lists, tables, and emphasis where appropriate.

Your lesson MUST include the following sections (use these exact headings):

## 1. Lesson Overview
- Briefly explain what the student will learn
- Explain **why this lesson matters** and how it connects to their learning goal

## 2. Prerequisites & Key Ideas
- Clearly introduce **all background concepts** needed
- Define all important terms in simple language
- Use analogies or intuition when helpful

## 3. Core Concepts (Step-by-Step)
- Teach each concept one at a time
- Use short explanations followed by examples
- Progress from simple → complex
- Never skip reasoning steps

## 4. Examples & Mini Scenarios
- Provide clear, relevant examples
- Include short dialogues or situational usage when appropriate
- Explain *why* each example works

## 5. Common Mistakes & Native Language Interference
- Highlight mistakes learners with **{native_language}** commonly make
- Explain why these mistakes happen
- Show correct vs incorrect usage

## 6. Quick Understanding Checks
- Include short questions or mini-exercises
- Vary formats (multiple choice, fill-in-the-blank, short answer)
- Do NOT include answers immediately (unless constraints require it)

## 7. Summary
- Concisely recap the key ideas
- Reinforce the main learning objective

## 8. Practice & Next Steps
- Suggest 1–3 practice activities
- Activities should be realistic, age-appropriate, and aligned with proficiency

━━━━━━━━━━━━━━━━━━━━━━
⏱️ PACING & CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━
- The lesson must realistically fit within the target duration
- If constraints limit depth, prioritize **clarity over coverage**
- Do NOT include unnecessary jargon unless explicitly required

━━━━━━━━━━━━━━━━━━━━━━
▶️ START THE LESSON
━━━━━━━━━━━━━━━━━━━━━━
""").format(**{})
    
    response: str = (
        ChatOllama(model='gemma3:4b')
        .invoke([HumanMessage(content=prompts)])
        .content
    )

    return response

def _generate_vocabularies(profile: StudentProfile, module: ModuleOutput, lesson: LessonOutput, content: str) -> str:
    prompts = PromptTemplate.from_template("""
    You are a language teacher. Based on the following information, provide vocabularies.

    Student Profile:
    - Age range: {age_range}
    - Proficiency: {proficiency}
    - Native language: {native_language}
    - Learning goal: {learning_goal}
    - Constraints: {constraints}

    Module:
    - title: {module_title}
    - description: {module_description}

    Lesson:
    - title: {lesson_title}
    - description: {lesson_description}
    - Content: {lesson_content}
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