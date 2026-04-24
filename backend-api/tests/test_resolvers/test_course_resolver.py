"""
Unit tests for Course resolver.
"""

import pytest
from unittest.mock import MagicMock
from app.resolver.course import (
    resolve_courses,
    resolve_course,
    resolve_create_course,
    resolve_update_course,
    resolve_delete_course,
)
from app.model.course import Course
from app.model.user import UserRole


class TestCourseResolverQueries:
    """Test cases for Course resolver queries."""

    def test_resolve_courses_authenticated(self, db_session, test_user, create_test_course):
        """Test that authenticated user can query all courses."""
        # Create some courses
        course1 = create_test_course(name="Course 1")
        course2 = create_test_course(name="Course 2")
        
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        result = resolve_courses(None, info)
        
        assert len(result) >= 2
        assert all(isinstance(c, Course) for c in result)

    def test_resolve_courses_unauthenticated(self, db_session):
        """Test that unauthenticated user cannot query courses."""
        info = MagicMock()
        info.context = {
            "current_user": None,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_courses(None, info)
        
        assert "Not authenticated" in str(exc_info.value)

    def test_resolve_course_by_id_success(self, db_session, test_user, test_course):
        """Test querying a specific course by ID."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        result = resolve_course(None, info, test_course.id)
        
        assert result.id == test_course.id
        assert result.name == test_course.name

    def test_resolve_course_not_found(self, db_session, test_user):
        """Test querying a non-existent course."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_course(None, info, "non-existent-id")
        
        assert "Course not found" in str(exc_info.value)


class TestCourseResolverMutations:
    """Test cases for Course resolver mutations."""

    def test_resolve_create_course_as_admin(self, db_session, test_admin):
        """Test that admin can create a course."""
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        input_data = {
            "name": "New Test Course",
            "description": "A test course description",
        }
        
        result = resolve_create_course(None, info, input_data)
        
        assert result.id is not None
        assert result.name == "New Test Course"
        assert result.description == "A test course description"

    def test_resolve_create_course_as_non_admin(self, db_session, test_user):
        """Test that non-admin cannot create a course."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        input_data = {
            "name": "Unauthorized Course",
            "description": "Should not be created",
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_create_course(None, info, input_data)
        
        assert "Unauthorized" in str(exc_info.value) or "Admin access required" in str(exc_info.value)

    def test_resolve_create_course_unauthenticated(self, db_session):
        """Test that unauthenticated user cannot create a course."""
        info = MagicMock()
        info.context = {
            "current_user": None,
            "db": db_session,
        }
        
        input_data = {
            "name": "Unauthorized Course",
            "description": "Should not be created",
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_create_course(None, info, input_data)
        
        assert "Not authenticated" in str(exc_info.value)

    def test_resolve_update_course_as_admin(self, db_session, test_admin, test_course):
        """Test that admin can update a course."""
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        input_data = {
            "name": "Updated Course Name",
            "description": "Updated description",
        }
        
        result = resolve_update_course(None, info, test_course.id, input_data)
        
        assert result.name == "Updated Course Name"
        assert result.description == "Updated description"

    def test_resolve_update_course_partial(self, db_session, test_admin, test_course):
        """Test updating only specific fields of a course."""
        original_description = test_course.description
        
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        # Only update name, description should remain
        input_data = {
            "name": "Only Name Updated",
        }
        
        result = resolve_update_course(None, info, test_course.id, input_data)
        
        assert result.name == "Only Name Updated"

    def test_resolve_update_course_not_found(self, db_session, test_admin):
        """Test updating a non-existent course."""
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        input_data = {
            "name": "New Name",
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_update_course(None, info, "non-existent-id", input_data)
        
        assert "Course not found" in str(exc_info.value)

    def test_resolve_delete_course_as_admin(self, db_session, test_admin, create_test_course):
        """Test that admin can delete a course."""
        course = create_test_course(name="Course to Delete")
        
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        result = resolve_delete_course(None, info, course.id)
        
        assert result is True
        assert course.is_deleted is True
        assert course.deleted_at is not None

    def test_resolve_delete_course_as_non_admin(self, db_session, test_user, test_course):
        """Test that non-admin cannot delete a course."""
        info = MagicMock()
        info.context = {
            "current_user": test_user,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_delete_course(None, info, test_course.id)
        
        assert "Unauthorized" in str(exc_info.value) or "Admin access required" in str(exc_info.value)

    def test_resolve_delete_course_not_found(self, db_session, test_admin):
        """Test deleting a non-existent course."""
        info = MagicMock()
        info.context = {
            "current_user": test_admin,
            "db": db_session,
        }
        
        with pytest.raises(Exception) as exc_info:
            resolve_delete_course(None, info, "non-existent-id")
        
        assert "Course not found" in str(exc_info.value)
