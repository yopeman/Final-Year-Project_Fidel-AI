"""
Unit tests for VerificationCode model.
"""

import pytest
from datetime import datetime, timedelta
from app.model.verification_code import VerificationCode


class TestVerificationCodeModel:
    """Test cases for VerificationCode model."""

    def test_verification_code_creation(self, db_session, create_test_verification_code):
        """Test creating a new verification code."""
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        code = create_test_verification_code(
            email="verify@example.com",
            code="123456",
            expires_at=expires_at,
            is_used=0,
        )
        
        assert code.id is not None
        assert code.email == "verify@example.com"
        assert code.code == "123456"
        assert code.expires_at == expires_at
        assert code.is_used == 0
        assert code.created_at is not None
        assert code.updated_at is not None

    def test_verification_code_tablename(self):
        """Test that VerificationCode model has correct table name."""
        assert VerificationCode.__tablename__ == "verification_codes"

    def test_verification_code_relationships_exist(self, db_session, create_test_verification_code, test_user):
        """Test that verification code relationships are defined."""
        code = create_test_verification_code(
            email=test_user.email,
            user_id=test_user.id,
        )
        
        assert hasattr(code, 'user')

    def test_verification_code_used_status(self, db_session, create_test_verification_code):
        """Test marking verification code as used."""
        code = create_test_verification_code(
            email="used@example.com",
            is_used=0,
        )
        
        assert code.is_used == 0
        
        code.is_used = 1
        db_session.commit()
        
        assert code.is_used == 1

    def test_verification_code_expiration(self, db_session, create_test_verification_code):
        """Test verification code expiration."""
        past_time = datetime.utcnow() - timedelta(minutes=5)
        
        expired_code = create_test_verification_code(
            email="expired@example.com",
            code="654321",
            expires_at=past_time,
        )
        
        assert expired_code.expires_at < datetime.utcnow()

    def test_verification_code_future_expiration(self, db_session, create_test_verification_code):
        """Test verification code with future expiration."""
        future_time = datetime.utcnow() + timedelta(hours=1)
        
        code = create_test_verification_code(
            email="future@example.com",
            code="999999",
            expires_at=future_time,
        )
        
        assert code.expires_at > datetime.utcnow()

    def test_multiple_codes_for_same_email(self, db_session, create_test_verification_code):
        """Test creating multiple codes for same email."""
        email = "multi@example.com"
        
        code1 = create_test_verification_code(email=email, code="111111")
        code2 = create_test_verification_code(email=email, code="222222")
        code3 = create_test_verification_code(email=email, code="333333")
        
        assert code1.email == code2.email == code3.email == email
        assert code1.code != code2.code != code3.code

    def test_verification_code_without_user_id(self, db_session, create_test_verification_code):
        """Test creating verification code with automatic user creation."""
        code = create_test_verification_code(
            email="newuser@example.com",
            code="789012",
        )
        
        assert code.user_id is not None  # User is created automatically
        assert code.email == "newuser@example.com"

    def test_verification_code_with_user_id(self, db_session, create_test_verification_code, test_user):
        """Test creating verification code with user_id."""
        code = create_test_verification_code(
            email=test_user.email,
            code="345678",
            user_id=test_user.id,
        )
        
        assert code.user_id == test_user.id

    def test_verification_code_code_format(self, db_session, create_test_verification_code):
        """Test verification code format (6 digits)."""
        code = create_test_verification_code(
            email="format@example.com",
            code="987654",
        )
        
        assert len(code.code) == 6
        assert code.code.isdigit()
