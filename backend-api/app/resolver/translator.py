from ariadne import MutationType, QueryType
from googletrans import Translator, LANGUAGES, LANGCODES
from googletrans.models import Translated, Detected

query = QueryType()
mutation = MutationType()

# Initialize translator
translator = Translator()

@query.field("languages")
def resolve_languages(_, info):
    """Return a list of supported languages with their names"""
    return LANGUAGES

@query.field("langcodes")
def resolve_langcodes(_, info):
    """Return a list of language codes"""
    return LANGCODES

@mutation.field("translate")
async def resolve_translate(_, info, input):
    """Translate text from source language to destination language"""
    text = input["text"]
    dest = input["dest"]
    src = input.get("src", "auto")

    try:
        # Perform translation
        translation: Translated = await translator.translate(text, src=src, dest=dest)

        # Return translation response
        return {
            "src": translation.src,
            "dest": translation.dest,
            "origin": translation.origin,
            "text": translation.text,
            "pronunciation": str(translation.pronunciation)
        }
    except Exception as e:
        raise Exception(f"Translation failed: {str(e)}")

@mutation.field("detect")
async def resolve_detect(_, info, input):
    """Detect the language of the given text"""
    text = input["text"]

    try:
        # Detect language
        detection: Detected = await translator.detect(text)

        # Return detection response
        return {
            "lang": detection.lang,
            "confidence": detection.confidence
        }
    except Exception as e:
        raise Exception(f"Language detection failed: {str(e)}")
