import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  BookOpen, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  User,
  UserCog,
  Trash2,
  X
} from 'lucide-react';
import { GET_CURRENT_USER, UPDATE_ME_MUTATION, DELETE_ME_MUTATION } from '../graphql/auth';
import UpdateProfilePopup from '../components/UpdateProfilePopup';
import NotificationBell from '../components/NotificationBell';
import TutorCourses from '../components/TutorCourses';
import TutorBatches from '../components/TutorBatches';

const TutorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [deleteMe] = useMutation(DELETE_ME_MUTATION);

  const { data, loading, error } = useQuery(GET_CURRENT_USER);

  const user = data?.me;

  const handleDeleteProfile = async () => {
    try {
      setDeleting(true);
      await deleteMe();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      console.error('Error deleting profile:', err);
      setDeleting(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated and has tutor role
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      window.location.href = '/login';
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'TUTOR') {
        // Redirect to appropriate dashboard based on role
        switch (userData.role) {
          case 'ADMIN':
            window.location.href = '/admin/dashboard';
            break;
          case 'STUDENT':
            window.location.href = '/student/dashboard';
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

  const mockStudents = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      level: 'Beginner',
      progress: 65,
      lastActive: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      level: 'Intermediate',
      progress: 82,
      lastActive: '1 day ago',
      status: 'active'
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      level: 'Advanced',
      progress: 45,
      lastActive: '3 days ago',
      status: 'inactive'
    }
  ];

  const mockSchedule = [
    {
      id: '1',
      title: 'Conversation Practice',
      date: '2024-01-15',
      time: '10:00 AM',
      students: 3,
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Grammar Workshop',
      date: '2024-01-16',
      time: '2:00 PM',
      students: 5,
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Vocabulary Review',
      date: '2024-01-14',
      time: '4:00 PM',
      students: 2,
      status: 'completed'
    }
  ];

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
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
              <GraduationCap className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tutor Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell userId={user?.id} />
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Tutor
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
                { id: 'overview', name: 'Overview', icon: GraduationCap },
                { id: 'courses', name: 'Courses', icon: BookOpen },
                { id: 'batches', name: 'Batches', icon: Users }
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
            {activeTab === 'courses' && (
              <TutorCourses />
            )}

            {activeTab === 'batches' && (
              <TutorBatches />
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-gray-600">{user?.email}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Tutor
                          </span>
                          <span>Member since: {new Date(user?.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setShowUpdatePopup(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        <UserCog className="w-4 h-4" />
                        <span>Update Profile</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowDeleteConfirmation(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Profile</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Students</p>
                        <p className="text-2xl font-bold">15</p>
                      </div>
                      <Users className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Active Sessions</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <Clock className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">This Week</p>
                        <p className="text-2xl font-bold">12h</p>
                      </div>
                      <Calendar className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Jane Smith completed Conversation Practice</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Bob Johnson missed Vocabulary Review</p>
                        <p className="text-sm text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">New student enrolled: Alice Brown</p>
                        <p className="text-sm text-gray-500">2 days ago</p>
                      </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Profile</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your profile? This will permanently remove your account and all associated data.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
