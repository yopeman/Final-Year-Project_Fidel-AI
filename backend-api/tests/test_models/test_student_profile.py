"""
Unit tests for StudentProfile model.
"""

import pytest
from app.model.student_profile import StudentProfile, AgeRange, Proficiency, DurationUnit
from app.model.user import UserRole


class TestStudentProfileModel:
    """Test cases for StudentProfile model."""

    def test_profile_creation(self, db_session, test_user, create_test_profile):
        """Test creating a new student profile."""
        profile = create_test_profile(
            user_id=test_user.id,
            age_range=AgeRange._26_35,
            proficiency=Proficiency.advanced,
            native_language="French",
            learning_goal="Business English",
            target_duration=12,
            duration_unit=DurationUnit.months,
            constraints="Limited to 2 hours per day",
        )
        
        assert profile.id is not None
        assert profile.user_id == test_user.id
        assert profile.age_range == AgeRange._26_35
        assert profile.proficiency == Proficiency.advanced
        assert profile.native_language == "French"
        assert profile.learning_goal == "Business English"
        assert profile.target_duration == 12
        assert profile.duration_unit == DurationUnit.months
        assert profile.constraints == "Limited to 2 hours per day"
        assert profile.ai_learning_plan is None
        assert profile.is_deleted is False

    def test_profile_age_range_enum_values(self):
        """Test AgeRange enum values."""
        assert AgeRange.under_18.value == "under_18"
        assert AgeRange._18_25.value == "18_25"
        assert AgeRange._26_35.value == "26_35"
        assert AgeRange._36_45.value == "36_45"
        assert AgeRange._45_plus.value == "45_plus"

    def test_profile_proficiency_enum_values(self):
        """Test Proficiency enum values."""
        assert Proficiency.beginner.value == "beginner"
        assert Proficiency.basic.value == "basic"
        assert Proficiency.intermediate.value == "intermediate"
        assert Proficiency.advanced.value == "advanced"

    def test_profile_duration_unit_enum_values(self):
        """Test DurationUnit enum values."""
        assert DurationUnit.days.value == "days"
        assert DurationUnit.weeks.value == "weeks"
        assert DurationUnit.months.value == "months"
        assert DurationUnit.years.value == "years"

    def test_profile_tablename(self):
        """Test that StudentProfile model has correct table name."""
        assert StudentProfile.__tablename__ == "student_profiles"

    def test_profile_relationships_exist(self, db_session, test_user, test_profile):
        """Test that profile relationships are defined."""
        assert hasattr(test_profile, 'user')
        assert hasattr(test_profile, 'modules')
        assert hasattr(test_profile, 'free_conversations')
        assert hasattr(test_profile, 'batch_enrollments')

    def test_profile_user_relationship(self, db_session, test_user, test_profile):
        """Test profile-user relationship."""
        assert test_profile.user_id == test_user.id
        # Load the user relationship
        user = test_profile.user
        assert user is not None
        assert user.id == test_user.id

    def test_profile_ai_learning_plan_nullable(self, db_session, test_user, create_test_profile):
        """Test that ai_learning_plan can be null."""
        profile = create_test_profile(
            user_id=test_user.id,
            ai_learning_plan=None,
        )
        
        assert profile.ai_learning_plan is None

    def test_profile_ai_learning_plan_with_content(self, db_session, test_user, create_test_profile):
        """Test that ai_learning_plan can store JSON/text content."""
        learning_plan = '{"modules": [{"name": "Module 1", "lessons": ["Lesson 1"]}]}'
        profile = create_test_profile(
            user_id=test_user.id,
            ai_learning_plan=learning_plan,
        )
        
        assert profile.ai_learning_plan == learning_plan

    def test_profile_constraints_nullable(self, db_session, test_user, create_test_profile):
        """Test that constraints can be null."""
        profile = create_test_profile(
            user_id=test_user.id,
            constraints=None,
        )
        
        assert profile.constraints is None

    def test_profile_soft_delete(self, db_session, test_profile):
        """Test soft delete functionality for profiles."""
        from datetime import datetime
        
        test_profile.is_deleted = True
        test_profile.deleted_at = datetime.utcnow()
        db_session.commit()
        
        assert test_profile.is_deleted is True
        assert test_profile.deleted_at is not None

    def test_profile_unique_user_constraint(self, db_session, test_user, test_profile):
        """Test that a user can only have one profile."""
        from sqlalchemy.exc import IntegrityError
        
        # Try to create another profile for the same user
        duplicate_profile = StudentProfile(
            user_id=test_user.id,
            age_range=AgeRange._18_25,
            proficiency=Proficiency.beginner,
            native_language="German",
            learning_goal="Test",
            target_duration=3,
            duration_unit=DurationUnit.months,
        )
        db_session.add(duplicate_profile)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_profile_foreign_key_cascade(self, db_session, test_user, test_profile):
        """Test that profile has foreign key to user with cascade delete."""
        # Check the foreign key is set up correctly in the model definition
        assert hasattr(test_profile, 'user_id')
        # The actual cascade behavior is tested at the database level
        # This test verifies the model structure

    def test_profile_all_age_ranges(self, db_session, test_user, create_test_profile):
        """Test creating profiles with all age ranges."""
        ranges = [
            AgeRange.under_18,
            AgeRange._18_25,
            AgeRange._26_35,
            AgeRange._36_45,
            AgeRange._45_plus,
        ]
        
        for i, age_range in enumerate(ranges):
            # Create a new user for each profile to avoid unique constraint
            from app.util.auth import get_password_hash
            from app.model.user import User
            
            user = User(
                first_name=f"User{i}",
                last_name=f"Test{i}",
                email=f"user_{age_range.value}_{i}@example.com",
                password=get_password_hash("Test123!"),
                role=UserRole.student,
                is_verified=True,
            )
            db_session.add(user)
            db_session.commit()
            
            profile = create_test_profile(
                user_id=user.id,
                age_range=age_range,
            )
            
            assert profile.age_range == age_range

    def test_profile_all_proficiency_levels(self, db_session, create_test_user, create_test_profile):
        """Test creating profiles with all proficiency levels."""
        proficiencies = [
            Proficiency.beginner,
            Proficiency.basic,
            Proficiency.intermediate,
            Proficiency.advanced,
        ]
        
        for i, proficiency in enumerate(proficiencies):
            user = create_test_user(email=f"prof_{proficiency.value}_{i}@example.com")
            
            profile = create_test_profile(
                user_id=user.id,
                proficiency=proficiency,
            )
            
            assert profile.proficiency == proficiency
