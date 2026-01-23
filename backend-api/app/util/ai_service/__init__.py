from langchain_ollama import ChatOllama

MODEL_NAME = 'llama3.1:8b'
llm = ChatOllama(model=MODEL_NAME, verbose=True)