"""
AI Service Prompts - Centralized prompt templates for all AI interactions.
"""

# =============================================================================
# normalize_text_for_tts.py prompts
# =============================================================================

TTS_SYSTEM_PROMPT = """Convert text to natural spoken format for TTS.

Rules:
- Strip all markdown (#, *, _, `, >)
- Links: output only text, ignore URL
- Bullets: convert to sentences, don't say "bullet"
- Math: 2^3="two cubed", 1/4="one fourth", H2O="H two O"
- Symbols: &="and", @="at", $="dollars", %="percent", ~="approximately"
- Dates: 2024-10-15="October 15th, 2024"
- Time: 14:00="two PM", 3h 30m="three hours and thirty minutes"
- Abbreviations: e.g.="for example", i.e.="that is", etc.="and so on", Dr.="Doctor", 5kg="five kilograms"
- Emojis: remove or describe briefly

Output ONLY the normalized text. No explanations, no "Here is", no markdown. Preserve exact meaning.
"""

TTS_USER_PROMPT = "Text to normalize:\n\n{text}"


# =============================================================================
# lesson_interaction.py prompts
# =============================================================================

LESSON_QA_PROMPT = """Answer student's question about lesson "{lesson_title}".

Student: {proficiency} level, native {native_language}, age {age_range}, goal: {learning_goal}
Lesson: {module_name} - {lesson_content}

Rules:
- Answer directly first (1-2 sentences)
- Link to lesson "{lesson_title}"
- Level: Beginner=1-3 simple sentences, Intermediate=3-5 sentences with examples, Advanced=5+ sentences with nuances
- If relevant, mention {native_language} comparison (1 sentence)
- No praise phrases ("Good job!", etc.)
- End with ONE check-for-understanding question
- Max 150 words
- Use markdown

History:
{prev_lesson_interactions}

Question: "{question}"
"""


# =============================================================================
# learning_plan.py prompts
# =============================================================================

LEARNING_PLAN_GENERATION_PROMPT = """Create learning plan from {proficiency} to goal: {learning_goal}.

Student: {proficiency}, native {native_language}, age {age_range}, time: {target_duration} {duration_unit}, constraints: {constraints}

Rules:
- 4-6 modules, 5-8 lessons each
- Lessons: 15-45 min each, total fits {target_duration} {duration_unit}
- Modules build progressively
- Target {native_language} common mistakes
- Action-oriented titles, practical skills

Output (Markdown):
## Overview
2-3 sentences

## Module Title
Description (2-3 sentences)
### Lesson Title
- Description: 1 sentence
- Focus: grammar/vocab point
- Time: minutes

No preamble, no generic lessons ("Introduction"), no placeholders.
"""

LEARNING_PLAN_UPDATE_PROMPT = """Update learning plan based on feedback.

Student: {proficiency}, native {native_language}, goal: {learning_goal}

Current plan:
{current_plan}

Changes: {improvements}

Rules:
- Apply changes, keep working parts
- Maintain flow between old/new
- Total time must fit {target_duration} {duration_unit}
- Keep lessons {proficiency}-appropriate

Output:
## Changelog
2-3 bullet points

## Updated Plan
Complete plan in original structure (Overview, ## Modules, ### Lessons with Title/Description/Focus/Time)

No "Here is the updated plan", output full plan not just changes.
"""


# =============================================================================
# install_learning_plan.py prompts
# =============================================================================

INSTALL_LEARNING_PLAN_PROMPT = """Extract structure from learning plan.

Student: {age_range}, native {native_language}, {proficiency}, goal: {learning_goal}

Plan:
{learning_plan}

Extract 3-5 modules with 3-7 lessons each.

Output structure:
- Module: name, description (2-3 sentences), lessons[]
- Lesson: name (action-oriented), description (1-2 sentences)

Verify: lessons fit {proficiency}, relevant to {learning_goal}, address {native_language} challenges, logical progression.

No adding/removing content, no preamble.
"""

LESSON_CONTENT_GENERATION_PROMPT = """Write lesson "{lesson_title}" from module "{module_title}".

Student: {proficiency}, native {native_language}, age {age_range}, goal: {learning_goal}

Structure (Markdown):
## Objectives
2 action-oriented bullets

## The "Why"
2-3 sentences on real-world relevance

## Core Concept
- Explanation with analogies
- 3-5 examples
- 1 thinking question

## The "{native_language}" Trap
1 common mistake, how to avoid (2-3 sentences)

## Power Moves
2 realistic scenarios (3-5 lines each)

## Practice Lab
1. Fill-in-the-blank (3-5 blanks)
2. Error correction (3-5 sentences)
3. Write 2 sentences

## Summary & Next
- Summary: 1 sentence
- Next: 1 sentence teaser

Max 800 words. Use icons, bold key terms. No preamble.
"""

VOCABULARY_GENERATION_PROMPT = """Select 8-12 essential words for lesson "{lesson_title}".

Student: {proficiency}, native {native_language}

Criteria:
- High-frequency, practical use
- Essential to lesson topic
- {native_language} confusion points
- {proficiency}-appropriate
- Mix parts of speech

For each word:
- vocabulary: exact word/phrase
- meaning: 1 simple sentence definition
- description: part of speech, example sentence, 5-word memory tip

No preamble, 8-12 words only.
"""


# =============================================================================
# conversation_interaction.py prompts
# =============================================================================

TOPIC_SUMMARY_PROMPT = """Summarize this conversation into a catchy phrase (3-7 words). 

# 💡 ORIGINAL IDEA
{idea}

# 📏 RULES
- No periods at the end.
- Action-oriented.
- Engaging for a language learner.
- Output ONLY the phrase.
"""

TOPIC_GENERATION_PROMPT = """Generate a unique, high-engagement conversation starter for an English learner.

# 🧑‍🎓 STUDENT
- **Level**: {proficiency}
- **Goal**: {learning_goal}
- **Age**: {age_range}
- **Native Language**: {native_language}

# 📏 THE CHALLENGE
Produce ONE scenario or question that:
1. **Fits the User**: Relevant to an {age_range} learner.
2. **Prompts Speech**: Not a "Yes/No" question.
3. **Uses the Plan**: Indirectly references concepts from their learning plan.

# 📦 OUTPUT FORMAT
Provide only the topic text. No introductions.
"""

CONVERSATION_RESPONSE_PROMPT = """Respond naturally to student.

Student: {proficiency}, age {age_range}, native {native_language}, goal: {learning_goal}
Theme: {topic_summary_phrase}
Prompt: {starting_topic}

Rules:
- Natural speech, contractions, idioms
- Max 40 words, 1-3 sentences
- End with question/opener
- If mistake: model correct form naturally, don't point it out
- Use 1-2 words from theme
- Stay on topic

History:
{prev_lesson_interactions}

Student: "{question}"

Output ONLY the response. No "That's a great question", no explicit corrections.
"""

POSSIBLE_TALK_PROMPT = """Generate 3 possible things the student could say or ask about in this conversation.

Student: {proficiency}, age {age_range}, native {native_language}, goal: {learning_goal}
Theme: {topic_summary_phrase}
Topic: {starting_topic}

Rules:
- Provide EXACTLY 3 suggestions
- Each suggestion should be 1-2 sentences the student could say
- Frame from student's perspective (use "I", "my", "me")
- Make them natural responses or follow-up questions
- Match the student's {proficiency} level
- Stay relevant to the topic theme

History:
{prev_lesson_interactions}

Output format - EXACTLY 3 lines, one suggestion per line:
1. First suggestion text
2. Second suggestion text
3. Third suggestion text

No numbering, no prefixes, no explanations. Just 3 plain sentences/phrases."""
