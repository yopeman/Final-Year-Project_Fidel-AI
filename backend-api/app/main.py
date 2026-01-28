from ariadne import make_executable_schema, ScalarType
from ariadne.asgi import GraphQL
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import os

from .config.database import create_table, get_db
from . import model  # Import all models to register them with SQLAlchemy
from .resolver.user import mutation, query, user
from .resolver.verification_code import verification_code as vc_type
from .resolver.student_profile import mutation as sp_mutation, query as sp_query, student_profile as sp_type
from .resolver.modules import mutation as m_mutation, query as m_query, modules as m_type
from .resolver.module_lessons import mutation as ml_mutation, query as ml_query, module_lessons as ml_type
from .resolver.lesson_vocabularies import mutation as lv_mutation, query as lv_query, lesson_vocabularies as lv_type
from .resolver.lesson_online_articles import mutation as loa_mutation, query as loa_query, lesson_online_articles as loa_type
from .resolver.lesson_youtube_videos import mutation as lyv_mutation, query as lyv_query, lesson_youtube_videos as lyv_type
from .resolver.translator import mutation as t_mutation, query as t_query
from .resolver.free_conversation import mutation as fc_mutation, query as fc_query, free_conversation as fc_type
from .resolver.conversation_interactions import mutation as ci_mutation, query as ci_query, conversation_interactions as ci_type
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

bindables = [
    query,
    mutation,
    user,
    vc_type,
    sp_query,
    sp_mutation,
    sp_type,
    m_query,
    m_mutation,
    m_type,
    ml_query,
    ml_mutation,
    ml_type,
    lv_query,
    lv_mutation,
    lv_type,
    loa_query,
    loa_mutation,
    loa_type,
    lyv_query,
    lyv_mutation,
    lyv_type,
    t_query,
    t_mutation,
    fc_query,
    fc_mutation,
    fc_type,
    ci_query,
    ci_mutation,
    ci_type,
    datetime_scalar
]

schema = make_executable_schema(type_defs, *bindables)
os.makedirs('static', exist_ok=True)


def get_context_value(request: Request):
    db = next(get_db())
    context = {"db": db}
    context["base_url"] = request.base_url
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        current_user = get_current_user(token, db)
        if current_user:
            context["current_user"] = current_user
    return context


graphql_app = GraphQL(schema, debug=True, context_value=get_context_value)
app.mount("/graphql", graphql_app)
app.mount('/static', StaticFiles(directory='static'), name='static')


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Fidel AI Backend API",
        "graphql_endpoint": "/graphql",
        "static_file": "/static"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
