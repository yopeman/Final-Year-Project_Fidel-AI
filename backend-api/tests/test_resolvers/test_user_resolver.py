"""
Unit tests for User resolver.
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import MagicMock
from app.resolver.user import (
    resolve_users,
    resolve_user,
    resolve_me,
    resolve_login,
    resolve_logout,
    resolve_register,
    map_role,
    generate_verification_code,
)
from app.model.user import User, UserRole
from app.util.auth import verify_password


class TestUserResolverQueries:
    """Test cases for User resolver queries."""

    def test_resolve_users_as_admin(self, db_session, test_admin, create_test_user):
        """Test that admin can query all users."""
        # Create some users
        user1 = create_test_user(email="user1@test.com")
        user2 = create_test_user(email="user2@test.com")
        
        # Mock info object
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        result = resolve_users(None, info, pagination=None)
        
        assert len(result) >= 3  # At least admin + 2 users
        assert all(isinstance(u, User) for u in result)

    def test_resolve_users_as_non_admin(self, db_session, test_user):
        """Test that non-admin cannot query all users."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_users(None, info, pagination=None)
        
        assert "Unauthorized" in str(exc_info.value)

    def test_resolve_users_unauthenticated(self, db_session):
        """Test that unauthenticated users cannot query all users."""
        info = MagicMock()
        info.context = {
            "current_user": None,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_users(None, info, pagination=None)
        
        assert "Unauthorized" in str(exc_info.value)

    def test_resolve_user_by_id_as_admin(self, db_session, test_admin, test_user):
        """Test that admin can query a specific user by ID."""
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        result = resolve_user(None, info, test_user.id)
        
        assert result.id == test_user.id
        assert result.email == test_user.email

    def test_resolve_user_not_found(self, db_session, test_admin):
        """Test querying a non-existent user."""
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_user(None, info, "non-existent-id")
        
        assert "User not found" in str(exc_info.value)

    def test_resolve_me_authenticated(self, db_session, test_user):
        """Test that authenticated user can query their own info."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        result = resolve_me(None, info)
        
        assert result.id == test_user.id
        assert result.email == test_user.email

    def test_resolve_me_unauthenticated(self, db_session):
        """Test that unauthenticated user cannot query 'me'."""
        info = MagicMock()
        info.context = {
            "current_user": None,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_me(None, info)
        
        assert "Not authenticated" in str(exc_info.value)


class TestUserResolverMutations:
    """Test cases for User resolver mutations."""

    def test_resolve_register_new_user(self, db_session):
        """Test registering a new user."""
        info = MagicMock()
        info.context = {"db": db_session}
        
        input_data = {
            "firstName": "New",
            "lastName": "User",
            "email": "newuser_register@test.com",
            "password": "SecurePass123!",
            "role": "STUDENT",
        }
        
        result = resolve_register(None, info, input_data)
        
        assert result is True
        
        # Verify user was created
        user = db_session.query(User).filter(User.email == "newuser_register@test.com").first()
        assert user is not None
        assert user.first_name == "New"
        assert user.last_name == "User"
        assert user.role == UserRole.student

    def test_resolve_register_duplicate_email(self, db_session, test_user):
        """Test registering with an existing email."""
        info = MagicMock()
        info.context = {"db": db_session}
        
        input_data = {
            "firstName": "Duplicate",
            "lastName": "User",
            "email": test_user.email,  # Already exists
            "password": "SecurePass123!",
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_register(None, info, input_data)
        
        assert "Email already registered" in str(exc_info.value)

    def test_resolve_login_valid_credentials(self, db_session, test_user):
        """Test login with valid credentials."""
        info = MagicMock()
        info.context = {"db": db_session}
        
        input_data = {
            "email": test_user.email,
            "password": "TestPass123!",  # This is the plaintext password used in fixture
        }
        
        result = resolve_login(None, info, input_data)
        
        assert "user" in result
        assert "accessToken" in result
        assert "refreshToken" in result
        assert result["user"].id == test_user.id

    def test_resolve_login_invalid_credentials(self, db_session, test_user):
        """Test login with invalid credentials."""
        info = MagicMock()
        info.context = {"db": db_session}
        
        input_data = {
            "email": test_user.email,
            "password": "WrongPassword",
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_login(None, info, input_data)
        
        assert "Invalid credentials" in str(exc_info.value)

    def test_resolve_login_unverified_user(self, db_session, create_test_user):
        """Test login with unverified user."""
        unverified = create_test_user(
            email="unverified_login@test.com",
            is_verified=False,
        )
        
        info = MagicMock()
        info.context = {"db": db_session}
        
        input_data = {
            "email": unverified.email,
            "password": "TestPass123!",
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_login(None, info, input_data)
        
        assert "email is not verified" in str(exc_info.value)

    def test_resolve_logout_authenticated(self, db_session, test_user):
        """Test logout when authenticated."""
        # Set tokens first
        test_user.access_token = "some_token"
        test_user.refresh_token = "some_refresh_token"
        db_session.commit()
        
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        result = resolve_logout(None, info)
        
        assert result is True
        assert test_user.access_token is None
        assert test_user.refresh_token is None

    def test_resolve_logout_unauthenticated(self, db_session):
        """Test logout when not authenticated."""
        info = MagicMock()
        info.context = {
            "current_user": None,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_logout(None, info)
        
        assert "Not authenticated" in str(exc_info.value)


class TestUserResolverHelpers:
    """Test cases for User resolver helper functions."""

    def test_map_role_admin(self):
        """Test mapping ADMIN role string."""
        assert map_role("ADMIN") == UserRole.admin
        assert map_role("admin") == UserRole.admin

    def test_map_role_student(self):
        """Test mapping STUDENT role string."""
        assert map_role("STUDENT") == UserRole.student
        assert map_role("student") == UserRole.student

    def test_map_role_tutor(self):
        """Test mapping TUTOR role string."""
        assert map_role("TUTOR") == UserRole.tutor
        assert map_role("tutor") == UserRole.tutor

    def test_map_role_undetermined(self):
        """Test mapping UNDETERMINED role string."""
        assert map_role("UNDETERMINED") == UserRole.undetermined
        assert map_role("undetermined") == UserRole.undetermined

    def test_map_role_invalid(self):
        """Test mapping invalid role string defaults to undetermined."""
        assert map_role("INVALID") == UserRole.undetermined
        assert map_role("UNKNOWN") == UserRole.undetermined
        assert map_role("") == UserRole.undetermined

    def test_generate_verification_code_format(self):
        """Test verification code generation format."""
        code = generate_verification_code()
        
        assert len(code) == 6
        assert code.isdigit()

    def test_generate_verification_code_unique(self):
        """Test that verification codes are reasonably unique."""
        codes = [generate_verification_code() for _ in range(10)]
        
        # All codes should be different (highly probable)
        assert len(set(codes)) == 10
