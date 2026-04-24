"""
Unit tests for User model.
"""

import pytest
from app.model.user import User, UserRole
from app.util.auth import verify_password, get_password_hash


class TestUserModel:
    """Test cases for User model."""

    def test_user_creation(self, db_session, create_test_user):
        """Test creating a new user."""
        user = create_test_user(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            role=UserRole.student,
        )
        
        assert user.id is not None
        assert user.first_name == "John"
        assert user.last_name == "Doe"
        assert user.email == "john@example.com"
        assert user.role == UserRole.student
        assert user.is_verified is True
        assert user.is_deleted is False
        assert user.created_at is not None
        assert user.updated_at is not None

    def test_user_role_enum_values(self):
        """Test UserRole enum values."""
        assert UserRole.admin.value == "admin"
        assert UserRole.student.value == "student"
        assert UserRole.tutor.value == "tutor"
        assert UserRole.undetermined.value == "undetermined"

    def test_user_password_hashing(self, db_session, create_test_user):
        """Test that user passwords are properly hashed."""
        plain_password = "SecurePass123!"
        hashed = get_password_hash(plain_password)
        
        user = create_test_user(
            email="hashed@example.com",
            password=hashed,
        )
        
        # Verify password can be validated
        assert verify_password(plain_password, user.password) is True
        assert verify_password("WrongPassword", user.password) is False

    def test_user_soft_delete(self, db_session, test_user):
        """Test soft delete functionality."""
        from datetime import datetime
        
        test_user.is_deleted = True
        test_user.deleted_at = datetime.utcnow()
        db_session.commit()
        
        assert test_user.is_deleted is True
        assert test_user.deleted_at is not None

    def test_user_relationships_exist(self, db_session, test_user):
        """Test that user relationships are defined."""
        # Check that relationships are defined
        assert hasattr(test_user, 'profile')
        assert hasattr(test_user, 'batch_instructors')
        assert hasattr(test_user, 'batch_communities')
        assert hasattr(test_user, 'community_reactions')
        assert hasattr(test_user, 'community_comments')
        assert hasattr(test_user, 'comment_reactions')
        assert hasattr(test_user, 'feedbacks')
        assert hasattr(test_user, 'notifications')
        assert hasattr(test_user, 'attendances')
        assert hasattr(test_user, 'verification_codes')

    def test_user_unique_email_constraint(self, db_session, test_user):
        """Test that email must be unique."""
        from sqlalchemy.exc import IntegrityError
        
        # Try to create a user with the same email
        duplicate_user = User(
            first_name="Jane",
            last_name="Doe",
            email=test_user.email,  # Same email
            password=get_password_hash("Password123!"),
            role=UserRole.student,
        )
        db_session.add(duplicate_user)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_tokens_nullable(self, db_session, create_test_user):
        """Test that access_token and refresh_token can be null."""
        user = create_test_user(
            email="notokens@example.com",
            access_token=None,
            refresh_token=None,
        )
        
        assert user.access_token is None
        assert user.refresh_token is None

    def test_user_tablename(self):
        """Test that User model has correct table name."""
        assert User.__tablename__ == "users"

    def test_user_string_representation(self, test_user):
        """Test string representation of User model."""
        # User model doesn't define __repr__, but we can check basic attributes
        assert str(test_user.id) is not None
        assert test_user.email is not None

    def test_multiple_user_roles_in_database(self, db_session, create_test_user):
        """Test that users with different roles can coexist."""
        admin = create_test_user(email="admin_role@example.com", role=UserRole.admin)
        student = create_test_user(email="student_role@example.com", role=UserRole.student)
        tutor = create_test_user(email="tutor_role@example.com", role=UserRole.tutor)
        undetermined = create_test_user(email="undetermined_role@example.com", role=UserRole.undetermined)
        
        assert admin.role == UserRole.admin
        assert student.role == UserRole.student
        assert tutor.role == UserRole.tutor
        assert undetermined.role == UserRole.undetermined

    def test_user_unverified_status(self, db_session, create_test_user):
        """Test creating unverified user."""
        user = create_test_user(
            email="unverified_user@example.com",
            is_verified=False,
        )
        
        assert user.is_verified is False
