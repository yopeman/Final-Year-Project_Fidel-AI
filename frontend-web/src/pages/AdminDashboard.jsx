import React, { useState, useEffect } from 'react';
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
  CreditCard
} from 'lucide-react';
import { GET_CURRENT_USER, GET_USERS, UPDATE_USER_MUTATION, DELETE_USER_MUTATION, UPDATE_ME_MUTATION, DELETE_ME_MUTATION } from '../graphql/auth';
import { GET_BATCHES } from '../graphql/batch';
import UpdateProfilePopup from '../components/UpdateProfilePopup';
import EditUserPopup from '../components/EditUserPopup';
import AdminOverview from '../components/AdminOverview';
import AdminUsers from '../components/AdminUsers';
import AdminCourses from '../components/AdminCourses';
import AdminSchedules from '../components/AdminSchedules';
import AdminBatches from '../components/AdminBatches';
import AdminPayments from '../components/AdminPayments';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showEditUserPopup, setShowEditUserPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER);
  const { data: usersData, loading: usersLoading, error: usersError, refetch } = useQuery(GET_USERS, {
    variables: { pagination: { page: 1, limit: 100 } }
  });
  const { data: batchesData } = useQuery(GET_BATCHES);

  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [updateMe] = useMutation(UPDATE_ME_MUTATION);
  const [deleteUser] = useMutation(DELETE_USER_MUTATION);

  const user = userData?.me;
  const users = usersData?.users || [];

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      window.location.href = '/login';
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'ADMIN') {
        // Redirect to appropriate dashboard based on role
        switch (userData.role) {
          case 'TUTOR':
            window.location.href = '/tutor/dashboard';
            break;
          default:
            window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      console.error('Error parsing user:', err);
      localStorage.clear();
      window.location.href = '/login';
    }
  }, []);

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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
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


  const batches = batchesData?.batches || [];
  
  const stats = {
    totalUsers: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    tutors: users.filter(u => u.role === 'TUTOR').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    verified: users.filter(u => u.isVerified).length,
    unverified: users.filter(u => !u.isVerified).length,
    totalBatches: batches.length,
    activeBatches: batches.filter(b => b.status === 'ACTIVE').length,
    upcomingBatches: batches.filter(b => b.status === 'UPCOMING').length,
    completedBatches: batches.filter(b => b.status === 'COMPLETED').length,
    totalEnrollments: batches.reduce((total, batch) => total + (batch.enrollments?.length || 0), 0),
    totalCourses: batches.reduce((total, batch) => total + (batch.batchCourses?.length || 0), 0)
  };

  if (userLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (userError || usersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">Please try again or contact support.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Administrator
              </span>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[ 
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'users', name: 'Users', icon: Users }, 
                { id: 'courses', name: 'Courses', icon: BookOpen },
                { id: 'schedules', name: 'Schedules', icon: Calendar },
                { id: 'batches', name: 'Batches', icon: GraduationCap },
                { id: 'payments', name: 'Payments', icon: CreditCard }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                user={user}
                stats={stats}
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
