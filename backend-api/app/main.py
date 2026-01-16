from fastapi import FastAPI, Request
from ariadne import make_executable_schema
from ariadne.asgi import GraphQL
from .schema import type_defs
from .resolver.user import query, user
from .config.database import get_db, create_table

app = FastAPI(title="Fidel AI Backend API", description="GraphQL API for Fidel AI platform")

create_table()

bindables = [query, user]

schema = make_executable_schema(type_defs, *bindables)

def get_context_value(request: Request):
    return {"db": next(get_db())}

graphql_app = GraphQL(schema, debug=True, context_value=get_context_value)

app.mount("/graphql", graphql_app)

@app.get("/")
def read_root():
    return {"message": "Welcome to Fidel AI Backend API", "graphql_endpoint": "/graphql"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
