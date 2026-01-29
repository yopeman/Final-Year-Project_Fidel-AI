import os

from ariadne import ScalarType, make_executable_schema
from ariadne.asgi import GraphQL
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import model  # Import all models to register them with SQLAlchemy
from .config.database import create_table, get_db
from .resolver.conversation_interactions import \
    conversation_interactions as ci_type
from .resolver.conversation_interactions import mutation as ci_mutation
from .resolver.conversation_interactions import query as ci_query
from .resolver.free_conversation import free_conversation as fc_type
from .resolver.free_conversation import mutation as fc_mutation
from .resolver.free_conversation import query as fc_query
from .resolver.lesson_online_articles import lesson_online_articles as loa_type
from .resolver.lesson_online_articles import mutation as loa_mutation
from .resolver.lesson_online_articles import query as loa_query
from .resolver.lesson_vocabularies import lesson_vocabularies as lv_type
from .resolver.lesson_vocabularies import mutation as lv_mutation
from .resolver.lesson_vocabularies import query as lv_query
from .resolver.lesson_youtube_videos import lesson_youtube_videos as lyv_type
from .resolver.lesson_youtube_videos import mutation as lyv_mutation
from .resolver.lesson_youtube_videos import query as lyv_query
from .resolver.module_lessons import module_lessons as ml_type
from .resolver.module_lessons import mutation as ml_mutation
from .resolver.module_lessons import query as ml_query
from .resolver.modules import modules as m_type
from .resolver.modules import mutation as m_mutation
from .resolver.modules import query as m_query
from .resolver.student_profile import mutation as sp_mutation
from .resolver.student_profile import query as sp_query
from .resolver.student_profile import student_profile as sp_type
from .resolver.translator import mutation as t_mutation
from .resolver.translator import query as t_query
from .resolver.user import mutation, query, user
from .resolver.verification_code import verification_code as vc_type
from .schema import type_defs
from .util.auth import create_default_admin, get_current_user

app = FastAPI(
    title="Fidel AI Backend API", description="GraphQL API for Fidel AI platform"
)

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_table()
create_default_admin()

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
    datetime_scalar,
]

schema = make_executable_schema(type_defs, *bindables)
os.makedirs("static", exist_ok=True)


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
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Fidel AI Backend API",
        "graphql_endpoint": "/graphql",
        "static_file": "/static",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
