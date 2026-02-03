import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  X, 
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_COURSES, CREATE_COURSE, UPDATE_COURSE, DELETE_COURSE } from '../graphql/course';

const AdminCourses = ({ 
  onCourseAction, 
  onEditCourse, 
  onViewCourse, 
  onDeleteCourse 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_COURSES);

  const [createCourse] = useMutation(CREATE_COURSE);
  const [updateCourse] = useMutation(UPDATE_COURSE);
  const [deleteCourseMutation] = useMutation(DELETE_COURSE);

  const courses = data?.courses || [];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDeleted = filterStatus === 'all' || 
      (filterStatus === 'DELETED' && course.isDeleted) ||
      (filterStatus === 'ACTIVE' && !course.isDeleted);
    
    return matchesSearch && matchesDeleted;
  });

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourseMutation({ variables: { id: courseId } });
      setShowDeleteConfirmation(false);
      setCourseToDelete(null);
      refetch();
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };



  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-center text-gray-600 mt-4">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
          <p className="text-gray-600">Please try again.</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Courses Management</h2>
          <p className="text-gray-600">Manage all courses and their content</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
                </div>
                <div className="ml-4 bg-indigo-100 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
              </div>


              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowCourseDetails(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditCourse(course)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Edit Course"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCourseToDelete(course.id);
                        setShowDeleteConfirmation(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search criteria or filters.' 
              : 'No courses have been created yet. Create your first course to get started.'}
          </p>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Add Your First Course
          </button>
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCourse.name}</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCourseDetails(false);
                  setSelectedCourse(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Course Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <span className="font-mono text-xs">{selectedCourse.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deleted:</span>
                    <span>{selectedCourse.isDeleted ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deleted At:</span>
                    <span>{selectedCourse.deletedAt ? new Date(selectedCourse.deletedAt).toLocaleDateString() : 'Not deleted'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Dates</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(selectedCourse.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span>{new Date(selectedCourse.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Description</h4>
              <p className="text-gray-700">{selectedCourse.description}</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCourseDetails(false);
                  setSelectedCourse(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCourseDetails(false);
                  setSelectedCourse(null);
                  onEditCourse(selectedCourse);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Edit Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Course</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setCourseToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this course? This will permanently remove the course and all associated data.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setCourseToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCourse(courseToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;