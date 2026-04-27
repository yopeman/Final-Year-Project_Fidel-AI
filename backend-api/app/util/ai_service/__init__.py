from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq
from ...config.settings import settings

# llm = ChatOllama(model="smollm2:135m")
# llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=settings.groq_api_key)
llm = ChatGroq(model="llama-3.1-8b-instant", api_key=settings.groq_api_key)
