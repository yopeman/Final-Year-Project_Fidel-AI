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
  Calendar as CalendarLucide,
  Layers, Award, Settings, Edit2, Hash } from 'lucide-react';
import AddSchedulePopup from './AddSchedulePopup';
import DeleteSchedulePopup from './DeleteSchedulePopup';
import ViewBatchModal, { getStatusColor, getLevelColor } from './ViewBatchModal';
import { 
  CreateBatchModal, 
  EditBatchModal, 
  DeleteConfirmationModal 
} from './BatchManagementModals';
import { 
  AssignCourseModal, 
  DeleteCourseConfirmationModal, 
  ViewCourseDetailsModal, 
  AddInstructorModal, 
  DeleteInstructorConfirmationModal
} from './BatchCourseModals';
import { 
  EnrollStudentModal, 
  UpdateEnrollmentModal, 
  DeleteEnrollmentConfirmationModal, 
  AttendanceModal, 
  CertificatesModal 
} from './BatchStudentModals';
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
import { GET_CERTIFICATES } from '../graphql/certificates';
import { GET_COURSES } from '../graphql/course';
import { GET_SCHEDULES } from '../graphql/schedule';
import { GET_USERS } from '../graphql/auth';
import { DELETE_CERTIFICATE } from '../graphql/tutorBatch';
import { BASE_URL } from '../lib/apollo-client';

import useBatchStore from '../store/batchStore';

const AdminBatches = ({ 
  onBatchAction, 
  onEditBatch, 
  onViewBatch, 
  onDeleteBatch 
}) => {
  const { filters, setFilters, getFilteredBatches, setBatches } = useBatchStore();
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
  const [deleteCertificateMutation] = useMutation(DELETE_CERTIFICATE);
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

  // Certificates state
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);
  const [selectedBatchForCertificates, setSelectedBatchForCertificates] = useState(null);
  const [certificatesData, setCertificatesData] = useState([]);
  const [isFetchingCertificates, setIsFetchingCertificates] = useState(false);
  const [isDeletingCertificate, setIsDeletingCertificate] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [showDeleteCertificateConfirm, setShowDeleteCertificateConfirm] = useState(false);

  // Certificate Functions
  const handleFetchCertificates = async (batchId) => {
    setIsFetchingCertificates(true);
    try {
      const { data } = await client.query({
        query: GET_CERTIFICATES,
        variables: { batchId: batchId }
      });
      setCertificatesData(data.certificates || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setCertificatesData([]);
    } finally {
      setIsFetchingCertificates(false);
    }
  };

  const handleViewCertificates = async (batch) => {
    setSelectedBatchForCertificates(batch);
    setShowCertificatesModal(true);
    await handleFetchCertificates(batch.id);
  };

  const handleDeleteCertificate = async (certificateId) => {
    const confirmed = window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.');
    
    if (confirmed) {
      setIsDeletingCertificate(true);
      try {
        await deleteCertificateMutation({
          variables: {
            id: certificateId
          }
        });
        // Refresh the certificates data
        if (selectedBatchForCertificates) {
          await handleFetchCertificates(selectedBatchForCertificates.id);
        }
      } catch (err) {
        console.error('Error deleting certificate:', err);
        alert('Error deleting certificate. Please try again.');
      } finally {
        setIsDeletingCertificate(false);
      }
    }
  };

  const batches = data?.batches || [];
  const courses = coursesData?.courses || [];
  const schedules = schedulesData?.schedules || [];

  // Sync batches to store
  useEffect(() => {
    if (batches.length > 0) {
      setBatches(batches);
    }
  }, [batches, setBatches]);

  const filteredBatches = getFilteredBatches();

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
      // Use the correct GraphQL query to fetch attendance data
      const { data } = await client.query({
        query: GET_ATTENDANCES,
        variables: { batchId: batchId }
      });
      
      // Show all students by default, filter by date only after a specific date is selected
      let filteredAttendance = data.attendances;
      
      // Only filter by date if a specific date is selected (not the default current date)
      if (date && date !== new Date().toISOString().split('T')[0]) {
        filteredAttendance = data.attendances.filter(attendance => {
          const attendanceDate = new Date(attendance.attendanceDate).toISOString().split('T')[0];
          console.log("Attendance Date:", attendanceDate);
          console.log("Selected Date:", date);
          return attendanceDate === date;
        });
      }
      
      setAttendanceData(filteredAttendance);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      // Fallback to empty array if query fails
      setAttendanceData([]);
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

  return (
    <div className="space-y-8 pb-12">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 mb-8"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search batches by name or level..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-12 pr-4 py-3 glass-premium border border-white/10 rounded-xl text-white placeholder:text-accent-muted focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="flex-1 lg:flex-none px-4 py-3 glass-premium border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer font-bold"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-black font-black uppercase tracking-wider rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Batch</span>
          </button>
        </div>
      </motion.div>

      {/* Batches Content */}
      <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">Academic Batches</h3>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-accent-secondary">
            {filteredBatches.length} Active
          </span>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-accent-secondary font-medium">Synchronizing batch data...</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <GraduationCap className="w-10 h-10 text-accent-muted" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">No Batches Found</h4>
            <p className="text-accent-secondary font-medium">Adjust your filters or create a new batch.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-8 py-5 text-[10px] font-black text-accent-secondary uppercase tracking-[0.2em]">Batch Identifier</th>
                  <th className="px-8 py-5 text-[10px] font-black text-accent-secondary uppercase tracking-[0.2em] text-center">Level & Stack</th>
                  <th className="px-8 py-5 text-[10px] font-black text-accent-secondary uppercase tracking-[0.2em] text-center">Enrollment Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-accent-secondary uppercase tracking-[0.2em] text-center">Timeline</th>
                  <th className="px-8 py-5 text-[10px] font-black text-accent-secondary uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBatches.map((batch, index) => (
                  <tr key={batch.id || `batch-${index}`} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-all duration-300">
                          <BookOpen className="w-6 h-6 text-accent-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg mb-1">{batch.name}</div>
                          <span className={`${getStatusColor(batch.status)}`}>
                            {batch.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center space-y-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getLevelColor(batch.level)}`}>
                          {batch.level}
                        </span>
                        <div className="text-sm font-medium text-accent-secondary flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                          {batch.language}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-[140px] mx-auto">
                        <div className="flex justify-between items-end text-xs font-bold mb-2">
                          <span className="text-accent-secondary">Capacity</span>
                          <span className="text-white">{batch.enrollments?.length || 0} <span className="text-accent-muted font-medium">/ {batch.maxStudents}</span></span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 p-[1px] border border-white/5">
                          <div 
                            className="bg-primary h-full rounded-full yellow-glow transition-all duration-1000" 
                            style={{ width: `${Math.min(((batch.enrollments?.length || 0) / batch.maxStudents) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                        <div className="text-sm font-black text-white">
                          {batch.startDate ? new Date(batch.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                        </div>
                        <div className="text-[10px] font-bold text-accent-muted uppercase tracking-widest mt-1">
                          {batch.endDate ? `Ends ${new Date(batch.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'Ongoing'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewBatchDetails(batch)}
                          className="p-3 bg-white/5 border border-white/10 text-accent-secondary rounded-xl hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                          title="Detailed Analytics"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatch(batch);
                            setShowEditModal(true);
                          }}
                          disabled={isUpdating}
                          className="p-3 bg-white/5 border border-white/10 text-accent-secondary rounded-xl hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all active:scale-95"
                          title="Modify Constraints"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          disabled={isDeleting}
                          className="p-3 bg-white/5 border border-white/10 text-accent-secondary rounded-xl hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 transition-all active:scale-95"
                          title="Terminate Batch"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Modals Section */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateBatchModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateBatch}
            courses={courses}
          />
        )}

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
            onAttendance={(batch) => {
              setSelectedBatchForAttendance(batch);
              setShowAttendanceModal(true);
              handleFetchAttendance(batch.id, selectedDate);
            }}
            onCertificates={(batch) => {
              handleViewCertificates(batch);
            }}
          />
        )}

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

        {showDeleteCourseConfirm && (
          <DeleteCourseConfirmationModal
            isOpen={showDeleteCourseConfirm}
            onClose={cancelDeleteCourse}
            onConfirm={confirmDeleteCourse}
            isDeleting={isDeletingCourse}
          />
        )}

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

        {showDeleteInstructorConfirm && (
          <DeleteInstructorConfirmationModal
            isOpen={showDeleteInstructorConfirm}
            onClose={cancelDeleteInstructor}
            onConfirm={confirmDeleteInstructor}
            isDeleting={isDeletingInstructor}
            zIndex={60}
          />
        )}

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

        {showDeleteScheduleConfirm && (
          <DeleteSchedulePopup
            isOpen={showDeleteScheduleConfirm}
            onClose={cancelDeleteSchedule}
            onConfirm={confirmDeleteSchedule}
            isDeleting={isDeletingSchedule}
            zIndex={60}
          />
        )}

        {showDeleteConfirm && (
          <DeleteConfirmationModal
            isOpen={showDeleteConfirm}
            onClose={cancelDelete}
            onConfirm={confirmDeleteBatch}
            isDeleting={isDeleting}
            zIndex={60}
          />
        )}

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
            onAddSchedule={handleAddSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            isAddingSchedule={isAddingSchedule}
            zIndex={60}
          />
        )}

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

        {showDeleteEnrollmentConfirm && (
          <DeleteEnrollmentConfirmationModal
            isOpen={showDeleteEnrollmentConfirm}
            onClose={cancelDeleteEnrollment}
            onConfirm={confirmDeleteEnrollment}
            isDeleting={isDeletingEnrollment}
          />
        )}

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
            onOpen={() => handleFetchAttendance(selectedBatchForAttendance.id, selectedDate)}
          />
        )}

        {showCertificatesModal && selectedBatchForCertificates && (
          <CertificatesModal
            isOpen={showCertificatesModal}
            onClose={() => {
              setShowCertificatesModal(false);
              setSelectedBatchForCertificates(null);
              setCertificatesData([]);
            }}
            batch={selectedBatchForCertificates}
            certificatesData={certificatesData}
            isFetching={isFetchingCertificates}
            isDeletingCertificate={isDeletingCertificate}
            onHandleDeleteCertificate={handleDeleteCertificate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBatches;
