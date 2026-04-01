import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_COURSES,
  CREATE_COURSE,
  UPDATE_COURSE,
  DELETE_COURSE,
  GET_COURSE,
  ADD_MATERIAL,
  DELETE_MATERIAL,
  DELETE_MATERIAL_FILE
} from '../graphql/course';
import { BASE_URL } from '../lib/apollo-client';

import useContentStore from '../store/contentStore';
import {
  AddCourseModal,
  EditCourseModal,
  DeleteCourseConfirmationModal
} from './CourseManagementModals';
import { ViewCourseDetailsModal } from './CourseDetailsModal';
import {
  AddMaterialModal,
  DeleteMaterialConfirmationModal,
  ViewMaterialModal,
  DeleteFileConfirmationModal
} from './MaterialManagementModals';

const AdminCourses = ({
  onCourseAction,
  onEditCourse,
  onViewCourse,
  onDeleteCourse
}) => {
  const { filters, setFilters, getFilteredCourses, setCourses } = useContentStore();
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
  const [showViewMaterialModal, setShowViewMaterialModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDeleteFileConfirmation, setShowDeleteFileConfirmation] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [fileForm, setFileForm] = useState({
    files: []
  });
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
  const [createCourse] = useMutation(CREATE_COURSE);
  const [updateCourse] = useMutation(UPDATE_COURSE);
  const [deleteCourseMutation] = useMutation(DELETE_COURSE);
  const [addMaterialMutation] = useMutation(ADD_MATERIAL, {
    refetchQueries: [{ query: GET_COURSES }]
  });
  const [deleteMaterialMutation] = useMutation(DELETE_MATERIAL, {
    refetchQueries: [{ query: GET_COURSES }]
  });
  const [deleteMaterialFileMutation] = useMutation(DELETE_MATERIAL_FILE, {
    refetchQueries: [{ query: GET_COURSES }]
  });

  const courses = data?.courses || [];

  // Sync courses to store
  useEffect(() => {
    if (courses.length > 0) {
      setCourses(courses);
    }
  }, [courses, setCourses]);

  const filteredCourses = getFilteredCourses();

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

  // Handle file upload
  const handleFileUpload = async () => {
    if (!fileForm.files || fileForm.files.length === 0) return;

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Append each file to FormData
      fileForm.files.forEach((file) => {
        formData.append('files', file);
      });

      // Make REST API call using axios
      const response = await axios.post(
        `${BASE_URL}/api/upload/material/${selectedMaterial.id}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );


      // Update selected material files directly
      setSelectedMaterial(prev => ({
        ...prev,
        files: [...(prev.files || []), ...response.data]
      }));

      // console.log(selectedMaterial);


      // Also update the course materials
      setSelectedCourse(prev => ({
        ...prev,
        materials: prev.materials.map(material =>
          material.id === selectedMaterial.id
            ? { ...material, files: [...(material.files || []), ...response.data] }
            : material
        )
      }));

      // Reset file form
      setFileForm({ files: [] });
    } catch (err) {
      console.error('Error uploading files:', err);
      setFormErrors({ submit: 'Failed to upload files. Please try again.' });
    } finally {
      setIsSubmitting(false);
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
      <div className="glass-premium rounded-3xl border border-white/10 p-12 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-yellow/20 rounded-full blur-xl animate-pulse"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow relative z-10 mx-auto"></div>
        </div>
        <p className="text-center text-accent-secondary mt-6 font-medium animate-pulse">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-premium rounded-3xl border border-white/10 p-12 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Error Loading Courses</h3>
          <p className="text-accent-muted mb-8 text-lg">We encountered an issue while fetching the courses. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="w-full sm:w-auto px-8 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-brand-yellow/90 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,193,7,0.3)] flex items-center justify-center mx-auto space-x-2"
          >
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-brand-yellow/10 transition-all duration-1000"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <BookOpen className="w-8 h-8 text-brand-yellow" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Courses</h2>
              <p className="text-accent-secondary mt-1 font-medium flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-yellow mr-2 animate-pulse"></span>
                Manage academic curriculum and study materials
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="group px-8 py-4 bg-brand-yellow text-black rounded-2xl font-black uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,193,7,0.2)] flex items-center space-x-3 active:scale-95"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-premium rounded-3xl border border-white/10 p-6 shadow-xl bg-white/5 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-accent-muted w-5 h-5 group-focus-within:text-brand-yellow transition-colors" />
            <input
              type="text"
              placeholder="Search by course name or description..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 transition-all font-bold tracking-tight"
            />
          </div>
          <div className="flex items-center space-x-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 min-w-fit">
            <Filter className="w-5 h-5 text-accent-muted" />
            <span className="text-sm font-black text-white uppercase tracking-widest">
              Showing {filteredCourses.length} <span className="text-accent-muted">/ {courses.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-[#080C14]/40 border border-white/10 rounded-[2.5rem] p-8 hover:border-brand-yellow/30 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col h-full"
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-yellow/10 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-1 bg-brand-yellow/0 group-hover:bg-brand-yellow transition-all duration-500 h-full"></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-brand-yellow/30 group-hover:bg-brand-yellow/10 transition-all duration-500 shadow-xl">
                  <BookOpen className="w-8 h-8 text-accent-muted group-hover:text-brand-yellow transition-colors" />
                </div>
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#0D1B2A] bg-accent-muted/20 flex items-center justify-center text-[10px] font-black text-white backdrop-blur-md">
                    FYP
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter group-hover:text-brand-yellow transition-colors line-clamp-1">
                  {course.name}
                </h3>
                <p className="text-accent-secondary font-medium line-clamp-3 mb-8 leading-relaxed text-sm">
                  {course.description}
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/5 group-hover:bg-white/10 transition-all">
                    <div className="flex items-center space-x-3 mb-1">
                      <Calendar className="w-4 h-4 text-brand-yellow" />
                      <span className="text-[10px] font-black text-accent-muted uppercase tracking-widest">Created</span>
                    </div>
                    <span className="text-white font-bold text-xs">{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/5 group-hover:bg-white/10 transition-all">
                    <div className="flex items-center space-x-3 mb-1">
                      <Clock className="w-4 h-4 text-brand-yellow" />
                      <span className="text-[10px] font-black text-accent-muted uppercase tracking-widest">Materials</span>
                    </div>
                    <span className="text-white font-bold text-xs">{course.materials?.length || 0} Assets</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowCourseDetails(true);
                      }}
                      className="p-3 bg-white/5 hover:bg-brand-yellow/20 text-accent-muted hover:text-brand-yellow rounded-2xl transition-all border border-white/5"
                      title="Explore Content"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditClick(course)}
                      className="p-3 bg-white/5 hover:bg-brand-yellow/20 text-accent-muted hover:text-brand-yellow rounded-2xl transition-all border border-white/5"
                      title="Edit Syllabus"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setCourseToDelete(course.id);
                      setShowDeleteConfirmation(true);
                    }}
                    className="p-3 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-2xl transition-all border border-red-500/20"
                    title="Retire Course"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="glass-premium rounded-[3rem] border border-dashed border-white/20 p-20 text-center bg-white/5">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 opacity-20">
            <BookOpen className="w-12 h-12 text-accent-muted" />
          </div>
          <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Archive Empty</h3>
          <p className="max-w-md mx-auto text-accent-secondary font-medium mb-12">
            {filters.search
              ? `No courses matching "${filters.search}" were found in our database.`
              : 'Our academic catalogue is currently empty. Start by initializing your first course.'}
          </p>
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="px-10 py-5 bg-brand-yellow text-black rounded-3xl font-black capitalize tracking-tight hover:scale-105 transition-all shadow-2xl"
          >
            Initialize Courseware
          </button>
        </div>
      )}

      <AnimatePresence>
        {showCourseDetails && selectedCourse && (
          <ViewCourseDetailsModal
            isOpen={showCourseDetails}
            onClose={() => {
              setShowCourseDetails(false);
              setSelectedCourse(null);
            }}
            selectedCourse={selectedCourse}
            onAddMaterial={() => setShowAddMaterialModal(true)}
            onViewMaterial={(material) => {
              setSelectedMaterial(material);
              setShowViewMaterialModal(true);
            }}
            onDeleteMaterial={(materialId) => {
              setMaterialToDelete(materialId);
              setShowDeleteMaterialConfirmation(true);
            }}
            onEditCourse={(course) => {
              setShowCourseDetails(false);
              handleEditClick(course);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddCourseModal && (
          <AddCourseModal
            isOpen={showAddCourseModal}
            onClose={handleCloseModals}
            onSubmit={handleAddCourse}
            courseForm={courseForm}
            onFormChange={handleFormChange}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditCourseModal && editingCourse && (
          <EditCourseModal
            isOpen={showEditCourseModal}
            onClose={handleCloseModals}
            onSubmit={handleEditCourse}
            courseForm={courseForm}
            onFormChange={handleFormChange}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
            editingCourse={editingCourse}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirmation && (
          <DeleteCourseConfirmationModal
            isOpen={showDeleteConfirmation}
            onClose={() => {
              setShowDeleteConfirmation(false);
              setCourseToDelete(null);
            }}
            onConfirm={handleDeleteCourse}
            courseToDelete={courseToDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddMaterialModal && (
          <AddMaterialModal
            isOpen={showAddMaterialModal}
            onClose={() => {
              setShowAddMaterialModal(false);
              setMaterialForm({ name: '', description: '' });
              setFormErrors({});
            }}
            onSubmit={handleAddMaterial}
            materialForm={materialForm}
            onFormChange={handleMaterialFormChange}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
            selectedCourse={selectedCourse}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteMaterialConfirmation && (
          <DeleteMaterialConfirmationModal
            isOpen={showDeleteMaterialConfirmation}
            onClose={() => {
              setShowDeleteMaterialConfirmation(false);
              setMaterialToDelete(null);
            }}
            onConfirm={handleDeleteMaterial}
            materialId={materialToDelete}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showViewMaterialModal && selectedMaterial && (
          <ViewMaterialModal
            isOpen={showViewMaterialModal}
            onClose={() => {
              setShowViewMaterialModal(false);
              setSelectedMaterial(null);
            }}
            selectedMaterial={selectedMaterial}
            onFileUpload={handleFileUpload}
            onFileSelect={(files) => setFileForm({ files })}
            onDeleteFile={(fileId) => {
              setFileToDelete(fileId);
              setShowDeleteFileConfirmation(true);
            }}
            fileForm={fileForm}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteFileConfirmation && (
          <DeleteFileConfirmationModal
            isOpen={showDeleteFileConfirmation}
            onClose={() => {
              setShowDeleteFileConfirmation(false);
              setFileToDelete(null);
            }}
            onConfirm={async () => {
              try {
                await deleteMaterialFileMutation({ variables: { id: fileToDelete } });
                setShowDeleteFileConfirmation(false);
                setFileToDelete(null);
                setSelectedMaterial(prev => ({
                  ...prev,
                  files: prev.files.filter(file => file.id !== fileToDelete)
                }));
                setSelectedCourse(prev => ({
                  ...prev,
                  materials: prev.materials.map(material =>
                    material.id === selectedMaterial.id
                      ? { ...material, files: material.files.filter(file => file.id !== fileToDelete) }
                      : material
                  )
                }));
              } catch (err) {
                console.error('Error deleting file:', err);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCourses;