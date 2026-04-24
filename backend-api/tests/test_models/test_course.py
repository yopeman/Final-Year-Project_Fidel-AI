"""
Unit tests for Course model.
"""

import pytest
from app.model.course import Course


class TestCourseModel:
    """Test cases for Course model."""

    def test_course_creation(self, db_session, create_test_course):
        """Test creating a new course."""
        course = create_test_course(
            name="Advanced English",
            description="Advanced English course for professionals",
        )
        
        assert course.id is not None
        assert course.name == "Advanced English"
        assert course.description == "Advanced English course for professionals"
        assert course.is_deleted is False
        assert course.created_at is not None
        assert course.updated_at is not None

    def test_course_tablename(self):
        """Test that Course model has correct table name."""
        assert Course.__tablename__ == "courses"

    def test_course_relationships_exist(self, db_session, test_course):
        """Test that course relationships are defined."""
        assert hasattr(test_course, 'materials')
        assert hasattr(test_course, 'batch_courses')

    def test_course_description_nullable(self, db_session, create_test_course):
        """Test that course description can be null."""
        course = create_test_course(
            name="No Description Course",
            description=None,
        )
        
        assert course.description is None

    def test_course_name_required(self, db_session):
        """Test that course name is required."""
        from sqlalchemy.exc import IntegrityError
        
        course = Course(
            name=None,  # Name is required
            description="Test description",
        )
        db_session.add(course)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_course_soft_delete(self, db_session, test_course):
        """Test soft delete functionality for courses."""
        from datetime import datetime
        
        test_course.is_deleted = True
        test_course.deleted_at = datetime.utcnow()
        db_session.commit()
        
        assert test_course.is_deleted is True
        assert test_course.deleted_at is not None

    def test_course_name_max_length(self, db_session, create_test_course):
        """Test course name within max length (100 chars)."""
        long_name = "A" * 100  # Max length is 100
        course = create_test_course(name=long_name)
        
        assert course.name == long_name

    def test_multiple_courses_creation(self, db_session, create_test_course):
        """Test creating multiple courses."""
        courses_data = [
            {"name": "English Basics", "description": "Basic course"},
            {"name": "English Intermediate", "description": "Intermediate course"},
            {"name": "English Advanced", "description": "Advanced course"},
        ]
        
        created_courses = []
        for data in courses_data:
            course = create_test_course(**data)
            created_courses.append(course)
        
        assert len(created_courses) == 3
        assert all(c.id is not None for c in created_courses)
