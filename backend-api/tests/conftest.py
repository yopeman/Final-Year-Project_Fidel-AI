"""
Pytest fixtures and test configuration for Fidel AI Backend API tests.
"""

import os
import sys
import uuid
from datetime import datetime, timedelta
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure app is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text

from app.config.database import Base, get_db
from app.main import app
from app.model.user import User, UserRole
from app.model.student_profile import StudentProfile, AgeRange, Proficiency, DurationUnit
from app.model.course import Course
from app.model.batch import Batch
from app.model.batch_course import BatchCourse
from app.model.batch_enrollment import BatchEnrollment
from app.model.batch_instructor import BatchInstructor
from app.model.verification_code import VerificationCode
from app.util.auth import create_access_token, get_password_hash


# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def engine():
    """Create a new engine for the test session."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Register UUID type handler for SQLite
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, connection_record):
        """Enable foreign keys and set up UUID handling for SQLite."""
        dbapi_conn.execute("PRAGMA foreign_keys=ON")
    
    # Add listener to convert UUID to string for SQLite
    @event.listens_for(engine, "before_cursor_execute")
    def _convert_uuid_to_str(conn, cursor, statement, parameters, context, executemany):
        """Convert UUID objects to strings for SQLite compatibility."""
        if parameters:
            if isinstance(parameters, dict):
                parameters = {
                    k: str(v) if isinstance(v, uuid.UUID) else v
                    for k, v in parameters.items()
                }
            elif isinstance(parameters, (list, tuple)):
                parameters = [
                    str(p) if isinstance(p, uuid.UUID) else p
                    for p in parameters
                ]
        return statement, parameters
    
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(engine) -> Generator[Session, None, None]:
    """Create a new database session for each test function."""
    connection = engine.connect()
    transaction = connection.begin()
    
    # Bind session to connection
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=connection)
    session = SessionLocal()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session) -> Generator[TestClient, None, None]:
    """Create a test client with the test database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


# =============================================================================
# User Fixtures
# =============================================================================

@pytest.fixture
def test_user_data():
    """Return test user data."""
    return {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password": "TestPass123!",
        "role": UserRole.student,
        "is_verified": True,
    }


@pytest.fixture
def test_admin_data():
    """Return test admin user data."""
    return {
        "first_name": "Admin",
        "last_name": "User",
        "email": "admin@example.com",
        "password": "AdminPass123!",
        "role": UserRole.admin,
        "is_verified": True,
    }


@pytest.fixture
def test_tutor_data():
    """Return test tutor user data."""
    return {
        "first_name": "Tutor",
        "last_name": "User",
        "email": "tutor@example.com",
        "password": "TutorPass123!",
        "role": UserRole.tutor,
        "is_verified": True,
    }


@pytest.fixture
def create_test_user(db_session):
    """Factory fixture to create test users."""
    def _create_user(**kwargs):
        user_data = {
            "first_name": "Test",
            "last_name": "User",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "password": get_password_hash("TestPass123!"),
            "role": UserRole.student,
            "is_verified": True,
        }
        user_data.update(kwargs)
        
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user
    
    return _create_user


@pytest.fixture
def test_user(db_session, create_test_user):
    """Create a verified test student user."""
    return create_test_user(
        email="test@example.com",
        role=UserRole.student,
        is_verified=True,
    )


@pytest.fixture
def test_admin(db_session, create_test_user):
    """Create a verified test admin user."""
    return create_test_user(
        email="admin@example.com",
        role=UserRole.admin,
        is_verified=True,
    )


@pytest.fixture
def test_tutor(db_session, create_test_user):
    """Create a verified test tutor user."""
    return create_test_user(
        email="tutor@example.com",
        role=UserRole.tutor,
        is_verified=True,
    )


@pytest.fixture
def test_unverified_user(db_session, create_test_user):
    """Create an unverified test user."""
    return create_test_user(
        email="unverified@example.com",
        is_verified=False,
    )


@pytest.fixture
def user_auth_token(test_user, db_session):
    """Generate an auth token for the test user."""
    token = create_access_token(
        data={"sub": test_user.email},
        expires_delta=timedelta(days=1)
    )
    test_user.access_token = token
    db_session.commit()
    return token


@pytest.fixture
def admin_auth_token(test_admin, db_session):
    """Generate an auth token for the test admin."""
    token = create_access_token(
        data={"sub": test_admin.email},
        expires_delta=timedelta(days=1)
    )
    test_admin.access_token = token
    db_session.commit()
    return token


@pytest.fixture
def tutor_auth_token(test_tutor, db_session):
    """Generate an auth token for the test tutor."""
    token = create_access_token(
        data={"sub": test_tutor.email},
        expires_delta=timedelta(days=1)
    )
    test_tutor.access_token = token
    db_session.commit()
    return token


@pytest.fixture
def auth_headers(user_auth_token):
    """Return headers with user authentication."""
    return {"Authorization": f"Bearer {user_auth_token}"}


@pytest.fixture
def admin_auth_headers(admin_auth_token):
    """Return headers with admin authentication."""
    return {"Authorization": f"Bearer {admin_auth_token}"}


@pytest.fixture
def tutor_auth_headers(tutor_auth_token):
    """Return headers with tutor authentication."""
    return {"Authorization": f"Bearer {tutor_auth_token}"}


# =============================================================================
# Profile Fixtures
# =============================================================================

@pytest.fixture
def test_profile_data():
    """Return test student profile data."""
    return {
        "age_range": AgeRange._18_25,
        "proficiency": Proficiency.intermediate,
        "native_language": "Spanish",
        "learning_goal": "Improve English for career advancement",
        "target_duration": 6,
        "duration_unit": DurationUnit.months,
        "constraints": "Can only study on weekends",
    }


@pytest.fixture
def create_test_profile(db_session):
    """Factory fixture to create test student profiles."""
    def _create_profile(user_id, **kwargs):
        profile_data = {
            "user_id": user_id,
            "age_range": AgeRange._18_25,
            "proficiency": Proficiency.intermediate,
            "native_language": "Spanish",
            "learning_goal": "Improve English for career advancement",
            "target_duration": 6,
            "duration_unit": DurationUnit.months,
        }
        profile_data.update(kwargs)
        
        profile = StudentProfile(**profile_data)
        db_session.add(profile)
        db_session.commit()
        db_session.refresh(profile)
        return profile
    
    return _create_profile


@pytest.fixture
def test_profile(db_session, test_user, create_test_profile):
    """Create a test student profile for the test user."""
    return create_test_profile(user_id=test_user.id)


# =============================================================================
# Course Fixtures
# =============================================================================

@pytest.fixture
def create_test_course(db_session):
    """Factory fixture to create test courses."""
    def _create_course(**kwargs):
        course_data = {
            "name": f"Test Course {uuid.uuid4().hex[:8]}",
            "description": "A test course for testing purposes",
        }
        course_data.update(kwargs)
        
        course = Course(**course_data)
        db_session.add(course)
        db_session.commit()
        db_session.refresh(course)
        return course
    
    return _create_course


@pytest.fixture
def test_course(db_session, create_test_course):
    """Create a test course."""
    return create_test_course(name="English Basics", description="Basic English course")


# =============================================================================
# Batch Fixtures
# =============================================================================

@pytest.fixture
def create_test_batch(db_session):
    """Factory fixture to create test batches."""
    def _create_batch(**kwargs):
        batch_data = {
            "name": f"Test Batch {uuid.uuid4().hex[:8]}",
            "description": "A test batch",
            "max_students": 20,
        }
        batch_data.update(kwargs)
        
        batch = Batch(**batch_data)
        db_session.add(batch)
        db_session.commit()
        db_session.refresh(batch)
        return batch
    
    return _create_test_batch


# =============================================================================
# Verification Code Fixtures
# =============================================================================

@pytest.fixture
def create_test_verification_code(db_session):
    """Factory fixture to create test verification codes."""
    def _create_code(**kwargs):
        code_data = {
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "code": "".join(str(i) for i in range(6)),  # 012345
            "expires_at": datetime.utcnow() + timedelta(minutes=10),
            "is_used": 0,
        }
        code_data.update(kwargs)
        
        verification_code = VerificationCode(**code_data)
        db_session.add(verification_code)
        db_session.commit()
        db_session.refresh(verification_code)
        return verification_code
    
    return _create_code


# =============================================================================
# GraphQL Helpers
# =============================================================================

@pytest.fixture
def graphql_query(client):
    """Helper to execute GraphQL queries."""
    def _query(query_string, variables=None, headers=None):
        payload = {"query": query_string}
        if variables:
            payload["variables"] = variables
        
        return client.post(
            "/graphql",
            json=payload,
            headers=headers or {}
        )
    
    return _query


@pytest.fixture
def authenticated_graphql_query(client, auth_headers):
    """Helper to execute authenticated GraphQL queries as regular user."""
    def _query(query_string, variables=None):
        payload = {"query": query_string}
        if variables:
            payload["variables"] = variables
        
        return client.post(
            "/graphql",
            json=payload,
            headers=auth_headers
        )
    
    return _query


@pytest.fixture
def admin_graphql_query(client, admin_auth_headers):
    """Helper to execute authenticated GraphQL queries as admin."""
    def _query(query_string, variables=None):
        payload = {"query": query_string}
        if variables:
            payload["variables"] = variables
        
        return client.post(
            "/graphql",
            json=payload,
            headers=admin_auth_headers
        )
    
    return _query


# =============================================================================
# Common GraphQL Queries/Mutations
# =============================================================================

@pytest.fixture
def login_mutation():
    """Return the login mutation string."""
    return """
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            user {
                id
                email
                firstName
                lastName
                role
                isVerified
            }
            accessToken
            refreshToken
        }
    }
    """


@pytest.fixture
def register_mutation():
    """Return the register mutation string."""
    return """
    mutation Register($input: RegisterInput!) {
        register(input: $input)
    }
    """


@pytest.fixture
def me_query():
    """Return the me query string."""
    return """
    query Me {
        me {
            id
            email
            firstName
            lastName
            role
            isVerified
        }
    }
    """
