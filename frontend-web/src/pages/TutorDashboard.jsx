import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle,
  Bell,
  User,
  UserCog,
  Trash2,
  X
} from 'lucide-react';
import { DELETE_ME_MUTATION } from '../graphql/auth';
import { ME_QUERY } from '../graphql/instructor';
import { GET_TUTOR_BATCHES } from '../graphql/tutorBatch';
import { GET_NOTIFICATIONS } from '../graphql/notification';
import UpdateProfilePopup from '../components/UpdateProfilePopup';
import NotificationBell from '../components/NotificationBell';
import TutorCourses from '../components/TutorCourses';
import TutorBatches from '../components/TutorBatches';
import useAuthStore from '../store/authStore';
import useTutorStore from '../store/tutorStore';
import useSessionStore from '../store/sessionStore';

const TutorDashboard = () => {
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { user: storedUser, logout } = useAuthStore();
  const { setProfile } = useTutorStore();
  const { setSessions } = useSessionStore();
  const navigate = useNavigate();

  const [deleteMe] = useMutation(DELETE_ME_MUTATION);
  const { data: profileData, loading: profileLoading, error: profileError } = useQuery(ME_QUERY);
  const { data: batchData, loading: batchLoading, error: batchError } = useQuery(GET_TUTOR_BATCHES);
  const { data: notificationsData, loading: notificationsLoading } = useQuery(GET_NOTIFICATIONS, {
    skip: !storedUser?.id,
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000,
  });

  const loading = profileLoading || batchLoading;
  const error = profileError || batchError;
  const user = profileData?.me;
  const [activeTab, setActiveTab] = useState('overview');
  const tutorNotifications = notificationsData?.myNotifications || [];
  const unreadNotificationsCount = tutorNotifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user, setProfile]);

  const handleDeleteProfile = async () => {
    try {
      setDeleting(true);
      await deleteMe();
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error deleting profile:', err);
      setDeleting(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated and has tutor role using store
    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (storedUser.role !== 'TUTOR') {
      // Redirect to appropriate dashboard based on role
      switch (storedUser.role) {
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'STUDENT':
          navigate('/student/dashboard', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    }
  }, [storedUser, navigate]);

  const formatDayOfWeek = (day) => {
    const dayMap = {
      MONDAY: 'Monday',
      TUESDAY: 'Tuesday',
      WEDNESDAY: 'Wednesday',
      THURSDAY: 'Thursday',
      FRIDAY: 'Friday',
      SATURDAY: 'Saturday',
      SUNDAY: 'Sunday'
    };

    return dayMap[day] || day || 'N/A';
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours = '0', minutes = '00'] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const tutorBatchCourses = React.useMemo(() => {
    const batchInstructors = user?.batchInstructors || [];

    return batchInstructors
      .filter((instructor) => instructor.role === 'MAIN' || instructor.role === 'ASSISTANT')
      .map((instructor) => instructor.batchCourse)
      .filter(Boolean);
  }, [user]);

  const tutorBatches = React.useMemo(() => {
    const batchMap = new Map();
    const enrollmentBatchMap = new Map();

    (batchData?.me?.batchInstructors || []).forEach((instructor) => {
      const backendBatch = instructor.batchCourse?.batch;
      if (backendBatch?.id) {
        enrollmentBatchMap.set(backendBatch.id, backendBatch);
      }
    });

    tutorBatchCourses.forEach((batchCourse) => {
      const batch = batchCourse.batch;
      if (!batch?.id) return;

      const backendBatch = enrollmentBatchMap.get(batch.id);

      if (!batchMap.has(batch.id)) {
        batchMap.set(batch.id, {
          ...(backendBatch || batch),
          enrollments: backendBatch?.enrollments || [],
          batchCourses: [batchCourse]
        });
      } else {
        const existingBatch = batchMap.get(batch.id);
        existingBatch.batchCourses.push(batchCourse);
        existingBatch.enrollments = backendBatch?.enrollments || existingBatch.enrollments || [];
      }
    });

    return Array.from(batchMap.values());
  }, [tutorBatchCourses, batchData]);

  useEffect(() => {
    if (tutorBatches.length > 0) {
      setSessions(tutorBatches);
    }
  }, [tutorBatches, setSessions]);

  const assignedStudents = React.useMemo(() => {
    const studentMap = new Map();

    tutorBatches.forEach((batch) => {
      (batch.enrollments || []).forEach((enrollment) => {
        const currentUser = enrollment.profile?.user;
        if (currentUser?.id && !studentMap.has(currentUser.id)) {
          studentMap.set(currentUser.id, {
            id: currentUser.id,
            name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
            email: currentUser.email,
            status: enrollment.status,
            batchName: batch.name,
            updatedAt: enrollment.updatedAt || enrollment.createdAt
          });
        }
      });
    });

    return Array.from(studentMap.values());
  }, [tutorBatches]);

  const activeBatchesCount = React.useMemo(
    () => tutorBatches.filter((batch) => batch.status === 'ACTIVE').length,
    [tutorBatches]
  );

  const totalScheduledSessions = React.useMemo(
    () => tutorBatchCourses.reduce((total, batchCourse) => total + (batchCourse.schedules?.length || 0), 0),
    [tutorBatchCourses]
  );

  const upcomingSchedules = React.useMemo(() => {
    const dayOrder = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 7
    };

    return tutorBatchCourses
      .flatMap((batchCourse) =>
        (batchCourse.schedules || []).map((courseSchedule) => ({
          id: courseSchedule.id,
          courseName: batchCourse.course?.name || 'Course',
          batchName: batchCourse.batch?.name || 'Batch',
          dayOfWeek: courseSchedule.schedule?.dayOfWeek,
          startTime: courseSchedule.schedule?.startTime,
          endTime: courseSchedule.schedule?.endTime,
          createdAt: courseSchedule.createdAt
        }))
      )
      .sort((a, b) => {
        const dayDiff = (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99);
        if (dayDiff !== 0) return dayDiff;
        return (a.startTime || '').localeCompare(b.startTime || '');
      })
      .slice(0, 4);
  }, [tutorBatchCourses]);

  const recentActivities = React.useMemo(() => {
    const enrollmentActivities = tutorBatches.flatMap((batch) =>
      (batch.enrollments || []).map((enrollment) => {
        const studentName = `${enrollment.profile?.user?.firstName || ''} ${enrollment.profile?.user?.lastName || ''}`.trim() || 'A student';
        const statusLabel = (enrollment.status || 'UPDATED').toLowerCase();

        return {
          id: `enrollment-${enrollment.id}`,
          title: `${studentName} ${statusLabel} in ${batch.name}`,
          subtitle: `Enrollment status: ${enrollment.status || 'UNKNOWN'}`,
          createdAt: enrollment.updatedAt || enrollment.createdAt,
          tone: enrollment.status === 'COMPLETED' || enrollment.status === 'ENROLLED' ? 'success' : 'warning'
        };
      })
    );

    const scheduleActivities = tutorBatchCourses.flatMap((batchCourse) =>
      (batchCourse.schedules || []).map((courseSchedule) => ({
        id: `schedule-${courseSchedule.id}`,
        title: `${batchCourse.course?.name || 'Course'} scheduled for ${formatDayOfWeek(courseSchedule.schedule?.dayOfWeek)}`,
        subtitle: `${batchCourse.batch?.name || 'Batch'} • ${formatTime(courseSchedule.schedule?.startTime)} - ${formatTime(courseSchedule.schedule?.endTime)}`,
        createdAt: courseSchedule.createdAt,
        tone: 'info'
      }))
    );

    return [...enrollmentActivities, ...scheduleActivities]
      .filter((item) => item.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [tutorBatches, tutorBatchCourses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050B14] via-[#080C14] to-[#0D1B2A] flex items-center justify-center px-4">
        <div className="glass-premium rounded-3xl border border-white/10 p-10 shadow-2xl bg-white/5 text-center">
          <div className="w-12 h-12 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-accent-secondary font-bold uppercase tracking-widest text-xs">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050B14] via-[#080C14] to-[#0D1B2A] flex items-center justify-center px-4">
        <div className="glass-premium rounded-3xl border border-white/10 p-10 shadow-2xl bg-white/5 text-center max-w-lg w-full">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Error Loading Dashboard</h2>
          <p className="text-accent-secondary mb-6">Please try again or contact support.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-brand-yellow text-black px-5 py-3 rounded-2xl font-black hover:scale-105 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050B14] via-[#080C14] to-[#0D1B2A] text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -mr-96 -mt-96 mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-indigo/10 rounded-full blur-[150px] -ml-96 -mb-96 mix-blend-screen opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-white/5 rounded-[100%] blur-[120px] rotate-45 opacity-20"></div>
      </div>

      <header className="border-b border-white/10 bg-[#080C14]/80 backdrop-blur-xl shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="glass-premium rounded-3xl border border-white/10 p-5 bg-white/5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 border border-brand-yellow/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,193,7,0.15)]">
                  <GraduationCap className="w-7 h-7 text-brand-yellow" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter">Tutor Dashboard</h1>
                  <p className="text-sm text-accent-secondary">Welcome back, {user?.firstName}! Manage your classes with the same premium view.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <NotificationBell userId={user?.id} />
                <span className="px-4 py-2 bg-green-500/10 text-green-300 text-sm font-black rounded-2xl border border-green-500/20 uppercase tracking-wider">
                  Tutor
                </span>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/login', { replace: true });
                  }}
                  className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="glass-premium rounded-[2rem] border border-white/10 shadow-2xl bg-white/5 overflow-hidden">
          <div className="border-b border-white/10 px-4 md:px-6 py-4 bg-gradient-to-r from-white/5 to-transparent">
            <nav className="flex flex-wrap gap-3">
              {[
                { id: 'overview', name: 'Overview', icon: GraduationCap },
                { id: 'courses', name: 'Courses', icon: BookOpen },
                { id: 'batches', name: 'Batches', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-yellow text-black shadow-[0_0_20px_rgba(255,193,7,0.25)]'
                      : 'bg-white/5 text-accent-muted hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            {activeTab === 'courses' && <TutorCourses />}

            {activeTab === 'batches' && <TutorBatches />}

            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/60 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand-yellow/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-center justify-center">
                        <User className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-accent-secondary">{user?.email}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-accent-muted">
                          <span className="px-3 py-1 bg-green-500/10 text-green-300 rounded-full text-xs font-bold border border-green-500/20">
                            Tutor
                          </span>
                          <span>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setShowUpdatePopup(true)}
                        className="flex items-center space-x-2 px-5 py-3 bg-green-500/10 text-green-300 rounded-2xl border border-green-500/20 hover:bg-green-500/20 transition-all font-bold"
                      >
                        <UserCog className="w-4 h-4" />
                        <span>Update Profile</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowDeleteConfirmation(true);
                        }}
                        className="flex items-center space-x-2 px-5 py-3 bg-red-500/10 text-red-300 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all font-bold"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Profile</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[
                    {
                      label: 'Assigned Students',
                      value: assignedStudents.length,
                      icon: Users,
                      accent: 'text-blue-400',
                      glow: 'bg-blue-500/10 border-blue-500/20'
                    },
                    {
                      label: 'Active Batches',
                      value: activeBatchesCount,
                      icon: Clock,
                      accent: 'text-green-400',
                      glow: 'bg-green-500/10 border-green-500/20'
                    },
                    {
                      label: 'Assigned Courses',
                      value: tutorBatchCourses.length,
                      icon: BookOpen,
                      accent: 'text-brand-yellow',
                      glow: 'bg-brand-yellow/10 border-brand-yellow/20'
                    },
                    {
                      label: 'Scheduled Sessions',
                      value: totalScheduledSessions,
                      icon: Calendar,
                      accent: 'text-purple-400',
                      glow: 'bg-purple-500/10 border-purple-500/20'
                    }
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="glass-premium rounded-3xl border border-white/10 p-6 shadow-xl bg-white/5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">{item.label}</p>
                            <p className="text-3xl font-black text-white mt-3 tracking-tight">{item.value}</p>
                          </div>
                          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.glow}`}>
                            <Icon className={`w-6 h-6 ${item.accent}`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="glass-premium rounded-3xl border border-white/10 shadow-2xl bg-white/5 overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                      <h3 className="text-xl font-bold text-white">Recent Backend Activity</h3>
                      <p className="text-sm text-accent-secondary mt-1">Live updates pulled from your assigned batches and enrollments</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {recentActivities.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
                          <p className="text-accent-secondary">No recent backend activity is available yet.</p>
                        </div>
                      ) : (
                        recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 bg-white/5 rounded-2xl p-4 border border-white/10">
                            <div>
                              {activity.tone === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white">{activity.title}</p>
                              <p className="text-sm text-accent-secondary">{activity.subtitle}</p>
                              <p className="text-xs text-accent-muted mt-1">
                                {new Date(activity.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="glass-premium rounded-3xl border border-white/10 shadow-2xl bg-white/5 overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                      <h3 className="text-xl font-bold text-white">Teaching Schedule</h3>
                      <p className="text-sm text-accent-secondary mt-1">Upcoming class schedule from your assigned backend courses</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {upcomingSchedules.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
                          <p className="text-accent-secondary">No schedule has been assigned yet.</p>
                        </div>
                      ) : (
                        upcomingSchedules.map((schedule) => (
                          <div key={schedule.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-bold text-white">{schedule.courseName}</p>
                                <p className="text-sm text-accent-secondary">{schedule.batchName}</p>
                              </div>
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20">
                                {formatDayOfWeek(schedule.dayOfWeek)}
                              </span>
                            </div>
                            <p className="text-sm text-accent-muted mt-3">
                              {formatTime(schedule.startTime)} — {formatTime(schedule.endTime)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="glass-premium rounded-3xl border border-white/10 shadow-2xl bg-white/5 overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">Notification Center</h3>
                          <p className="text-sm text-accent-secondary mt-1">Live tutor alerts from the backend notification system</p>
                        </div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-brand-yellow border border-primary/20">
                          <Bell className="w-3.5 h-3.5" />
                          {unreadNotificationsCount} unread
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {notificationsLoading ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
                          <p className="text-accent-secondary">Loading notifications...</p>
                        </div>
                      ) : tutorNotifications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
                          <p className="text-accent-secondary">No tutor notifications available yet.</p>
                        </div>
                      ) : (
                        tutorNotifications.slice(0, 4).map((notification) => (
                          <div
                            key={notification.id}
                            className={`rounded-2xl p-4 border ${notification.isRead ? 'bg-white/5 border-white/10' : 'bg-primary/5 border-primary/20'}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-bold text-white">{notification.title}</p>
                                <p className="text-sm text-accent-secondary mt-1 line-clamp-2">{notification.content}</p>
                              </div>
                              {!notification.isRead && <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow mt-1"></span>}
                            </div>
                            <p className="text-xs text-accent-muted mt-3">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Profile Popup */}
      <UpdateProfilePopup
        isOpen={showUpdatePopup}
        onClose={() => setShowUpdatePopup(false)}
        user={user}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="glass-premium rounded-[2.5rem] p-6 w-full max-w-md mx-4 border border-white/10 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/90">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Delete Profile</h3>
                  <p className="text-sm text-accent-secondary">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="p-2 rounded-xl text-accent-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-accent-secondary mb-6">
              Are you sure you want to delete your profile? This will permanently remove your account and all associated data.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 px-4 py-3 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500/90 text-white rounded-2xl hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all"
              >
                {deleting ? 'Deleting...' : 'Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
