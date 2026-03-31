import os

from ariadne import ScalarType, make_executable_schema, upload_scalar
from ariadne.asgi import GraphQL
from ariadne.asgi.handlers import GraphQLTransportWSHandler, GraphQLWSHandler
from broadcaster import Broadcast
from fastapi import FastAPI, Request, Depends, WebSocket, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from typing import List
from .model.material_files import MaterialFiles

from . import model  # Import all models to register them with SQLAlchemy
from .config.database import create_table, get_db, SessionLocal
from .resolver.attendance import attendance, mutation as a_mutation, query as a_query
from .resolver.batch import batch, mutation as b_mutation, query as b_query
from .resolver.batch_course import batch_course, mutation as bc_mutation, query as bc_query
from .resolver.batch_enrollment import batch_enrollment, mutation as be_mutation, query as be_query
from .resolver.batch_instructor import batch_instructor, mutation as bi_mutation, query as bi_query
from .resolver.batch_community import batch_community, mutation as bcom_mutation, query as bcom_query, subscription as bcom_subscription
from .resolver.community_attachment_files import community_attachment_files, mutation as caf_mutation, query as caf_query
from .resolver.community_reactions import community_reactions, mutation as cr_mutation, query as cr_query
from .resolver.community_comment import community_comment, mutation as cc_mutation, query as cc_query
from .resolver.comment_reactions import comment_reactions, mutation as ccr_mutation, query as ccr_query
from .resolver.feedback import feedback, mutation as f_mutation, query as f_query
from .resolver.notification import notification, mutation as n_mutation, query as n_query
from .resolver.schedule import schedule, mutation as s_mutation, query as s_query
from .resolver.course_schedule import course_schedule, mutation as cs_mutation, query as cs_query
from .resolver.payment import payment, mutation as p_mutation, query as p_query, payment_webhook as p_webhook
from .resolver.conversation_interactions import conversation_interactions as ci_type
from .resolver.conversation_interactions import mutation as ci_mutation
from .resolver.conversation_interactions import query as ci_query
from .resolver.course import course, mutation as c_mutation, query as c_query
from .resolver.course_material import course_material, mutation as cm_mutation, query as cm_query
from .resolver.material_files import material_files, mutation as mf_mutation, query as mf_query, upload_material_files as upload_mf
from .resolver.community_attachment_files import upload_attachments as upload_ca
from .resolver.free_conversation import free_conversation as fc_type
from .resolver.free_conversation import mutation as fc_mutation
from .resolver.free_conversation import query as fc_query
from .resolver.lesson_online_articles import lesson_online_articles as loa_type
from .resolver.lesson_online_articles import mutation as loa_mutation
from .resolver.lesson_online_articles import query as loa_query
from .resolver.lesson_vocabularies import lesson_vocabularies as lv_type
from .resolver.lesson_vocabularies import mutation as lv_mutation
from .resolver.lesson_vocabularies import query as lv_query
from .resolver.lesson_interactions import lesson_interactions as li_type
from .resolver.lesson_interactions import mutation as li_mutation
from .resolver.lesson_interactions import query as li_query
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
from .resolver.skill import mutation as sk_mutation, query as sk_query, skill
from .resolver.reading_skill import reading_skill
from .resolver.writing_skill import writing_skill
from .resolver.speaking_skill import speaking_skill
from .resolver.listening_skill import listening_skill
from .resolver.certificate import mutation as cert_mutation, query as cert_query, certificate
from .resolver.analytics import query as analytics_query
from .schema import type_defs
from .util.auth import create_default_admin, get_current_user


# Initialize the broadcaster
broadcast = Broadcast("memory://")
app = FastAPI(
    title="Fidel AI Backend API", 
    description="GraphQL API for Fidel AI platform",
    on_startup=[broadcast.connect],
    on_shutdown=[broadcast.disconnect],
    debug=True
)

# Database session middleware to ensure proper session cleanup
class DBSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        db = SessionLocal()
        request.state.db = db
        try:
            response = await call_next(request)
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()
        return response

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add DB session middleware (processed after CORS)
app.add_middleware(DBSessionMiddleware)

create_table()
create_default_admin()

# Date & DateTime scalar
datetime_scalar = ScalarType("DateTime")
@datetime_scalar.serializer
def serialize_datetime(value):
    if value is None:
        return None
    return value.isoformat()

date_scalar = ScalarType("Date")
@date_scalar.serializer
def serialize_date(value):
    if value is None:
        return None
    return value.isoformat()

time_scalar = ScalarType("Time")
@time_scalar.serializer
def serialize_time(value):
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


bindables = [
    query,
    mutation,
    user,
    analytics_query,
    a_query,
    a_mutation,
    attendance,
    b_query,
    b_mutation,
    batch,
    bc_query,
    bc_mutation,
    batch_course,
    be_query,
    be_mutation,
    batch_enrollment,
    bi_query,
    bi_mutation,
    batch_instructor,
    bcom_query,
    bcom_mutation,
    bcom_subscription,
    batch_community,
    caf_query,
    caf_mutation,
    community_attachment_files,
    cr_query,
    cr_mutation,
    community_reactions,
    cc_query,
    cc_mutation,
    community_comment,
    ccr_query,
    ccr_mutation,
    comment_reactions,
    f_query,
    f_mutation,
    feedback,
    n_query,
    n_mutation,
    notification,
    s_query,
    s_mutation,
    schedule,
    cs_query,
    cs_mutation,
    course_schedule,
    p_query,
    p_mutation,
    payment,
    c_query,
    c_mutation,
    course,
    cm_query,
    cm_mutation,
    course_material,
    mf_query,
    mf_mutation,
    material_files,
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
    li_query,
    li_mutation,
    li_type,
    sk_query,
    sk_mutation,
    skill,
    reading_skill,
    writing_skill,
    speaking_skill,
    listening_skill,
    cert_query,
    cert_mutation,
    certificate,
    datetime_scalar,
    date_scalar,
    time_scalar,
    upload_scalar
]

schema = make_executable_schema(type_defs, *bindables)
os.makedirs("static", exist_ok=True)


def get_context_value(request: Request):
    # Use the session from middleware (properly managed lifecycle)
    print(request.__dict__['_body'])
    db = request.state.db
    context = {"db": db, "pubsub": broadcast}
    context["base_url"] = request.base_url
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        current_user = get_current_user(token, db)
        if current_user:
            context["current_user"] = current_user
    return context


graphql_app = GraphQL(
    schema, 
    debug=True, 
    context_value=get_context_value, 
    websocket_handler=GraphQLTransportWSHandler()
)

@app.websocket("/graphql")
async def websocket_endpoint(websocket: WebSocket):
    await graphql_app.handle_websocket(websocket)


app.mount("/graphql", graphql_app)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Fidel AI Backend API",
        "graphql_endpoint": "/graphql",
        "health": "/health",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get('/webhook')
def payment_webhook(status: str = None, trx_ref: str = None, db = Depends(get_db)):
    print('Payment Webhook:', status, trx_ref)
    p_webhook(status=status, trx_ref=trx_ref, db=db)

@app.post("/api/upload/material/{materialId}/files", response_model=None)
async def upload_course_material(materialId: str, files: List[UploadFile], request: Request):
    context = {"db": request.state.db, "pubsub": broadcast}
    return await upload_mf(context, materialId, files)

@app.post("/api/upload/community/{communityId}/files", response_model=None)
async def upload_community_attachments(communityId: str, files: List[UploadFile], request: Request):
    context = {"db": request.state.db, "pubsub": broadcast}
    return await upload_ca(context, communityId, files)

@app.get('/certificates/{certificateId}', response_class=HTMLResponse)
def get_certificate(certificateId: str, request: Request):
    from fastapi import HTTPException
    from .model.certificate import Certificate
    from sqlalchemy.orm import Session
    
    db: Session = request.state.db
    
    # Get certificate
    certificate_obj = db.query(Certificate).filter(
        Certificate.id == certificateId,
        Certificate.is_deleted == False
    ).first()
    
    if not certificate_obj:
        import os
        template_path = os.path.join(os.path.dirname(__file__), "util", "certificate_not_found_template.html")
        with open(template_path, "r") as f:
            template_content = f.read()
            return template_content
    
    return certificate_obj.certificate_html
