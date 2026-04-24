"""
Unit tests for authentication utilities.
"""

import pytest
from datetime import datetime, timedelta
from jose import jwt, JWTError

from app.util.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_user,
)
from app.config.settings import settings


class TestAuthPasswordUtils:
    """Test cases for password hashing utilities."""

    def test_get_password_hash(self):
        """Test password hashing."""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert hashed is not None
        assert hashed != password
        assert isinstance(hashed, str)

    def test_verify_password_correct(self):
        """Test verifying correct password."""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test verifying incorrect password."""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password("WrongPassword", hashed) is False

    def test_verify_password_different_passwords(self):
        """Test that different passwords produce different hashes."""
        password1 = "Password1"
        password2 = "Password2"
        
        hashed1 = get_password_hash(password1)
        hashed2 = get_password_hash(password2)
        
        assert hashed1 != hashed2
        assert verify_password(password1, hashed1) is True
        assert verify_password(password2, hashed2) is True
        assert verify_password(password1, hashed2) is False
        assert verify_password(password2, hashed1) is False

    def test_password_hash_length(self):
        """Test that hashed password has reasonable length."""
        password = "short"
        hashed = get_password_hash(password)
        
        assert len(hashed) > len(password)
        assert len(hashed) >= 50  # bcrypt hashes are typically 60 chars


class TestAuthTokenUtils:
    """Test cases for JWT token utilities."""

    def test_create_access_token(self):
        """Test creating access token."""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        
        # Verify token can be decoded
        decoded = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        assert decoded["sub"] == "test@example.com"
        assert "exp" in decoded

    def test_create_access_token_with_expiry(self):
        """Test creating access token with custom expiry."""
        data = {"sub": "test@example.com"}
        expires = timedelta(hours=1)
        token = create_access_token(data, expires)
        
        decoded = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        exp_timestamp = decoded["exp"]
        
        # Check that expiry is in the future
        assert exp_timestamp > datetime.utcnow().timestamp()

    def test_create_refresh_token(self):
        """Test creating refresh token."""
        data = {"sub": "test@example.com"}
        token = create_refresh_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        
        # Verify token can be decoded
        decoded = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        assert decoded["sub"] == "test@example.com"
        assert "exp" in decoded

    def test_token_invalid_signature(self):
        """Test that token with invalid signature is rejected."""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        # Modify token slightly
        modified_token = token[:-5] + "XXXXX"
        
        with pytest.raises(JWTError):
            jwt.decode(modified_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])

    def test_token_expired(self):
        """Test that expired token is rejected."""
        data = {"sub": "test@example.com"}
        # Create token that expires immediately
        expires = timedelta(seconds=-1)
        token = create_access_token(data, expires)
        
        with pytest.raises(JWTError):
            jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


class TestAuthGetCurrentUser:
    """Test cases for get_current_user function."""

    def test_get_current_user_valid_token(self, db_session, test_user):
        """Test getting current user with valid token."""
        # Set access token on user
        token = create_access_token({"sub": test_user.email})
        test_user.access_token = token
        db_session.commit()
        
        user = get_current_user(token, db_session)
        
        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email

    def test_get_current_user_invalid_token(self, db_session):
        """Test getting current user with invalid token."""
        user = get_current_user("invalid_token", db_session)
        
        assert user is None

    def test_get_current_user_token_mismatch(self, db_session, test_user):
        """Test when user's stored token doesn't match provided token."""
        # Create a valid token
        token1 = create_access_token({"sub": test_user.email})
        # Store different token
        test_user.access_token = "different_token"
        db_session.commit()
        
        user = get_current_user(token1, db_session)
        
        # Should return None because tokens don't match
        assert user is None

    def test_get_current_user_deleted_user(self, db_session, create_test_user):
        """Test getting deleted user."""
        from datetime import datetime
        
        deleted_user = create_test_user(email="deleted@test.com")
        deleted_user.is_deleted = True
        deleted_user.deleted_at = datetime.utcnow()
        db_session.commit()
        
        token = create_access_token({"sub": deleted_user.email})
        
        user = get_current_user(token, db_session)
        
        # Should return None because user is deleted
        assert user is None

    def test_get_current_user_nonexistent_email(self, db_session):
        """Test getting user with non-existent email in token."""
        token = create_access_token({"sub": "nonexistent@example.com"})
        
        user = get_current_user(token, db_session)
        
        assert user is None

    def test_get_current_user_missing_sub(self, db_session):
        """Test getting user with token missing subject."""
        # Create token without sub
        token = jwt.encode({"exp": datetime.utcnow() + timedelta(hours=1)}, 
                          settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
        
        user = get_current_user(token, db_session)
        
        assert user is None
