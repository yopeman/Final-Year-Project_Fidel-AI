from ariadne import make_executable_schema, ScalarType
from ariadne.asgi import GraphQL
from fastapi import FastAPI, Request

from .config.database import create_table, get_db
from . import model  # Import all models to register them with SQLAlchemy
from .resolver.user import mutation, query, user
from .resolver.verification_code import verification_code as vc_type
from .resolver.student_profile import mutation as sp_mutation, query as sp_query, student_profile as sp_type
from .schema import type_defs
from .util.auth import get_current_user

app = FastAPI(
    title="Fidel AI Backend API", description="GraphQL API for Fidel AI platform"
)

create_table()

# DateTime scalar
datetime_scalar = ScalarType("DateTime")

@datetime_scalar.serializer
def serialize_datetime(value):
    if value is None:
        return None
    return value.isoformat()

bindables = [query, mutation, user, vc_type, sp_query, sp_mutation, sp_type, datetime_scalar]

schema = make_executable_schema(type_defs, *bindables)


def get_context_value(request: Request):
    db = next(get_db())
    context = {"db": db}
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        current_user = get_current_user(token, db)
        if current_user:
            context["current_user"] = current_user
    return context


graphql_app = GraphQL(schema, debug=True, context_value=get_context_value)

app.mount("/graphql", graphql_app)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Fidel AI Backend API",
        "graphql_endpoint": "/graphql",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
