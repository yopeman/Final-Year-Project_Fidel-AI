import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Plus, 
  User, 
  UserCheck, 
  UserX, 
  CheckCircle, 
  X, 
  AlertCircle,
  GraduationCap,
  FileText,
  Video,
  File,
  Download,
  ExternalLink,
  Loader2,
  FileCheck,
  FileText as FileTextIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  CalendarX,
  Users2,
  UserPlus,
  UserMinus,
  Check,
  X as XIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Calendar as CalendarLucide
} from 'lucide-react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_TUTOR_BATCHES, GET_BATCH_ENROLLMENTS, GET_BATCH_ATTENDANCE, UPDATE_ENROLLMENT_STATUS, GET_BATCH_MEETING_LINK } from '../graphql/tutorBatch';

const TutorBatches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [enrollmentAction, setEnrollmentAction] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Attendance state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedBatchForAttendance, setSelectedBatchForAttendance] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);

  // Get tutor's associated batches using the ME query
  const { data: meData, loading: meLoading } = useQuery(GET_TUTOR_BATCHES);

  // Get detailed enrollment data when a batch is selected
  const { data: enrollmentData, loading: enrollmentLoading, refetch: refetchEnrollments } = useQuery(
    GET_BATCH_ENROLLMENTS,
    {
      variables: { batchId: selectedBatch?.id },
      skip: !selectedBatch
    }
  );

  // Get attendance data for the selected batch
  const { data: batchAttendanceData, loading: attendanceLoading, refetch: refetchAttendance } = useQuery(
    GET_BATCH_ATTENDANCE,
    {
      variables: { batchId: selectedBatch?.id },
      skip: !selectedBatch
    }
  );

  const [updateEnrollment] = useMutation(UPDATE_ENROLLMENT_STATUS);
  const [getMeetingLink, { loading: meetingLinkLoading }] = useMutation(GET_BATCH_MEETING_LINK);

  // Extract batches from the nested structure
  const tutorBatches = React.useMemo(() => {
    if (!meData?.me) {
      return [];
    }

    const batchInstructors = meData.me.batchInstructors || [];
    const batchCourses = batchInstructors
      .filter(instructor => instructor.role === 'MAIN' || instructor.role === 'ASSISTANT')
      .map(instructor => instructor.batchCourse);

    // Group by batch to avoid duplicates
    const batchMap = new Map();
    batchCourses.forEach(bc => {
      if (!batchMap.has(bc.batch.id)) {
        batchMap.set(bc.batch.id, {
          ...bc.batch,
          batchCourses: [bc],
          totalCourses: 1
        });
      } else {
        const existing = batchMap.get(bc.batch.id);
        existing.batchCourses.push(bc);
        existing.totalCourses += 1;
      }
    });

    return Array.from(batchMap.values());
  }, [meData]);

  const filteredBatches = tutorBatches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewBatch = (batch) => {
    setSelectedBatch(batch);
    setShowBatchDetails(true);
  };

  const handleEnrollmentAction = (enrollment, action) => {
    setSelectedEnrollment(enrollment);
    setEnrollmentAction(action);
    setShowEnrollmentModal(true);
  };

  const confirmEnrollmentAction = async () => {
    if (!selectedEnrollment || !enrollmentAction) return;

    setLoading(true);
    try {
      let newStatus;
      switch (enrollmentAction) {
        case 'enroll':
          newStatus = 'ENROLLED';
          break;
        case 'complete':
          newStatus = 'COMPLETED';
          break;
        case 'drop':
          newStatus = 'DROPPED';
          break;
        default:
          newStatus = selectedEnrollment.status;
      }

      await updateEnrollment({
        variables: {
          id: selectedEnrollment.id,
          input: {
            status: newStatus
          }
        }
      });

      await refetchEnrollments();
      setShowEnrollmentModal(false);
      setSelectedEnrollment(null);
      setEnrollmentAction('');
    } catch (error) {
      console.error('Error updating enrollment:', error);
    } finally {
      setLoading(false);
    }
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

  const getEnrollmentStatusColor = (status) => {
    switch (status) {
      case 'APPLIED': return 'bg-yellow-100 text-yellow-800';
      case 'ENROLLED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'DROPPED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateBatchStats = (enrollments) => {
    if (!enrollments) return {
      total: 0,
      enrolled: 0,
      completed: 0,
      dropped: 0,
      applied: 0
    };

    return enrollments.reduce((stats, enrollment) => {
      stats.total++;
      switch (enrollment.status) {
        case 'APPLIED':
          stats.applied++;
          break;
        case 'ENROLLED':
          stats.enrolled++;
          break;
        case 'COMPLETED':
          stats.completed++;
          break;
        case 'DROPPED':
          stats.dropped++;
          break;
      }
      return stats;
    }, { total: 0, enrolled: 0, completed: 0, dropped: 0, applied: 0 });
  };

  const calculateAttendanceStats = (attendances) => {
    if (!attendances) return {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      attendanceRate: 0
    };

    const stats = attendances.reduce((acc, attendance) => {
      acc.total++;
      switch (attendance.status) {
        case 'PRESENT':
          acc.present++;
          break;
        case 'ABSENT':
          acc.absent++;
          break;
        case 'LATE':
          acc.late++;
          break;
      }
      return acc;
    }, { total: 0, present: 0, absent: 0, late: 0 });

    stats.attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    return stats;
  };

  // Attendance Functions
  const handleFetchAttendance = async (batchId, date) => {
    setIsFetchingAttendance(true);
    try {
      // Use the batchAttendanceData from the GraphQL query
      let filteredAttendance = batchAttendanceData?.attendances || [];
      
      // Only filter by date if a specific date is selected (not the default current date)
      if (date && date !== new Date().toISOString().split('T')[0]) {
        filteredAttendance = filteredAttendance.filter(attendance => {
          const attendanceDate = new Date(attendance.attendanceDate).toISOString().split('T')[0];
          return attendanceDate === date;
        });
      }
      
      setAttendanceData(filteredAttendance);
    } catch (err) {
      console.error('Error fetching attendance:', err);
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
          status: status,
          attendanceDate: selectedDate
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

  if (meLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-center text-gray-600 mt-4">Loading batches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Batches</h2>
          <p className="text-gray-600">Manage your batches and student enrollments</p>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredBatches.length} of {tutorBatches.length} batches
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search batches or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch, index) => {
          const stats = calculateBatchStats(batch.enrollments);
          
          return (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleViewBatch(batch)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{batch.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{batch.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-indigo-600" />
                          <span>{batch.level} • {batch.language}</span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {batch.totalCourses} course{batch.totalCourses > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {batch.startDate && (
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span>Starts: {new Date(batch.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {batch.endDate && (
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span>Ends: {new Date(batch.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Users2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-600">
                          {stats.enrolled}/{batch.maxStudents} enrolled
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 bg-indigo-100 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                {/* Batch Statistics */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{stats.enrolled}</div>
                      <div className="text-xs text-gray-500">Enrolled</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{stats.completed}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <span>Capacity: {stats.enrolled}/{batch.maxStudents}</span>
                    <span>Fee: ${batch.feeAmount}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(batch.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBatch(batch);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View Batch Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredBatches.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batches Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search criteria or filters.' 
              : 'You are not currently assigned to any batches. Contact your administrator to be assigned to batches.'}
          </p>
        </div>
      )}

      {/* Batch Details Modal */}
      {showBatchDetails && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBatch.name}</h3>
                  <p className="text-gray-600">{selectedBatch.level} • {selectedBatch.language}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBatch.status)}`}>
                      {selectedBatch.status}
                    </span>
                    <span className="text-xs text-gray-500">• {selectedBatch.totalCourses} course{selectedBatch.totalCourses > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBatchDetails(false);
                  setSelectedBatch(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Batch Information */}
              <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Batch Information</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Batch ID:</span>
                    <span className="font-mono text-xs">{selectedBatch.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span>{selectedBatch.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span>{selectedBatch.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Students:</span>
                    <span>{selectedBatch.maxStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee Amount:</span>
                    <span>${selectedBatch.feeAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBatch.status)}`}>
                      {selectedBatch.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Schedule</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{selectedBatch.startDate ? new Date(selectedBatch.startDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span>{selectedBatch.endDate ? new Date(selectedBatch.endDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(selectedBatch.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date(selectedBatch.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white p-2 rounded">
                      <div className="font-bold text-green-600">{calculateBatchStats(enrollmentData?.enrollments).enrolled}</div>
                      <div className="text-xs text-gray-500">Enrolled</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-bold text-blue-600">{calculateBatchStats(enrollmentData?.enrollments).completed}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-bold text-yellow-600">{calculateBatchStats(enrollmentData?.enrollments).applied}</div>
                      <div className="text-xs text-gray-500">Applied</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-bold text-red-600">{calculateBatchStats(enrollmentData?.enrollments).dropped}</div>
                      <div className="text-xs text-gray-500">Dropped</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Total Capacity: {calculateBatchStats(enrollmentData?.enrollments).enrolled}/{selectedBatch.maxStudents}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedBatch.description && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                <p className="text-gray-700">{selectedBatch.description}</p>
              </div>
            )}

            {/* Students Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Students ({calculateBatchStats(enrollmentData?.enrollments).total})</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => refetchEnrollments()}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              
              {enrollmentLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : enrollmentData?.enrollments && enrollmentData.enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrollmentData.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900">
                              {enrollment.profile.user.firstName} {enrollment.profile.user.lastName}
                            </h6>
                            <p className="text-xs text-gray-500">{enrollment.profile.user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnrollmentStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Enrollment Date:</span>
                          <span>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                        </div>
                        {enrollment.completionDate && (
                          <div className="flex justify-between">
                            <span>Completion Date:</span>
                            <span>{new Date(enrollment.completionDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Proficiency:</span>
                          <span>{enrollment.profile.proficiency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Native Language:</span>
                          <span>{enrollment.profile.nativeLanguage}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          {enrollment.status === 'APPLIED' && (
                            <>
                              <button
                                onClick={() => handleEnrollmentAction(enrollment, 'enroll')}
                                className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                              >
                                <Check className="w-3 h-3" />
                                <span>Enroll</span>
                              </button>
                              <button
                                onClick={() => handleEnrollmentAction(enrollment, 'drop')}
                                className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                              >
                                <XIcon className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {enrollment.status === 'ENROLLED' && (
                            <button
                              onClick={() => handleEnrollmentAction(enrollment, 'complete')}
                              className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                          )}
                          {enrollment.status === 'ENROLLED' && (
                            <button
                              onClick={() => handleEnrollmentAction(enrollment, 'drop')}
                              className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                            >
                              <UserMinus className="w-3 h-3" />
                              <span>Drop</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  No students enrolled in this batch yet.
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowBatchDetails(false);
                  setSelectedBatch(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedBatchForAttendance(selectedBatch);
                  setShowAttendanceModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <CalendarLucide className="w-4 h-4" />
                <span>Attendance</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    const result = await getMeetingLink({
                      variables: { batchId: selectedBatch.id }
                    });
                    
                    if (result.data?.getBatchMeetingLink) {
                      const { meetingLink, remainingTimeMinutes, attendance } = result.data.getBatchMeetingLink;
                      
                      if (meetingLink) {
                        // Open meeting link in new tab
                        window.open(meetingLink, '_blank', 'noopener,noreferrer');
                      } else {
                        // Show meeting link info in an alert if no link
                        alert(`Remaining Time: ${remainingTimeMinutes}\nAttendance Status: ${attendance?.status || 'Not recorded'}`);
                      }
                    }
                  } catch (error) {
                    console.error('Error getting meeting link:', error);
                    alert('Failed to get meeting link. Please try again.');
                  }
                }}
                disabled={meetingLinkLoading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {meetingLinkLoading ? 'Getting Link...' : 'Get Meeting Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Action Modal */}
      {showEnrollmentModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedEnrollment.profile.user.firstName} {selectedEnrollment.profile.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedEnrollment.profile.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEnrollmentModal(false);
                  setSelectedEnrollment(null);
                  setEnrollmentAction('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEnrollmentStatusColor(selectedEnrollment.status)}`}>
                {selectedEnrollment.status}
              </span>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Action</h4>
              <div className="space-y-2">
                {enrollmentAction === 'enroll' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Enroll Student</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      This will change the student's status from "Applied" to "Enrolled".
                    </p>
                  </div>
                )}
                {enrollmentAction === 'complete' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Mark as Completed</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      This will change the student's status from "Enrolled" to "Completed".
                    </p>
                  </div>
                )}
                {enrollmentAction === 'drop' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-red-800">
                      <XIcon className="w-4 h-4" />
                      <span className="font-medium">Drop Student</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      This will change the student's status to "Dropped".
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEnrollmentModal(false);
                  setSelectedEnrollment(null);
                  setEnrollmentAction('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnrollmentAction}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
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
          isMarking={isMarkingAttendance}
          onOpen={() => handleFetchAttendance(selectedBatchForAttendance.id, selectedDate)}
        />
      )}
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
  isFetching,
  isMarking,
  onOpen
}) => {
  useEffect(() => {
    if (isOpen && onOpen) {
      onOpen();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarLucide className="w-8 h-8 text-blue-600" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isFetching ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Loading attendance data...
                    </td>
                  </tr>
                ) : attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No students enrolled in this batch for the selected date.
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attendance.user?.firstName} {attendance.user?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{attendance.user?.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{attendance.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          attendance.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                          attendance.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                          attendance.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {attendance.status || 'NOT_MARKED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onMarkPresent(attendance.id)}
                            disabled={isMarking}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              attendance.status === 'PRESENT' 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } ${isMarking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => onMarkAbsent(attendance.id)}
                            disabled={isMarking}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              attendance.status === 'ABSENT' 
                                ? 'bg-red-200 text-red-800' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            } ${isMarking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => onMarkLate(attendance.id)}
                            disabled={isMarking}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              attendance.status === 'LATE' 
                                ? 'bg-yellow-200 text-yellow-800' 
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            } ${isMarking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            Late
                          </button>
                        </div>
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

export default TutorBatches;
