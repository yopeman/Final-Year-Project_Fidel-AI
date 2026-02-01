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
  Trash2
} from 'lucide-react';
import { GET_CURRENT_USER, GET_USERS, UPDATE_USER_MUTATION, DELETE_USER_MUTATION, UPDATE_ME_MUTATION, DELETE_ME_MUTATION } from '../graphql/auth';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER);
  const { data: usersData, loading: usersLoading, error: usersError, refetch } = useQuery(GET_USERS, {
    variables: { pagination: { page: 1, limit: 100 } }
  });

  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole.toLowerCase();
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'verified' && user.isVerified) ||
                         (filterStatus === 'unverified' && !user.isVerified);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    totalUsers: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    tutors: users.filter(u => u.role === 'TUTOR').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    verified: users.filter(u => u.isVerified).length,
    unverified: users.filter(u => !u.isVerified).length
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
                { id: 'pending', name: 'Pending', icon: Clock },
                { id: 'reports', name: 'Reports', icon: BookOpen }
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
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-gray-600">{user?.email}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            Administrator
                          </span>
                          <span>Member since: {new Date(user?.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
                        <UserCog className="w-4 h-4" />
                        <span>Update Profile</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Profile</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Users</p>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <Users className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Verified Users</p>
                        <p className="text-2xl font-bold">{stats.verified}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Pending Verification</p>
                        <p className="text-2xl font-bold">{stats.unverified}</p>
                      </div>
                      <Clock className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Students</span>
                        </div>
                        <span className="text-sm font-medium">{stats.students}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Tutors</span>
                        </div>
                        <span className="text-sm font-medium">{stats.tutors}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Admins</span>
                        </div>
                        <span className="text-sm font-medium">{stats.admins}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">System Health</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Good</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Database Status</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Backup</span>
                        <span className="text-sm text-gray-500">2 hours ago</span>
                      </div>
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
                        <p className="font-medium">New tutor approved: Dr. Sarah Johnson</p>
                        <p className="text-sm text-gray-500">30 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <UserPlus className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">New student registered: Michael Chen</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Suspicious activity detected on user account</p>
                        <p className="text-sm text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="tutor">Tutors</option>
                    <option value="admin">Admins</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Users ({filteredUsers.length})</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'ADMIN' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : user.role === 'TUTOR'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.isVerified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-1">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                              <span>Last updated: {new Date(user.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                            {!user.isVerified && (
                              <button 
                                onClick={() => handleUserAction(user.id, 'approve')}
                                className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                              >
                                <UserCheck className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                            )}
                            {user.isVerified && (
                              <button 
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                              >
                                <UserX className="w-4 h-4" />
                                <span>Suspend</span>
                              </button>
                            )}
                            <button className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            >
                              <UserX className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Pending Verifications</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Plus className="w-4 h-4" />
                    <span>Review All</span>
                  </button>
                </div>

                <div className="grid gap-6">
                  {users
                    .filter(u => !u.isVerified)
                    .map((user) => (
                      <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h4>
                            <p className="text-gray-600 mt-1">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {user.role}
                              </span>
                              <span>Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleUserAction(user.id, 'approve')}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                              <Eye className="w-4 h-4" />
                              <span>Review</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">System Reports</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Plus className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">User Activity Report</h4>
                      <span className="text-sm text-gray-500">Monthly</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Comprehensive user activity and engagement metrics</p>
                    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">
                      View Report
                    </button>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">System Performance</h4>
                      <span className="text-sm text-gray-500">Real-time</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Server performance and resource utilization</p>
                    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">
                      View Report
                    </button>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Security Audit</h4>
                      <span className="text-sm text-gray-500">Daily</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Security events and potential threats</p>
                    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;