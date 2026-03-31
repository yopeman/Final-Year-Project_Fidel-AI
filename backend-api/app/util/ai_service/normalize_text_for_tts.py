from langchain_core.prompts import ChatPromptTemplate

from .prompts import TTS_SYSTEM_PROMPT, TTS_USER_PROMPT
from . import llm


def normalize_text_for_tts(text: str) -> str:
    """
    Normalize raw text (markdown, math, abbreviations, symbols)
    into clean, natural, spoken text for TTS systems.
    """

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", TTS_SYSTEM_PROMPT),
            ("user", TTS_USER_PROMPT),
        ]
    )

    chain = prompt | llm

    response = chain.invoke({"text": text})
    return response.content.strip()
