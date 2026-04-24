"""
Unit tests for StudentProfile resolver.
"""

import pytest
from unittest.mock import MagicMock, patch
from app.resolver.student_profile import (
    resolve_my_profile,
    resolve_student_profile,
    resolve_create_profile,
    resolve_update_profile,
    resolve_delete_profile,
    map_age_range,
    map_proficiency,
    map_duration_unit,
    map_age_range_to_graphql,
    map_proficiency_to_graphql,
    map_duration_unit_to_graphql,
)
from app.model.student_profile import StudentProfile, AgeRange, Proficiency, DurationUnit
from app.model.user import UserRole


class TestStudentProfileResolverQueries:
    """Test cases for StudentProfile resolver queries."""

    def test_resolve_my_profile_authenticated(self, db_session, test_user, test_profile):
        """Test that authenticated user can query their own profile."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        result = resolve_my_profile(None, info)
        
        assert result is not None
        assert result.id == test_profile.id
        assert result.user_id == test_user.id

    def test_resolve_my_profile_no_profile(self, db_session, create_test_user):
        """Test querying myProfile when profile doesn't exist."""
        user = create_test_user(email="no_profile@test.com")
        
        info = MagicMock()
        info.context = {
            "current_user": user,
            "db": db_session,
        }
        
        result = resolve_my_profile(None, info)
        
        assert result is None

    def test_resolve_my_profile_unauthenticated(self, db_session):
        """Test that unauthenticated user cannot query profile."""
        info = MagicMock()
        info.context = {
            "current_user": None,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_my_profile(None, info)
        
        assert "Not authenticated" in str(exc_info.value)

    def test_resolve_student_profile_as_admin(self, db_session, test_admin, test_user, test_profile):
        """Test that admin can query any user's profile."""
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        result = resolve_student_profile(None, info, test_user.id)
        
        assert result.id == test_profile.id

    def test_resolve_student_profile_own_profile(self, db_session, test_user, test_profile):
        """Test that user can query their own profile."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        result = resolve_student_profile(None, info, test_user.id)
        
        assert result.id == test_profile.id

    def test_resolve_student_profile_other_user(self, db_session, test_user, create_test_user, create_test_profile):
        """Test that user cannot query another user's profile."""
        other_user = create_test_user(email="other@test.com")
        other_profile = create_test_profile(user_id=other_user.id)
        
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_student_profile(None, info, other_user.id)
        
        assert "Unauthorized" in str(exc_info.value)

    def test_resolve_student_profile_not_found(self, db_session, test_admin, create_test_user):
        """Test querying a non-existent profile."""
        user_without_profile = create_test_user(email="no_profile2@test.com")
        
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_student_profile(None, info, user_without_profile.id)
        
        assert "Student profile not found" in str(exc_info.value)


class TestStudentProfileResolverMutations:
    """Test cases for StudentProfile resolver mutations."""

    def test_resolve_create_profile_success(self, db_session, test_user):
        """Test creating a new profile."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        input_data = {
            "ageRange": "_18_25",
            "proficiency": "INTERMEDIATE",
            "nativeLanguage": "Spanish",
            "learningGoal": "Improve business English",
            "targetDuration": 6,
            "durationUnit": "MONTHS",
            "constraints": "Weekends only",
        }
        
        result = resolve_create_profile(None, info, input_data)
        
        assert result is not None
        assert result.user_id == test_user.id
        assert result.age_range == AgeRange._18_25
        assert result.proficiency == Proficiency.intermediate
        assert result.native_language == "Spanish"

    def test_resolve_create_profile_already_exists(self, db_session, test_user, test_profile):
        """Test creating profile when one already exists."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        input_data = {
            "ageRange": "_26_35",
            "proficiency": "ADVANCED",
            "nativeLanguage": "French",
            "learningGoal": "Test",
            "targetDuration": 3,
            "durationUnit": "MONTHS",
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_create_profile(None, info, input_data)
        
        assert "Profile already exists" in str(exc_info.value)

    def test_resolve_create_profile_unauthenticated(self, db_session):
        """Test creating profile when not authenticated."""
        info = MagicMock()
        info.context = {
            "current_user": None,
            "db": db_session,
        }
        
        input_data = {
            "ageRange": "_18_25",
            "proficiency": "BEGINNER",
            "nativeLanguage": "German",
            "learningGoal": "Test",
            "targetDuration": 1,
            "durationUnit": "MONTHS",
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_create_profile(None, info, input_data)
        
        assert "Not authenticated" in str(exc_info.value)

    def test_resolve_update_profile_success(self, db_session, test_user, test_profile):
        """Test updating an existing profile."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        input_data = {
            "ageRange": "_26_35",
            "proficiency": "ADVANCED",
            "nativeLanguage": "Italian",
        }
        
        result = resolve_update_profile(None, info, input_data)
        
        assert result.age_range == AgeRange._26_35
        assert result.proficiency == Proficiency.advanced
        assert result.native_language == "Italian"

    def test_resolve_update_profile_not_found(self, db_session, create_test_user):
        """Test updating profile when none exists."""
        user = create_test_user(email="no_profile_update@test.com")
        
        info = MagicMock()
        info.context = {
            "current_user": user,
            "db": db_session,
        }
        
        input_data = {
            "nativeLanguage": "Chinese",
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_update_profile(None, info, input_data)
        
        assert "Profile not found" in str(exc_info.value)

    def test_resolve_delete_profile_success(self, db_session, test_user, test_profile):
        """Test deleting (soft delete) a profile."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        result = resolve_delete_profile(None, info)
        
        assert result is True
        assert test_profile.is_deleted is True
        assert test_profile.deleted_at is not None

    def test_resolve_delete_profile_not_found(self, db_session, create_test_user):
        """Test deleting profile when none exists."""
        user = create_test_user(email="no_profile_delete@test.com")
        
        info = MagicMock()
        info.context = {
            "current_user": user,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_delete_profile(None, info)
        
        assert "Profile not found" in str(exc_info.value)


class TestStudentProfileResolverHelpers:
    """Test cases for StudentProfile resolver helper functions."""

    def test_map_age_range(self):
        """Test age range string to enum mapping."""
        assert map_age_range("UNDER_18") == AgeRange.under_18
        assert map_age_range("_18_25") == AgeRange._18_25
        assert map_age_range("_26_35") == AgeRange._26_35
        assert map_age_range("_36_45") == AgeRange._36_45
        assert map_age_range("_45_PLUS") == AgeRange._45_plus

    def test_map_age_range_default(self):
        """Test age range default mapping."""
        assert map_age_range("UNKNOWN") == AgeRange.under_18
        assert map_age_range("") == AgeRange.under_18

    def test_map_proficiency(self):
        """Test proficiency string to enum mapping."""
        assert map_proficiency("BEGINNER") == Proficiency.beginner
        assert map_proficiency("BASIC") == Proficiency.basic
        assert map_proficiency("INTERMEDIATE") == Proficiency.intermediate
        assert map_proficiency("ADVANCED") == Proficiency.advanced

    def test_map_proficiency_default(self):
        """Test proficiency default mapping."""
        assert map_proficiency("UNKNOWN") == Proficiency.beginner
        assert map_proficiency("") == Proficiency.beginner

    def test_map_duration_unit(self):
        """Test duration unit string to enum mapping."""
        assert map_duration_unit("DAYS") == DurationUnit.days
        assert map_duration_unit("WEEKS") == DurationUnit.weeks
        assert map_duration_unit("MONTHS") == DurationUnit.months
        assert map_duration_unit("YEARS") == DurationUnit.years

    def test_map_duration_unit_default(self):
        """Test duration unit default mapping."""
        assert map_duration_unit("UNKNOWN") == DurationUnit.months
        assert map_duration_unit("") == DurationUnit.months

    def test_map_age_range_to_graphql(self):
        """Test age range enum to GraphQL string mapping."""
        assert map_age_range_to_graphql(AgeRange.under_18) == "UNDER_18"
        assert map_age_range_to_graphql(AgeRange._18_25) == "_18_25"
        assert map_age_range_to_graphql(AgeRange._26_35) == "_26_35"
        assert map_age_range_to_graphql(AgeRange._36_45) == "_36_45"
        assert map_age_range_to_graphql(AgeRange._45_plus) == "_45_PLUS"

    def test_map_proficiency_to_graphql(self):
        """Test proficiency enum to GraphQL string mapping."""
        assert map_proficiency_to_graphql(Proficiency.beginner) == "BEGINNER"
        assert map_proficiency_to_graphql(Proficiency.basic) == "BASIC"
        assert map_proficiency_to_graphql(Proficiency.intermediate) == "INTERMEDIATE"
        assert map_proficiency_to_graphql(Proficiency.advanced) == "ADVANCED"

    def test_map_duration_unit_to_graphql(self):
        """Test duration unit enum to GraphQL string mapping."""
        assert map_duration_unit_to_graphql(DurationUnit.days) == "DAYS"
        assert map_duration_unit_to_graphql(DurationUnit.weeks) == "WEEKS"
        assert map_duration_unit_to_graphql(DurationUnit.months) == "MONTHS"
        assert map_duration_unit_to_graphql(DurationUnit.years) == "YEARS"
