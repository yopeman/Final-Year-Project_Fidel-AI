import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  UserPlus,
  UserCheck,
  UserX,
  BookOpen,
  Calendar as CalendarIcon,
  MapPin,
  FileText,
  User,
  Clock as ClockIcon,
  Calendar as CalendarLucide
} from 'lucide-react';
import AddSchedulePopup from './AddSchedulePopup';
import DeleteSchedulePopup from './DeleteSchedulePopup';
import { 
  GET_BATCHES, 
  CREATE_BATCH, 
  UPDATE_BATCH, 
  DELETE_BATCH,
  CREATE_BATCH_COURSE,
  DELETE_BATCH_COURSE,
  CREATE_INSTRUCTOR,
  DELETE_INSTRUCTOR,
  CREATE_COURSE_SCHEDULE,
  DELETE_COURSE_SCHEDULE,
  GET_ENROLLMENTS,
  CREATE_ENROLLMENT,
  UPDATE_ENROLLMENT,
  DELETE_ENROLLMENT,
  GET_ATTENDANCES
} from '../graphql/batch';
import { GET_COURSES } from '../graphql/course';
import { GET_SCHEDULES } from '../graphql/schedule';
import { GET_USERS } from '../graphql/auth';

const AdminBatches = ({ 
  onBatchAction, 
  onEditBatch, 
  onViewBatch, 
  onDeleteBatch 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);

  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(GET_BATCHES);
  const { data: coursesData } = useQuery(GET_COURSES);
  const { data: schedulesData } = useQuery(GET_SCHEDULES);

  const [createBatch] = useMutation(CREATE_BATCH);
  const [updateBatch] = useMutation(UPDATE_BATCH);
  const [deleteBatchMutation] = useMutation(DELETE_BATCH);
  const [createBatchCourse] = useMutation(CREATE_BATCH_COURSE);
  const [deleteBatchCourseMutation] = useMutation(DELETE_BATCH_COURSE);
  const [createInstructor] = useMutation(CREATE_INSTRUCTOR);
  const [deleteInstructorMutation] = useMutation(DELETE_INSTRUCTOR);
  const [createCourseSchedule] = useMutation(CREATE_COURSE_SCHEDULE);
  const [deleteCourseScheduleMutation] = useMutation(DELETE_COURSE_SCHEDULE);
  const [createEnrollment] = useMutation(CREATE_ENROLLMENT);
  const [updateEnrollment] = useMutation(UPDATE_ENROLLMENT);
  const [deleteEnrollmentMutation] = useMutation(DELETE_ENROLLMENT);
  const { data: usersData } = useQuery(GET_USERS);
  
  // State for activity indicators
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigningCourse, setIsAssigningCourse] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [isAddingInstructor, setIsAddingInstructor] = useState(false);
  const [isDeletingInstructor, setIsDeletingInstructor] = useState(false);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [isDeletingSchedule, setIsDeletingSchedule] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [instructorToDelete, setInstructorToDelete] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [showDeleteCourseConfirm, setShowDeleteCourseConfirm] = useState(false);
  const [showDeleteInstructorConfirm, setShowDeleteInstructorConfirm] = useState(false);
  const [showDeleteScheduleConfirm, setShowDeleteScheduleConfirm] = useState(false);
  const [showAssignCourseModal, setShowAssignCourseModal] = useState(false);
  const [showAddInstructorModal, setShowAddInstructorModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [selectedBatchForCourse, setSelectedBatchForCourse] = useState(null);
  const [selectedCourseForInstructor, setSelectedCourseForInstructor] = useState(null);
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] = useState(null);
  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  
  // Enrollment state
const [selectedBatchForEnrollment, setSelectedBatchForEnrollment] = useState(null);
const [showEnrollStudentModal, setShowEnrollStudentModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showUpdateEnrollmentModal, setShowUpdateEnrollmentModal] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
  const [showDeleteEnrollmentConfirm, setShowDeleteEnrollmentConfirm] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isUpdatingEnrollment, setIsUpdatingEnrollment] = useState(false);
  const [isDeletingEnrollment, setIsDeletingEnrollment] = useState(false);
  
  // Attendance state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedBatchForAttendance, setSelectedBatchForAttendance] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);

  const batches = data?.batches || [];
  const courses = coursesData?.courses || [];
  const schedules = schedulesData?.schedules || [];

  // Filter batches based on search and filters
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || batch.level === filterLevel;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const handleCreateBatch = async (batchData) => {
    try {
      await createBatch({
        variables: {
          input: {
            name: batchData.name,
            description: batchData.description,
            level: batchData.level,
            language: batchData.language || 'English',
            startDate: batchData.startDate,
            endDate: batchData.endDate,
            maxStudents: parseInt(batchData.maxStudents),
            feeAmount: parseFloat(batchData.feeAmount)
          }
        }
      });
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      console.error('Error creating batch:', err);
    }
  };

  const handleUpdateBatch = async (batchId, batchData) => {
    setIsUpdating(true);
    try {
      await updateBatch({
        variables: {
          id: batchId,
          input: {
            name: batchData.name,
            description: batchData.description,
            level: batchData.level,
            language: batchData.language,
            startDate: batchData.startDate,
            endDate: batchData.endDate,
            maxStudents: parseInt(batchData.maxStudents),
            feeAmount: parseFloat(batchData.feeAmount),
            status: batchData.status
          }
        }
      });
      setShowEditModal(false);
      setSelectedBatch(null);
      refetch();
    } catch (err) {
      console.error('Error updating batch:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    setBatchToDelete(batchId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBatch = async () => {
    if (!batchToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteBatchMutation({ variables: { id: batchToDelete } });
      setShowDeleteConfirm(false);
      setBatchToDelete(null);
      refetch();
    } catch (err) {
      console.error('Error deleting batch:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBatchToDelete(null);
  };

  const handleAssignCourse = async (batchId, courseId) => {
    setIsAssigningCourse(true);
    try {
      await createBatchCourse({
        variables: {
          input: {
            batchId: batchId,
            courseId: courseId
          }
        }
      });
      setShowAssignCourseModal(false);
      setSelectedBatchForCourse(null);
      // Refresh the batch details to show updated courses
      if (selectedBatch && selectedBatch.id === batchId) {
        handleViewBatchDetails(selectedBatch);
      }
      refetch();
    } catch (err) {
      console.error('Error assigning course:', err);
    } finally {
      setIsAssigningCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    setCourseToDelete(courseId);
    setShowDeleteCourseConfirm(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    setIsDeletingCourse(true);
    try {
      await deleteBatchCourseMutation({ variables: { id: courseToDelete } });
      setShowDeleteCourseConfirm(false);
      setCourseToDelete(null);
      // Refresh the batch details to show updated courses
      if (selectedBatch) {
        handleViewBatchDetails(selectedBatch);
      }
      refetch();
    } catch (err) {
      console.error('Error deleting course:', err);
    } finally {
      setIsDeletingCourse(false);
    }
  };

  const cancelDeleteCourse = () => {
    setShowDeleteCourseConfirm(false);
    setCourseToDelete(null);
  };

  const handleAddInstructor = async (batchCourseId, userId, role) => {
    setIsAddingInstructor(true);
    try {
      await createInstructor({
        variables: {
          input: {
            batchCourseId: batchCourseId,
            userId: userId,
            role: role
          }
        }
      });
      setShowAddInstructorModal(false);
      setSelectedCourseForInstructor(null);
      // Refresh the batch details to show updated instructors
      if (selectedBatch) {
        handleViewBatchDetails(selectedBatch);
      }
      refetch();
    } catch (err) {
      console.error('Error adding instructor:', err);
    } finally {
      setIsAddingInstructor(false);
    }
  };

  const handleDeleteInstructor = async (instructorId) => {
    setInstructorToDelete(instructorId);
    setShowDeleteInstructorConfirm(true);
  };

  const confirmDeleteInstructor = async () => {
    if (!instructorToDelete) return;
    
    setIsDeletingInstructor(true);
    try {
      await deleteInstructorMutation({ variables: { id: instructorToDelete } });
      setShowDeleteInstructorConfirm(false);
      setInstructorToDelete(null);
      // Refresh the batch details to show updated instructors
      if (selectedBatch) {
        handleViewBatchDetails(selectedBatch);
      }
      refetch();
    } catch (err) {
      console.error('Error deleting instructor:', err);
    } finally {
      setIsDeletingInstructor(false);
    }
  };

  const cancelDeleteInstructor = () => {
    setShowDeleteInstructorConfirm(false);
    setInstructorToDelete(null);
  };

  const handleAddSchedule = async (batchCourseId, scheduleId) => {
    setIsAddingSchedule(true);
    try {
      await createCourseSchedule({
        variables: {
          input: {
            batchCourseId: batchCourseId,
            scheduleId: scheduleId
          }
        }
      });
      setShowAddScheduleModal(false);
      setSelectedCourseForSchedule(null);
      // Refresh the batch details to show updated schedules
      if (selectedBatch) {
        handleViewBatchDetails(selectedBatch);
      }
      refetch();
    } catch (err) {
      console.error('Error adding schedule:', err);
    } finally {
      setIsAddingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    setScheduleToDelete(scheduleId);
    setShowDeleteScheduleConfirm(true);
  };

  const confirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    
    setIsDeletingSchedule(true);
    try {
      await deleteCourseScheduleMutation({ variables: { id: scheduleToDelete } });
      setShowDeleteScheduleConfirm(false);
      setScheduleToDelete(null);
      // Refresh the batch details to show updated schedules
      if (selectedBatch) {
        handleViewBatchDetails(selectedBatch);
      }
      refetch();
    } catch (err) {
      console.error('Error deleting schedule:', err);
    } finally {
      setIsDeletingSchedule(false);
    }
  };

  const cancelDeleteSchedule = () => {
    setShowDeleteScheduleConfirm(false);
    setScheduleToDelete(null);
  };

  const handleViewBatchDetails = async (batch) => {
    setSelectedBatch(batch);
    setShowViewModal(true);
    
    // Use the data already available in the batch object
    // The batch query already includes batchCourses, instructors, and enrollments
    setBatchDetails({
      courses: batch.batchCourses || [],
      instructors: batch.instructors || [],
      enrollments: batch.enrollments || [],
      schedules: [] // Schedules are not available in the current schema
    });
    
    // Initialize enrollment state
    setSelectedBatchForEnrollment(batch.id);
    
    // Initialize attendance state
    setSelectedBatchForAttendance(batch);
  };

  const handleEnrollStudent = async (batchId, studentId) => {
    setIsEnrolling(true);
    try {
      await createEnrollment({
        variables: {
          batchId: batchId,
          studentId: studentId
        }
      });
      setShowEnrollStudentModal(false);
      setSelectedBatchForEnrollment(null);
      // Refresh the batch details to show updated enrollments
      if (selectedBatch && selectedBatch.id === batchId) {
        handleViewBatchDetails(selectedBatch);
      }
      refetch();
    } catch (err) {
      console.error('Error enrolling student:', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUpdateEnrollment = async (enrollmentId, status) => {
    setIsUpdatingEnrollment(true);
    try {
      await updateEnrollment({
        variables: {
          id: enrollmentId,
          input: {
            status: status
          }
        }
      });
      setShowUpdateEnrollmentModal(false);
      setSelectedEnrollment(null);
      // Refresh the batch details to show updated enrollments
      if (selectedBatch) {
        handleViewBatchDetails(selectedBatch);
      }
      refetch();
    } catch (err) {
      console.error('Error updating enrollment:', err);
    } finally {
      setIsUpdatingEnrollment(false);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    setEnrollmentToDelete(enrollmentId);
    setShowDeleteEnrollmentConfirm(true);
  };

  const confirmDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return;
    
    setIsDeletingEnrollment(true);
    try {
      await deleteEnrollmentMutation({ variables: { id: enrollmentToDelete } });
      setShowDeleteEnrollmentConfirm(false);
      setEnrollmentToDelete(null);
      // Refresh the batch details to show updated enrollments
      if (selectedBatch) {
        handleViewBatchDetails(selectedBatch);
      }
      refetch();
    } catch (err) {
      console.error('Error deleting enrollment:', err);
    } finally {
      setIsDeletingEnrollment(false);
    }
  };

  const cancelDeleteEnrollment = () => {
    setShowDeleteEnrollmentConfirm(false);
    setEnrollmentToDelete(null);
  };

  // Attendance Functions
  const handleFetchAttendance = async (batchId, date) => {
    setIsFetchingAttendance(true);
    try {
      // For now, we'll simulate fetching attendance data from enrollments
      // In a real implementation, this would be a GraphQL query
      const batch = batches.find(b => b.id === batchId);
      if (batch && batch.enrollments) {
        const attendanceList = batch.enrollments.map(enrollment => ({
          id: enrollment.id,
          profile: enrollment.profile,
          attendance: {
            status: 'NOT_MARKED', // Default status
            date: date
          }
        }));
        setAttendanceData(attendanceList);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setIsFetchingAttendance(false);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    setIsMarkingAttendance(true);
    try {
      // Find the student in the current attendance data
      const studentIndex = attendanceData.findIndex(s => s.id === studentId);
      if (studentIndex !== -1) {
        const updatedAttendance = [...attendanceData];
        updatedAttendance[studentIndex] = {
          ...updatedAttendance[studentIndex],
          attendance: {
            ...updatedAttendance[studentIndex].attendance,
            status: status,
            date: selectedDate
          }
        };
        setAttendanceData(updatedAttendance);

        // In a real implementation, this would be a GraphQL mutation
        console.log(`Marked student ${studentId} as ${status} for date ${selectedDate}`);
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleMarkPresent = (studentId) => {
    handleMarkAttendance(studentId, 'PRESENT');
  };

  const handleMarkAbsent = (studentId) => {
    handleMarkAttendance(studentId, 'ABSENT');
  };

  const handleMarkLate = (studentId) => {
    handleMarkAttendance(studentId, 'LATE');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'BEGINNER': return 'bg-purple-100 text-purple-800';
      case 'BASIC': return 'bg-blue-100 text-blue-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // View Batch Details Modal Component
  const ViewBatchModal = ({ 
    isOpen, 
    onClose, 
    batch, 
    details, 
    onAssignCourse, 
    onDeleteCourse, 
    onViewCourseDetails,
    onEnrollStudent,
    onUpdateEnrollment,
    onDeleteEnrollment
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{batch.name}</h3>
                <p className="text-gray-600">{batch.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(batch.level)}`}>
                    {batch.level}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                  <span className="text-xs text-gray-500">{batch.language}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedBatchForAttendance(batch);
                  setShowAttendanceModal(true);
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Attendance</span>
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Schedule</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span>{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>End Date:</span>
                  <span>{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee Amount:</span>
                  <span>${batch.feeAmount}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Capacity</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Max Students:</span>
                  <span>{batch.maxStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrolled:</span>
                  <span>{batch.enrollments?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span>{batch.maxStudents - (batch.enrollments?.length || 0)}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${((batch.enrollments?.length || 0) / batch.maxStudents) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Courses</span>
                </h4>
                <button
                  onClick={() => onAssignCourse(batch.id)}
                  className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Assign Course</span>
                </button>
              </div>
              {batch.batchCourses && batch.batchCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {batch.batchCourses.map((bc) => (
                    <div key={bc.id} className="bg-white rounded p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{bc.course?.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{bc.course?.description}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewCourseDetails(bc)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Course Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCourse(bc.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Course Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No courses assigned</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Enrollments</span>
                </h4>
                <button
                  onClick={() => onEnrollStudent(batch.id)}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Enroll Student</span>
                </button>
              </div>
              {details?.enrollments && details.enrollments.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {details.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-white rounded p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            {enrollment.profile?.user?.firstName} {enrollment.profile?.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{enrollment.profile?.user?.email}</div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Status: {enrollment.status}</span>
                            <span>Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onUpdateEnrollment(enrollment)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Update Enrollment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteEnrollment(enrollment.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Enrollment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No enrollments yet</p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
            <p className="text-gray-600 mt-1">Manage batches, courses, and enrollments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Batch</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="BASIC">Basic</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch List */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading batches...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Batches</h3>
            <p className="text-gray-600">Please try again.</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-6 text-center">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batches Found</h3>
            <p className="text-gray-600">Create your first batch to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                        <div className="text-sm text-gray-500">{batch.description}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{batch.language}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">Fee: ${batch.feeAmount}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(batch.level)}`}>
                        {batch.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {batch.enrollments?.length || 0} / {batch.maxStudents}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${((batch.enrollments?.length || 0) / batch.maxStudents) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{batch.batchCourses?.length || 0}</div>
                      <div className="text-xs text-gray-500">
                        {batch.batchCourses?.map(bc => bc.course?.name).join(', ') || 'No courses'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {batch.endDate ? `to ${new Date(batch.endDate).toLocaleDateString()}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBatchDetails(batch)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatch(batch);
                            setShowEditModal(true);
                          }}
                          disabled={isUpdating}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit Batch"
                        >
                          {isUpdating ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Batch"
                        >
                          {isDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <CreateBatchModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBatch}
          courses={courses}
        />
      )}

      {/* Edit Batch Modal */}
      {showEditModal && selectedBatch && (
        <EditBatchModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBatch(null);
          }}
          onSubmit={handleUpdateBatch}
          batch={selectedBatch}
          courses={courses}
          isUpdating={isUpdating}
        />
      )}

      {/* View Batch Details Modal */}
      {showViewModal && selectedBatch && (
        <ViewBatchModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedBatch(null);
            setBatchDetails(null);
          }}
          batch={selectedBatch}
          details={batchDetails}
          onAssignCourse={(batchId) => {
            setSelectedBatchForCourse(batchId);
            setShowAssignCourseModal(true);
          }}
          onDeleteCourse={handleDeleteCourse}
          onViewCourseDetails={(courseDetails) => {
            setSelectedCourseDetails(courseDetails);
            setShowCourseDetailsModal(true);
          }}
          onEnrollStudent={(batchId) => {
            setSelectedBatchForEnrollment(batchId);
            setShowEnrollStudentModal(true);
          }}
          onUpdateEnrollment={(enrollment) => {
            setSelectedEnrollment(enrollment);
            setShowUpdateEnrollmentModal(true);
          }}
          onDeleteEnrollment={(enrollmentId) => {
            setEnrollmentToDelete(enrollmentId);
            setShowDeleteEnrollmentConfirm(true);
          }}
        />
      )}

      {/* Assign Course Modal */}
      {showAssignCourseModal && selectedBatchForCourse && (
        <AssignCourseModal
          isOpen={showAssignCourseModal}
          onClose={() => {
            setShowAssignCourseModal(false);
            setSelectedBatchForCourse(null);
          }}
          onSubmit={handleAssignCourse}
          batchId={selectedBatchForCourse}
          courses={courses}
          isAssigning={isAssigningCourse}
        />
      )}

      {/* Delete Course Confirmation Modal */}
      {showDeleteCourseConfirm && (
        <DeleteCourseConfirmationModal
          isOpen={showDeleteCourseConfirm}
          onClose={cancelDeleteCourse}
          onConfirm={confirmDeleteCourse}
          isDeleting={isDeletingCourse}
        />
      )}

      {/* Add Instructor Modal */}
      {showAddInstructorModal && selectedCourseForInstructor && (
        <AddInstructorModal
          isOpen={showAddInstructorModal}
          onClose={() => {
            setShowAddInstructorModal(false);
            setSelectedCourseForInstructor(null);
          }}
          onSubmit={handleAddInstructor}
          batchCourseId={selectedCourseForInstructor}
          users={usersData?.users || []}
          isAdding={isAddingInstructor}
          zIndex={60}
        />
      )}

      {/* Delete Instructor Confirmation Modal */}
      {showDeleteInstructorConfirm && (
        <DeleteInstructorConfirmationModal
          isOpen={showDeleteInstructorConfirm}
          onClose={cancelDeleteInstructor}
          onConfirm={confirmDeleteInstructor}
          isDeleting={isDeletingInstructor}
          zIndex={60}
        />
      )}

      {/* Add Schedule Popup */}
      {showAddScheduleModal && selectedCourseForSchedule && (
        <AddSchedulePopup
          isOpen={showAddScheduleModal}
          onClose={() => {
            setShowAddScheduleModal(false);
            setSelectedCourseForSchedule(null);
          }}
          onSubmit={handleAddSchedule}
          batchCourseId={selectedCourseForSchedule}
          schedules={schedules}
          isAdding={isAddingSchedule}
          zIndex={60}
        />
      )}

      {/* Delete Schedule Popup */}
      {showDeleteScheduleConfirm && (
        <DeleteSchedulePopup
          isOpen={showDeleteScheduleConfirm}
          onClose={cancelDeleteSchedule}
          onConfirm={confirmDeleteSchedule}
          isDeleting={isDeletingSchedule}
          zIndex={60}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={cancelDelete}
          onConfirm={confirmDeleteBatch}
          isDeleting={isDeleting}
          zIndex={60}
        />
      )}

      {/* View Course Details Modal */}
      {showCourseDetailsModal && selectedCourseDetails && (
        <ViewCourseDetailsModal
          isOpen={showCourseDetailsModal}
          onClose={() => {
            setShowCourseDetailsModal(false);
            setSelectedCourseDetails(null);
          }}
          courseDetails={selectedCourseDetails}
          onAddInstructor={(batchCourseId) => {
            setSelectedCourseForInstructor(batchCourseId);
            setShowAddInstructorModal(true);
          }}
          onDeleteInstructor={handleDeleteInstructor}
          onAddSchedule={(batchCourseId) => {
            setSelectedCourseForSchedule(batchCourseId);
            setShowAddScheduleModal(true);
          }}
          onDeleteSchedule={handleDeleteSchedule}
          zIndex={60}
        />
      )}

      {/* Enroll Student Modal */}
      {showEnrollStudentModal && selectedBatchForEnrollment && (
        <EnrollStudentModal
          isOpen={showEnrollStudentModal}
          onClose={() => {
            setShowEnrollStudentModal(false);
            setSelectedBatchForEnrollment(null);
          }}
          onSubmit={handleEnrollStudent}
          batchId={selectedBatchForEnrollment}
          users={usersData?.users || []}
          isEnrolling={isEnrolling}
        />
      )}

      {/* Update Enrollment Modal */}
      {showUpdateEnrollmentModal && selectedEnrollment && (
        <UpdateEnrollmentModal
          isOpen={showUpdateEnrollmentModal}
          onClose={() => {
            setShowUpdateEnrollmentModal(false);
            setSelectedEnrollment(null);
          }}
          onSubmit={handleUpdateEnrollment}
          enrollment={selectedEnrollment}
          isUpdating={isUpdatingEnrollment}
        />
      )}

      {/* Delete Enrollment Confirmation Modal */}
      {showDeleteEnrollmentConfirm && (
        <DeleteEnrollmentConfirmationModal
          isOpen={showDeleteEnrollmentConfirm}
          onClose={cancelDeleteEnrollment}
          onConfirm={confirmDeleteEnrollment}
          isDeleting={isDeletingEnrollment}
        />
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && selectedBatchForAttendance && (
        <AttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedBatchForAttendance(null);
          }}
          batch={selectedBatchForAttendance}
          selectedDate={selectedDate}
          onDateChange={(date) => {
            setSelectedDate(date);
            handleFetchAttendance(selectedBatchForAttendance.id, date);
          }}
          attendanceData={attendanceData}
          onMarkPresent={handleMarkPresent}
          onMarkAbsent={handleMarkAbsent}
          onMarkLate={handleMarkLate}
          isFetching={isFetchingAttendance}
        />
      )}
    </div>
  );
};

// Create Batch Modal Component
const CreateBatchModal = ({ isOpen, onClose, onSubmit, courses }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'BEGINNER',
    language: 'English',
    startDate: '',
    endDate: '',
    maxStudents: '',
    feeAmount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Batch</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="BASIC">Basic</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.feeAmount}
                onChange={(e) => setFormData({...formData, feeAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Batch Modal Component
const EditBatchModal = ({ isOpen, onClose, onSubmit, batch, courses, isUpdating }) => {
  const [formData, setFormData] = useState({
    name: batch?.name || '',
    description: batch?.description || '',
    level: batch?.level || 'BEGINNER',
    language: batch?.language || 'English',
    startDate: batch?.startDate ? batch.startDate.split('T')[0] : '',
    endDate: batch?.endDate ? batch.endDate.split('T')[0] : '',
    maxStudents: batch?.maxStudents || '',
    feeAmount: batch?.feeAmount || '',
    status: batch?.status || 'UPCOMING'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(batch.id, formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Batch</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="BASIC">Basic</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.feeAmount}
                onChange={(e) => setFormData({...formData, feeAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Batch</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Batch Details Modal Component
const ViewBatchModal = ({ 
  isOpen, 
  onClose, 
  batch, 
  details, 
  onAssignCourse, 
  onDeleteCourse, 
  onViewCourseDetails,
  onEnrollStudent,
  onUpdateEnrollment,
  onDeleteEnrollment
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{batch.name}</h3>
              <p className="text-gray-600">{batch.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(batch.level)}`}>
                  {batch.level}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                  {batch.status}
                </span>
                <span className="text-xs text-gray-500">{batch.language}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedBatchForAttendance(batch);
                setShowAttendanceModal(true);
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Attendance</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Schedule</span>
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Start Date:</span>
                <span>{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>End Date:</span>
                <span>{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee Amount:</span>
                <span>${batch.feeAmount}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Capacity</span>
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Max Students:</span>
                <span>{batch.maxStudents}</span>
              </div>
              <div className="flex justify-between">
                <span>Enrolled:</span>
                <span>{batch.enrollments?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span>{batch.maxStudents - (batch.enrollments?.length || 0)}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${((batch.enrollments?.length || 0) / batch.maxStudents) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Courses</span>
              </h4>
              <button
                onClick={() => onAssignCourse(batch.id)}
                className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Assign Course</span>
              </button>
            </div>
            {batch.batchCourses && batch.batchCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {batch.batchCourses.map((bc) => (
                  <div key={bc.id} className="bg-white rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{bc.course?.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{bc.course?.description}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewCourseDetails(bc)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Course Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCourse(bc.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Course Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No courses assigned</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Enrollments</span>
              </h4>
              <button
                onClick={() => onEnrollStudent(batch.id)}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <UserPlus className="w-3 h-3" />
                <span>Enroll Student</span>
              </button>
            </div>
            {details?.enrollments && details.enrollments.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {details.enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="bg-white rounded p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {enrollment.profile?.user?.firstName} {enrollment.profile?.user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{enrollment.profile?.user?.email}</div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Status: {enrollment.status}</span>
                          <span>Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onUpdateEnrollment(enrollment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Update Enrollment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEnrollment(enrollment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Enrollment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No enrollments yet</p>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Assign Course Modal Component
const AssignCourseModal = ({ isOpen, onClose, onSubmit, batchId, courses, isAssigning }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCourseId) {
      onSubmit(batchId, selectedCourseId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Assign Course to Batch</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.description}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Note:</strong> This will assign the selected course to the batch. Students enrolled in this batch will have access to this course.
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isAssigning}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAssigning || !selectedCourseId}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Assign Course</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Course Confirmation Modal Component
const DeleteCourseConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Course Assignment</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to delete this course assignment? This will remove the course from the batch and may affect enrolled students.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong>Warning:</strong> This action will remove the course from the batch. Students will lose access to this course.
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Assignment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'UPCOMING': return 'bg-blue-100 text-blue-800';
    case 'COMPLETED': return 'bg-gray-100 text-gray-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getLevelColor = (level) => {
  switch (level) {
    case 'BEGINNER': return 'bg-purple-100 text-purple-800';
    case 'BASIC': return 'bg-blue-100 text-blue-800';
    case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
    case 'ADVANCED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// View Course Details Modal Component
const ViewCourseDetailsModal = ({ 
  isOpen, 
  onClose, 
  courseDetails, 
  onAddInstructor, 
  onDeleteInstructor, 
  onAddSchedule, 
  onDeleteSchedule 
}) => {
  if (!isOpen || !courseDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{courseDetails.course?.name}</h3>
              <p className="text-gray-600">{courseDetails.course?.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-gray-500">Batch: {courseDetails.batch?.name}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Batch Instructors */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Batch Instructors</span>
              </h4>
              <button
                onClick={() => onAddInstructor(courseDetails.id)}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <UserPlus className="w-3 h-3" />
                <span>Add Instructor</span>
              </button>
            </div>
            {courseDetails.instructors && courseDetails.instructors.length > 0 ? (
              <div className="space-y-3">
                {courseDetails.instructors.map((instructor) => (
                  <div key={instructor.id} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {instructor.user?.firstName} {instructor.user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{instructor.user?.email}</div>
                        <div className="text-xs text-blue-600 mt-1 font-medium">{instructor.role}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onDeleteInstructor(instructor.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Remove Instructor"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No instructors assigned</p>
            )}
          </div>

          {/* Course Schedule */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <CalendarLucide className="w-4 h-4" />
                <span>Course Schedule</span>
              </h4>
              <button
                onClick={() => onAddSchedule(courseDetails.id)}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <CalendarLucide className="w-3 h-3" />
                <span>Add Schedule</span>
              </button>
            </div>
            {courseDetails.schedules && courseDetails.schedules.length > 0 ? (
              <div className="space-y-3">
                {courseDetails.schedules.map((scheduleItem) => (
                  <div key={scheduleItem.id} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {scheduleItem.schedule?.dayOfWeek}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {scheduleItem.schedule?.startTime} - {scheduleItem.schedule?.endTime}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onDeleteSchedule(scheduleItem.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Remove Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No schedule assigned</p>
            )}
          </div>
        </div>

        {/* Additional Course Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Course Information</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Course ID:</span>
              <span className="ml-2">{courseDetails.course?.id}</span>
            </div>
            <div>
              <span className="font-medium">Batch ID:</span>
              <span className="ml-2">{courseDetails.batch?.id}</span>
            </div>
            <div>
              <span className="font-medium">Assignment Date:</span>
              <span className="ml-2">{new Date(courseDetails.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Batch</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to delete this batch? This will permanently remove the batch and all associated data including courses, enrollments, and schedules.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong>Warning:</strong> This action is irreversible. Please make sure this is the intended batch before proceeding.
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Batch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Instructor Modal Component
const AddInstructorModal = ({ isOpen, onClose, onSubmit, batchCourseId, users, isAdding, zIndex = 50 }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('MAIN');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUserId && role) {
      onSubmit(batchCourseId, selectedUserId, role);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Instructor to Course</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select a user...</option>
              {users
                .filter(user => user.role === 'TUTOR')
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="MAIN">Main Instructor</option>
              <option value="ASSISTANT">Assistant Instructor</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Note:</strong> This will assign the selected user as an instructor for this course. They will have access to manage course content and students.
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !selectedUserId}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Add Instructor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Instructor Confirmation Modal Component
const DeleteInstructorConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, zIndex = 50 }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Instructor</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to remove this instructor from the course? This will revoke their access to manage this course.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong>Warning:</strong> This action will remove the instructor's access to this course. Students will no longer be able to interact with this instructor for this course.
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <UserX className="w-4 h-4" />
                <span>Remove Instructor</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Schedule Modal Component
const AddScheduleModal = ({ isOpen, onClose, onSubmit, batchCourseId, schedules, isAdding }) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedScheduleId) {
      onSubmit(batchCourseId, selectedScheduleId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Schedule to Course</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Schedule</label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select a schedule...</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.dayOfWeek} - {schedule.startTime} to {schedule.endTime}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Note:</strong> This will assign the selected schedule to this course. Students enrolled in this course will attend classes according to this schedule.
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !selectedScheduleId}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <CalendarLucide className="w-4 h-4" />
                  <span>Add Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Schedule Confirmation Modal Component
const DeleteScheduleConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Schedule</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to remove this schedule from the course? This will affect the class timing for enrolled students.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong>Warning:</strong> This action will remove the schedule from this course. Students will no longer have classes at this time.
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enroll Student Modal Component
const EnrollStudentModal = ({ isOpen, onClose, onSubmit, batchId, users, isEnrolling }) => {
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUserId) {
      onSubmit(batchId, selectedUserId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Enroll Student</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select a student...</option>
              {users
                .filter(user => user.role === 'STUDENT')
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
            </select>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-green-800">
                <strong>Note:</strong> This will enroll the selected student in this batch. They will have access to all assigned courses.
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isEnrolling}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEnrolling || !selectedUserId}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isEnrolling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Enrollment Modal Component
const UpdateEnrollmentModal = ({ isOpen, onClose, onSubmit, enrollment, isUpdating }) => {
  const [status, setStatus] = useState(enrollment?.status || 'ACTIVE');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(enrollment.id, status);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Update Enrollment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <div className="px-3 py-2 bg-gray-100 rounded-lg">
              {enrollment?.profile?.user?.firstName} {enrollment?.profile?.user?.lastName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
            <div className="px-3 py-2 bg-gray-100 rounded-lg">
              {enrollment?.status}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Note:</strong> This will update the enrollment status for this student in the batch.
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Update Enrollment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Enrollment Confirmation Modal Component
const DeleteEnrollmentConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Enrollment</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to delete this enrollment? This will remove the student from the batch and revoke their access to all courses.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong>Warning:</strong> This action will remove the student's access to this batch and all its courses. This cannot be undone.
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Enrollment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Attendance Modal Component
const AttendanceModal = ({ 
  isOpen, 
  onClose, 
  batch, 
  selectedDate, 
  onDateChange, 
  attendanceData, 
  onMarkPresent, 
  onMarkAbsent, 
  onMarkLate, 
  isFetching 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">Attendance for {batch?.name}</h3>
              <p className="text-gray-600">Date: {new Date(selectedDate).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isFetching ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      Loading attendance data...
                    </td>
                  </tr>
                ) : attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No students enrolled in this batch for the selected date.
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.profile?.user?.firstName} {student.profile?.user?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.profile?.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.attendance?.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                          student.attendance?.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                          student.attendance?.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {student.attendance?.status || 'NOT_MARKED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => onMarkPresent(student.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Mark Present"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => onMarkAbsent(student.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Mark Absent"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => onMarkLate(student.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Mark Late"
                        >
                          Late
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBatches;
