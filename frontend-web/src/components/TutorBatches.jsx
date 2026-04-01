import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Calendar as CalendarLucide,
  MessageCircle,
  MessageSquare,
  Send,
  ThumbsUp,
  Heart,
  Paperclip,
  File as FileIcon,
  Book,
  MessageSquare as MessageSquareIcon,
  Mic,
  Headphones
} from 'lucide-react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_TUTOR_BATCHES, GET_BATCH_ENROLLMENTS, GET_BATCH_ATTENDANCE, UPDATE_ENROLLMENT_STATUS, GET_BATCH_MEETING_LINK } from '../graphql/tutorBatch';
import SkillTestModal from './SkillTestModal';
import useBatchStore from '../store/batchStore';
import useSessionStore from '../store/sessionStore';
import usePerformanceStore from '../store/performanceStore';

const TutorBatches = () => {
  const navigate = useNavigate();
  const { filters, setFilters, setBatches } = useBatchStore();
  const { setSessions, setAttendance, markAttendance, attendance: storeAttendance } = useSessionStore();
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

  // Skill Test state
  const [showSkillTestModal, setShowSkillTestModal] = useState(false);


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
    const matchesSearch = batch.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      batch.description?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === 'all' || batch.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (tutorBatches.length > 0) {
      setBatches(tutorBatches);
      setSessions(tutorBatches);
    }
  }, [tutorBatches, setBatches, setSessions]);

  useEffect(() => {
    if (batchAttendanceData?.attendances) {
      setAttendance(selectedBatch?.id, batchAttendanceData.attendances);
    }
  }, [batchAttendanceData, selectedBatch, setAttendance]);

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
      case 'ACTIVE': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'UPCOMING': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'COMPLETED': return 'bg-white/10 text-accent-secondary border border-white/10';
      case 'CANCELLED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-white/10 text-accent-secondary border border-white/10';
    }
  };

  const getEnrollmentStatusColor = (status) => {
    switch (status) {
      case 'APPLIED': return 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20';
      case 'ENROLLED': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'DROPPED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-white/10 text-accent-secondary border border-white/10';
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
        // Use store action
        markAttendance(selectedBatch?.id, studentId, status);
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
      <div className="glass-premium rounded-3xl border border-white/10 p-10 shadow-2xl bg-white/5">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin"></div>
          <p className="text-accent-muted font-bold uppercase tracking-widest text-xs">Loading batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-brand-yellow/10 transition-all duration-1000"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <Users className="w-8 h-8 text-brand-yellow" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">My Batches</h2>
              <p className="text-accent-secondary mt-1 font-medium flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-yellow mr-2 animate-pulse"></span>
                Manage your batches, students, and attendance flow
              </p>
            </div>
          </div>
          <div className="text-sm font-black text-white uppercase tracking-[0.2em] bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
            {filteredBatches.length} / {tutorBatches.length} Showing
          </div>
        </div>
      </div>

      <div className="glass-premium rounded-3xl border border-white/10 p-6 shadow-xl bg-white/5 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2 group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-accent-muted w-5 h-5 group-focus-within:text-brand-yellow transition-colors" />
            <input
              type="text"
              placeholder="Search batches or descriptions..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-accent-muted focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
            <Filter className="w-5 h-5 text-accent-muted ml-2" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="w-full bg-transparent text-white font-bold px-4 py-2 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all" className="bg-[#080C14] text-white">All Status</option>
              <option value="ACTIVE" className="bg-[#080C14] text-white">Active</option>
              <option value="UPCOMING" className="bg-[#080C14] text-white">Upcoming</option>
              <option value="COMPLETED" className="bg-[#080C14] text-white">Completed</option>
              <option value="CANCELLED" className="bg-[#080C14] text-white">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch, index) => {
          const stats = calculateBatchStats(batch.enrollments);

          return (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group relative bg-[#080C14]/40 border border-white/10 rounded-[2rem] p-6 hover:border-brand-yellow/30 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer"
              onClick={() => handleViewBatch(batch)}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-yellow/5 group-hover:bg-brand-yellow transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className="text-lg font-black text-white tracking-tight">{batch.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </div>
                    <p className="text-sm text-accent-secondary mb-3 line-clamp-3">{batch.description}</p>

                    <div className="space-y-2 text-sm text-accent-secondary">
                      <div className="flex items-center space-x-3 flex-wrap">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-brand-yellow" />
                          <span>{batch.level} • {batch.language}</span>
                        </div>
                        <span className="px-2 py-1 bg-white/5 text-accent-muted rounded-full text-xs border border-white/10">
                          {batch.totalCourses} course{batch.totalCourses > 1 ? 's' : ''}
                        </span>
                      </div>

                      {batch.startDate && (
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-brand-yellow" />
                          <span>Starts: {new Date(batch.startDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {batch.endDate && (
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-brand-yellow" />
                          <span>Ends: {new Date(batch.endDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Users2 className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-accent-muted">
                          {stats.enrolled}/{batch.maxStudents} enrolled
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-yellow/10 group-hover:border-brand-yellow/30 transition-all">
                    <Users className="w-6 h-6 text-accent-muted group-hover:text-brand-yellow transition-colors" />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <div className="text-lg font-black text-green-400">{stats.enrolled}</div>
                      <div className="text-xs text-accent-muted">Enrolled</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <div className="text-lg font-black text-blue-400">{stats.completed}</div>
                      <div className="text-xs text-accent-muted">Completed</div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center text-xs text-accent-muted">
                    <span>Capacity: {stats.enrolled}/{batch.maxStudents}</span>
                    <span>Fee: ${batch.feeAmount}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                  <div className="text-xs text-accent-muted">
                    Updated: {new Date(batch.updatedAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewBatch(batch);
                    }}
                    className="p-2.5 bg-white/5 hover:bg-brand-yellow/20 text-accent-muted hover:text-brand-yellow rounded-xl transition-all border border-white/5"
                    title="View Batch Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredBatches.length === 0 && (
        <div className="glass-premium rounded-[2.5rem] border border-dashed border-white/20 p-12 text-center bg-white/5">
          <Users className="w-16 h-16 text-accent-muted/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Batches Found</h3>
          <p className="text-accent-secondary max-w-lg mx-auto">
            {filters.search || filters.status !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'You are not currently assigned to any batches. Contact your administrator to be assigned to batches.'}
          </p>
        </div>
      )}

      {/* Batch Details Modal */}
      {showBatchDetails && selectedBatch && (
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="glass-premium rounded-[2.5rem] p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(255,193,7,0.18)]">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedBatch.name}</h3>
                  <p className="text-accent-secondary">{selectedBatch.level} • {selectedBatch.language}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBatch.status)}`}>
                      {selectedBatch.status}
                    </span>
                    <span className="text-xs text-accent-muted">• {selectedBatch.totalCourses} course{selectedBatch.totalCourses > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
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
                  onClick={() => {
                    navigate(`/community/${selectedBatch.id}`);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Community</span>
                </button>
                <button
                  onClick={() => {
                    setShowSkillTestModal(true);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <Book className="w-4 h-4" />
                  <span>Skill Test</span>
                </button>
                <button
                  onClick={() => {
                    setShowBatchDetails(false);
                    setSelectedBatch(null);
                  }}
                  className="text-accent-muted hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Batch Information */}
              <div className="lg:col-span-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Batch Information</h4>
                <div className="space-y-3 text-sm text-accent-secondary">
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
              <div className="lg:col-span-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Schedule</h4>
                <div className="space-y-3 text-sm text-accent-secondary">
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
              <div className="lg:col-span-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Statistics</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <div className="font-bold text-green-400">{calculateBatchStats(enrollmentData?.enrollments).enrolled}</div>
                      <div className="text-xs text-accent-muted">Enrolled</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <div className="font-bold text-blue-400">{calculateBatchStats(enrollmentData?.enrollments).completed}</div>
                      <div className="text-xs text-accent-muted">Completed</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <div className="font-bold text-yellow-400">{calculateBatchStats(enrollmentData?.enrollments).applied}</div>
                      <div className="text-xs text-accent-muted">Applied</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <div className="font-bold text-red-400">{calculateBatchStats(enrollmentData?.enrollments).dropped}</div>
                      <div className="text-xs text-accent-muted">Dropped</div>
                    </div>
                  </div>
                  <div className="text-xs text-accent-muted text-center mt-2">
                    Total Capacity: {calculateBatchStats(enrollmentData?.enrollments).enrolled}/{selectedBatch.maxStudents}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedBatch.description && (
              <div className="mb-6">
                <h4 className="font-medium text-white mb-3">Description</h4>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-accent-secondary">{selectedBatch.description}</div>
              </div>
            )}

            {/* Students Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Students ({calculateBatchStats(enrollmentData?.enrollments).total})</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => refetchEnrollments()}
                    className="px-3 py-1 text-xs bg-white/5 text-accent-secondary border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
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
                    <div key={enrollment.id} className="bg-[#0B111B]/70 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-brand-indigo/10 rounded-full flex items-center justify-center border border-brand-indigo/20">
                            <User className="w-5 h-5 text-brand-indigo" />
                          </div>
                          <div>
                            <h6 className="font-medium text-white">
                              {enrollment.profile.user.firstName} {enrollment.profile.user.lastName}
                            </h6>
                            <p className="text-xs text-accent-muted">{enrollment.profile.user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnrollmentStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-accent-secondary">
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

                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex space-x-2">
                          {enrollment.status === 'APPLIED' && (
                            <>
                              <button
                                onClick={() => handleEnrollmentAction(enrollment, 'enroll')}
                                className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs rounded-lg hover:bg-green-500/20 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                <span>Enroll</span>
                              </button>
                              <button
                                onClick={() => handleEnrollmentAction(enrollment, 'drop')}
                                className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-lg hover:bg-red-500/20 transition-colors"
                              >
                                <XIcon className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {enrollment.status === 'ENROLLED' && (
                            <button
                              onClick={() => handleEnrollmentAction(enrollment, 'complete')}
                              className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-lg hover:bg-blue-500/20 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                          )}
                          {enrollment.status === 'ENROLLED' && (
                            <button
                              onClick={() => handleEnrollmentAction(enrollment, 'drop')}
                              className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-lg hover:bg-red-500/20 transition-colors"
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
                <div className="text-center py-8 text-accent-muted border-2 border-dashed border-white/15 rounded-2xl bg-white/5">
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
                className="flex-1 px-4 py-3 border border-white/10 text-accent-secondary rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                Close
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
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[160] p-4">
          <div className="glass-premium rounded-[2rem] p-6 w-full max-w-md mx-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/20">
                  <User className="w-6 h-6 text-brand-indigo" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedEnrollment.profile.user.firstName} {selectedEnrollment.profile.user.lastName}
                  </h3>
                  <p className="text-sm text-accent-secondary">{selectedEnrollment.profile.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEnrollmentModal(false);
                  setSelectedEnrollment(null);
                  setEnrollmentAction('');
                }}
                className="text-accent-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-white mb-2">Current Status</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEnrollmentStatusColor(selectedEnrollment.status)}`}>
                {selectedEnrollment.status}
              </span>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-white mb-3">Action</h4>
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

      {/* Skill Test Modal */}
      {showSkillTestModal && selectedBatch && (
        <SkillTestModal
          isOpen={showSkillTestModal}
          onClose={() => {
            setShowSkillTestModal(false);
          }}
          batch={selectedBatch}
          onOpen={() => {
            // Optional: any initialization logic when modal opens
          }}
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
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[170] p-4">
      <div className="glass-premium rounded-[2rem] p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-brand-indigo/10 rounded-2xl flex items-center justify-center border border-brand-indigo/20">
              <CalendarLucide className="w-8 h-8 text-brand-indigo" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">Attendance for {batch?.name}</h3>
              <p className="text-accent-secondary">Date: {new Date(selectedDate).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-accent-muted hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-accent-secondary mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-2 border border-white/10 bg-[#0B111B]/80 text-white rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
          />
        </div>

        {/* Attendance Table */}
        <div className="bg-[#0B111B]/70 rounded-2xl border border-white/10 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-accent-muted uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-accent-muted uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-accent-muted uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-accent-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/10">
                {isFetching ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-accent-muted">
                      Loading attendance data...
                    </td>
                  </tr>
                ) : attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-accent-muted">
                      No students enrolled in this batch for the selected date.
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {attendance.user?.firstName} {attendance.user?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-accent-secondary">{attendance.user?.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-accent-secondary">{attendance.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attendance.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                            attendance.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                              attendance.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {attendance.status || 'NOT_MARKED'}
                        </span>
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
