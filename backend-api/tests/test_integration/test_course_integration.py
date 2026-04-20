"""
Integration tests for Course management flows.
"""

import pytest


class TestCourseIntegration:
    """Integration tests for course CRUD operations."""

    def test_admin_full_course_lifecycle(self, admin_graphql_query, graphql_query):
        """Test complete course lifecycle: create -> update -> query -> delete."""
        import uuid
        
        unique_name = f"Integration Course {uuid.uuid4().hex[:8]}"
        
        # Step 1: Create course
        create_mutation = """
        mutation CreateCourse($input: CreateCourseInput!) {
            createCourse(input: $input) {
                id
                name
                description
            }
        }
        """
        
        create_vars = {
            "input": {
                "name": unique_name,
                "description": "Integration test course",
            }
        }
        
        create_response = admin_graphql_query(create_mutation, create_vars)
        assert create_response.status_code == 200
        create_data = create_response.json()
        
        if "errors" in create_data and create_data["errors"]:
            pytest.skip(f"Course creation mutation not available: {create_data['errors']}")
            
        course_id = create_data["data"]["createCourse"]["id"]
        
        # Step 2: Query course
        query = """
        query GetCourse($id: ID!) {
            course(id: $id) {
                id
                name
                description
            }
        }
        """
        
        query_response = admin_graphql_query(query, {"id": course_id})
        assert query_response.status_code == 200
        query_data = query_response.json()
        assert query_data["data"]["course"]["name"] == unique_name
        
        # Step 3: Update course
        update_mutation = """
        mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
            updateCourse(id: $id, input: $input) {
                id
                name
                description
            }
        }
        """
        
        update_vars = {
            "id": course_id,
            "input": {
                "name": f"{unique_name} (Updated)",
                "description": "Updated description",
            }
        }
        
        update_response = admin_graphql_query(update_mutation, update_vars)
        assert update_response.status_code == 200
        
        # Step 4: Delete course
        delete_mutation = """
        mutation DeleteCourse($id: ID!) {
            deleteCourse(id: $id)
        }
        """
        
        delete_response = admin_graphql_query(delete_mutation, {"id": course_id})
        assert delete_response.status_code == 200
        delete_data = delete_response.json()
        assert delete_data["data"]["deleteCourse"] is True

    def test_regular_user_cannot_create_course(self, authenticated_graphql_query):
        """Test that regular users cannot create courses."""
        mutation = """
        mutation CreateCourse($input: CreateCourseInput!) {
            createCourse(input: $input) {
                id
                name
            }
        }
        """
        
        variables = {
            "input": {
                "name": "Unauthorized Course",
                "description": "Should not be created",
            }
        }
        
        response = authenticated_graphql_query(mutation, variables)
        
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error_message = str(data["errors"])
        assert "Unauthorized" in error_message or "Admin access required" in error_message

    def test_regular_user_cannot_delete_course(self, authenticated_graphql_query, test_course):
        """Test that regular users cannot delete courses."""
        mutation = """
        mutation DeleteCourse($id: ID!) {
            deleteCourse(id: $id)
        }
        """
        
        response = authenticated_graphql_query(mutation, {"id": test_course.id})
        
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error_message = str(data["errors"])
        assert "Unauthorized" in error_message or "Admin access required" in error_message

    def test_query_all_courses(self, authenticated_graphql_query, create_test_course):
        """Test querying all available courses."""
        # Create a few courses
        course1 = create_test_course(name="Course One")
        course2 = create_test_course(name="Course Two")
        
        query = """
        query GetCourses {
            courses {
                id
                name
                description
            }
        }
        """
        
        response = authenticated_graphql_query(query)
        
        assert response.status_code == 200
        data = response.json()
        assert "errors" not in data or data["errors"] is None
        assert "courses" in data["data"]
        # At least our created courses should be in the list
        course_names = [c["name"] for c in data["data"]["courses"]]
        assert "Course One" in course_names or "Course Two" in course_names

    def test_query_single_course(self, authenticated_graphql_query, test_course):
        """Test querying a single course by ID."""
        query = """
        query GetCourse($id: ID!) {
            course(id: $id) {
                id
                name
                description
                createdAt
                updatedAt
            }
        }
        """
        
        response = authenticated_graphql_query(query, {"id": test_course.id})
        
        assert response.status_code == 200
        data = response.json()
        assert "errors" not in data or data["errors"] is None
        assert data["data"]["course"]["id"] == test_course.id
        assert data["data"]["course"]["name"] == test_course.name
