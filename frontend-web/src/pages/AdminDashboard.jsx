import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  Shield, 
  Calendar, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  BarChart3,
  User,
  UserCog,
  Trash2,
  AlertCircle,
  X,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { GET_CURRENT_USER, GET_USERS, UPDATE_USER_MUTATION, DELETE_USER_MUTATION, UPDATE_ME_MUTATION, DELETE_ME_MUTATION } from '../graphql/auth';
import { GET_BATCHES } from '../graphql/batch';
import NotificationBell from '../components/NotificationBell';
import UpdateProfilePopup from '../components/UpdateProfilePopup';
import EditUserPopup from '../components/EditUserPopup';
import AdminOverview from '../components/AdminOverview';
import AdminUsers from '../components/AdminUsers';
import AdminCourses from '../components/AdminCourses';
import AdminSchedules from '../components/AdminSchedules';
import AdminBatches from '../components/AdminBatches';
import AdminPayments from '../components/AdminPayments';
import AdminFeedback from '../components/AdminFeedback';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useBatchStore from '../store/batchStore';
import useContentStore from '../store/contentStore';
import useFinanceStore from '../store/financeStore';
import useSystemStore from '../store/systemStore';

const AdminDashboard = () => {
  const { activeTab, setActiveTab } = useSystemStore();
  const { users, setUsers, getFilteredUsers } = useUserStore();
  const { batches, setBatches } = useBatchStore();
  
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showEditUserPopup, setShowEditUserPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const { user: storedUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER);
  const { data: usersData, loading: usersLoading, error: usersError, refetch } = useQuery(GET_USERS, {
    variables: { pagination: { page: 1, limit: 100 } }
  });
  const { data: batchesData } = useQuery(GET_BATCHES);

  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [updateMe] = useMutation(UPDATE_ME_MUTATION);
  const [deleteUser] = useMutation(DELETE_USER_MUTATION);

  const user = userData?.me;

  useEffect(() => {
    if (usersData?.users) {
      setUsers(usersData.users);
    }
  }, [usersData, setUsers]);

  useEffect(() => {
    if (batchesData?.batches) {
      setBatches(batchesData.batches);
    }
  }, [batchesData, setBatches]);

  useEffect(() => {
    // Check if user is authenticated and has admin role using store
    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (storedUser.role !== 'ADMIN') {
      // Redirect to appropriate dashboard based on role
      switch (storedUser.role) {
        case 'TUTOR':
          navigate('/tutor/dashboard', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    }
  }, [storedUser, navigate]);

  const handleUserAction = async (userId, action) => {
    try {
      switch (action) {
        case 'approve':
          await updateUser({
            variables: {
              input: {
                id: userId,
                isVerified: true
              }
            }
          });
          break;
        case 'suspend':
          await updateUser({
            variables: {
              input: {
                id: userId,
                isVerified: false
              }
            }
          });
          break;
        case 'delete':
          await deleteUser({ variables: { id: userId } });
          break;
      }
      refetch();
    } catch (err) {
      console.error('Error performing action:', err);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      setDeleting(true);
      await deleteUser({ variables: { id: user.id } });
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error deleting profile:', err);
      setDeleting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setDeleting(true);
      await deleteUser({ variables: { id: userId } });
      
      // If admin is deleting their own account, logout
      if (userId === user.id) {
        logout();
        navigate('/login', { replace: true });
      } else {
        setShowDeleteConfirmation(false);
        setUserToDelete(null);
        refetch();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setDeleting(false);
    }
  };




  if (userLoading || usersLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-accent-secondary font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (userError || usersError) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="glass-premium p-8 rounded-2xl border border-red-500/20 text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Workspace Unavailable</h2>
          <p className="text-accent-secondary mb-6 text-sm">We're having trouble reaching the servers. Please try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/10"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-premium border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 yellow-glow">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white tracking-tight">Admin Portal</h1>
                <p className="text-xs text-accent-secondary">Fidel AI Control Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-6">
              <NotificationBell userId={user?.id} />
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
                  Admin Active
                </span>
              </div>
              <button 
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                }}
                className="text-accent-secondary hover:text-white transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs - Responsive Scrollable */}
        <div className="glass-premium rounded-2xl border border-white/5 shadow-2xl mb-8 overflow-hidden">
          <div className="border-b border-white/10 overflow-x-auto no-scrollbar">
            <nav className="flex space-x-1 px-4 py-2 min-w-max">
              {[ 
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'users', name: 'Users', icon: Users }, 
                { id: 'courses', name: 'Courses', icon: BookOpen },
                { id: 'schedules', name: 'Schedules', icon: Calendar },
                { id: 'batches', name: 'Batches', icon: GraduationCap },
                { id: 'payments', name: 'Payments', icon: CreditCard },
                { id: 'feedback', name: 'Feedback', icon: MessageSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-black shadow-lg shadow-primary/20'
                      : 'text-accent-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <AdminOverview 
                onAction={(action) => {
                  if (action === 'updateProfile') {
                    setShowUpdatePopup(true);
                  } else if (action === 'deleteProfile') {
                    setUserToDelete(user.id);
                    setShowDeleteConfirmation(true);
                  }
                }}
              />
            )}

            {activeTab === 'users' && (
              <AdminUsers 
                users={users}
                loading={usersLoading}
                onUserAction={handleUserAction}
                onEditUser={(user) => {
                  setSelectedUser(user);
                  if (user.id === userData?.me?.id) {
                    setShowUpdatePopup(true);
                  } else {
                    setShowEditUserPopup(true);
                  }
                }}
                onViewUser={(user) => {
                  setSelectedUser(user);
                  setShowUserDetails(true);
                }}
                onDeleteUser={(userId) => {
                  setUserToDelete(userId);
                  setShowDeleteConfirmation(true);
                }}
                selectedUser={selectedUser}
                showUserDetails={showUserDetails}
                setShowUserDetails={setShowUserDetails}
              />
            )}

            {activeTab === 'batches' && (
              <AdminBatches 
                onBatchAction={(action, batchId) => {
                  console.log(`Batch action: ${action} for batch ${batchId}`);
                  // Add batch action logic here
                }}
                onEditBatch={(batch) => {
                  console.log('Editing batch:', batch);
                  // Add edit batch logic here
                }}
                onViewBatch={(batch) => {
                  console.log('Viewing batch:', batch);
                  // Add view batch logic here
                }}
                onDeleteBatch={(batchId) => {
                  console.log('Deleting batch:', batchId);
                  // Add delete batch logic here
                }}
              />
            )}

            {activeTab === 'schedules' && (
              <AdminSchedules 
                onScheduleAction={(action, scheduleId) => {
                  console.log(`Schedule action: ${action} for schedule ${scheduleId}`);
                  // Add schedule action logic here
                }}
                onEditSchedule={(schedule) => {
                  console.log('Editing schedule:', schedule);
                  // Add edit schedule logic here
                }}
                onViewSchedule={(schedule) => {
                  console.log('Viewing schedule:', schedule);
                  // Add view schedule logic here
                }}
                onDeleteSchedule={(scheduleId) => {
                  console.log('Deleting schedule:', scheduleId);
                  // Add delete schedule logic here
                }}
              />
            )}


            {activeTab === 'courses' && (
              <AdminCourses 
                onCourseAction={(action, courseId) => {
                  console.log(`Course action: ${action} for course ${courseId}`);
                  // Add course action logic here
                }}
                onEditCourse={(course) => {
                  console.log('Editing course:', course);
                  // Add edit course logic here
                }}
                onViewCourse={(course) => {
                  console.log('Viewing course:', course);
                  // Add view course logic here
                }}
                onDeleteCourse={(courseId) => {
                  console.log('Deleting course:', courseId);
                  // Add delete course logic here
                }}
              />
            )}

            {activeTab === 'payments' && (
              <AdminPayments 
                onPaymentAction={(action, paymentId) => {
                  console.log(`Payment action: ${action} for payment ${paymentId}`);
                  // Add payment action logic here
                }}
                onEditPayment={(payment) => {
                  console.log('Editing payment:', payment);
                  // Add edit payment logic here
                }}
                onViewPayment={(payment) => {
                  console.log('Viewing payment:', payment);
                  // Add view payment logic here
                }}
                onDeletePayment={(paymentId) => {
                  console.log('Deleting payment:', paymentId);
                  // Add delete payment logic here
                }}
              />
            )}

            {activeTab === 'feedback' && (
              <AdminFeedback 
                onFeedbackAction={(action, feedbackId) => {
                  console.log(`Feedback action: ${action} for feedback ${feedbackId}`);
                  // Add feedback action logic here
                }}
                onEditFeedback={(feedback) => {
                  console.log('Editing feedback:', feedback);
                  // Add edit feedback logic here
                }}
                onViewFeedback={(feedback) => {
                  console.log('Viewing feedback:', feedback);
                  // Add view feedback logic here
                }}
                onDeleteFeedback={(feedbackId) => {
                  console.log('Deleting feedback:', feedbackId);
                  // Add delete feedback logic here
                }}
              />
            )}

          </div>
        </div>
      </div>

      {/* Update Profile Popup */}
      <UpdateProfilePopup
        isOpen={showUpdatePopup}
        onClose={() => setShowUpdatePopup(false)}
        user={selectedUser || user}
        onUpdateUserMutation={selectedUser && selectedUser.id !== user.id ? UPDATE_USER_MUTATION : UPDATE_ME_MUTATION}
      />

      {/* Edit User Popup */}
      <EditUserPopup
        isOpen={showEditUserPopup}
        onClose={() => setShowEditUserPopup(false)}
        user={selectedUser}
        onUpdateSuccess={(updatedUser) => {
          // Handle successful update
          refetch();
          setSelectedUser(updatedUser);
        }}
      />

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : selectedUser.role === 'TUTOR'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <span className="font-mono text-xs">{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>First Name:</span>
                    <span>{selectedUser.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Name:</span>
                    <span>{selectedUser.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span>{selectedUser.role}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span>{selectedUser.isVerified ? 'Verified' : 'Unverified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joined:</span>
                    <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date(selectedUser.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                  if (selectedUser.id === userData?.me?.id) {
                    setShowUpdatePopup(true);
                  } else {
                    setShowEditUserPopup(true);
                  }
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Edit User
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
                  <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setUserToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this user? This will permanently remove their account and all associated data.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(userToDelete)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
