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
  Clock,
  Save,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_COURSES, 
  CREATE_COURSE, 
  UPDATE_COURSE, 
  DELETE_COURSE,
  GET_COURSE,
  ADD_MATERIAL,
  DELETE_MATERIAL
} from '../graphql/course';

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
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showDeleteMaterialConfirmation, setShowDeleteMaterialConfirmation] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    name: '',
    description: ''
  });
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_COURSES);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!courseForm.name.trim()) {
      errors.name = 'Course name is required';
    }
    if (!courseForm.description.trim()) {
      errors.description = 'Course description is required';
    } else if (courseForm.description.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setCourseForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle add course submission
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createCourse({
        variables: {
          input: {
            name: courseForm.name.trim(),
            description: courseForm.description.trim()
          }
        }
      });
      setShowAddCourseModal(false);
      setCourseForm({ name: '', description: '' });
      setFormErrors({});
      refetch();
    } catch (err) {
      console.error('Error creating course:', err);
      setFormErrors({ submit: 'Failed to create course. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add material submission
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!materialForm.name.trim()) {
      errors.name = 'Material name is required';
    }
    if (!materialForm.description.trim()) {
      errors.description = 'Material description is required';
    } else if (materialForm.description.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { data } = await addMaterialMutation({
        variables: {
          input: {
            courseId: selectedCourse.id,
            name: materialForm.name.trim(),
            description: materialForm.description.trim()
          }
        }
      });
      setShowAddMaterialModal(false);
      setMaterialForm({ name: '', description: '' });
      setFormErrors({});
      // Update selected course materials directly without refetching all courses
      if (data.addMaterial) {
        setSelectedCourse(prev => ({
          ...prev,
          materials: [...(prev.materials || []), data.addMaterial]
        }));
      }
    } catch (err) {
      console.error('Error adding material:', err);
      setFormErrors({ submit: 'Failed to add material. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete material
  const handleDeleteMaterial = async (materialId) => {
    try {
      await deleteMaterialMutation({ variables: { id: materialId } });
      setShowDeleteMaterialConfirmation(false);
      setMaterialToDelete(null);
      // Update selected course materials directly without refetching all courses
      setSelectedCourse(prev => ({
        ...prev,
        materials: prev.materials.filter(material => material.id !== materialId)
      }));
    } catch (err) {
      console.error('Error deleting material:', err);
    }
  };

  // Handle material form input changes
  const handleMaterialFormChange = (field, value) => {
    setMaterialForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle edit course submission
  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await updateCourse({
        variables: {
          id: editingCourse.id,
          input: {
            name: courseForm.name.trim(),
            description: courseForm.description.trim()
          }
        }
      });
      setShowEditCourseModal(false);
      setEditingCourse(null);
      setCourseForm({ name: '', description: '' });
      setFormErrors({});
      refetch();
    } catch (err) {
      console.error('Error updating course:', err);
      setFormErrors({ submit: 'Failed to update course. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize edit form
  const handleEditClick = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description
    });
    setShowEditCourseModal(true);
  };

  // Close modals and reset form
  const handleCloseModals = () => {
    setShowAddCourseModal(false);
    setShowEditCourseModal(false);
    setEditingCourse(null);
    setCourseForm({ name: '', description: '' });
    setFormErrors({});
  };

  const [createCourse] = useMutation(CREATE_COURSE);
  const [updateCourse] = useMutation(UPDATE_COURSE);
  const [deleteCourseMutation] = useMutation(DELETE_COURSE);
  const [addMaterialMutation] = useMutation(ADD_MATERIAL, {
    refetchQueries: [{ query: GET_COURSES }]
  });
  const [deleteMaterialMutation] = useMutation(DELETE_MATERIAL, {
    refetchQueries: [{ query: GET_COURSES }]
  });

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
        <button 
          onClick={() => setShowAddCourseModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
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
                      onClick={() => handleEditClick(course)}
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

            {/* Materials Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Course Materials</h4>
                <button
                  onClick={() => {
                    setShowAddMaterialModal(true);
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Material</span>
                </button>
              </div>
              
              {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCourse.materials.map((material) => (
                    <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{material.name}</h5>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setMaterialToDelete(material.id);
                              setShowDeleteMaterialConfirmation(true);
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Delete Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{material.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Created: {new Date(material.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  No materials added yet. Click "Add Material" to get started.
                </div>
              )}
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
                  handleEditClick(selectedCourse);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Edit Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Add New Course</h3>
                  <p className="text-sm text-gray-600">Create a new course</p>
                </div>
              </div>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-4">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {formErrors.submit}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter course name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter course description"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Course</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditCourseModal && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Edit className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Course</h3>
                  <p className="text-sm text-gray-600">Update course information</p>
                </div>
              </div>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditCourse} className="space-y-4">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {formErrors.submit}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter course name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter course description"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Course</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Add Material</h3>
                  <p className="text-sm text-gray-600">Add material to {selectedCourse?.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddMaterialModal(false);
                  setMaterialForm({ name: '', description: '' });
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-4">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {formErrors.submit}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Name
                </label>
                <input
                  type="text"
                  value={materialForm.name}
                  onChange={(e) => handleMaterialFormChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter material name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Description
                </label>
                <textarea
                  value={materialForm.description}
                  onChange={(e) => handleMaterialFormChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter material description"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMaterialModal(false);
                    setMaterialForm({ name: '', description: '' });
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Material</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Material Confirmation Dialog */}
      {showDeleteMaterialConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Material</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteMaterialConfirmation(false);
                  setMaterialToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this material? This will permanently remove the material and all associated files.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteMaterialConfirmation(false);
                  setMaterialToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMaterial(materialToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Material
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