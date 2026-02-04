import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  User,
  Shield,
  Calendar,
  AlertTriangle,
  UserPlus,
  AlertCircle
} from 'lucide-react';

const AdminOverview = ({ user, stats, onAction }) => {
  const recentActivity = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle,
      message: 'New tutor approved: Dr. Sarah Johnson',
      time: '30 minutes ago',
      color: 'text-green-500'
    },
    {
      id: 2,
      type: 'info',
      icon: UserPlus,
      message: 'New student registered: Michael Chen',
      time: '2 hours ago',
      color: 'text-blue-500'
    },
    {
      id: 3,
      type: 'warning',
      icon: AlertTriangle,
      message: 'Suspicious activity detected on user account',
      time: '4 hours ago',
      color: 'text-yellow-500'
    }
  ];

  const systemStatus = [
    {
      label: 'System Health',
      status: 'Good',
      color: 'bg-green-100 text-green-800'
    },
    {
      label: 'Database Status',
      status: 'Connected',
      color: 'bg-green-100 text-green-800'
    },
    {
      label: 'Last Backup',
      status: '2 hours ago',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
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
            <button 
              onClick={() => onAction('updateProfile')}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Update Profile</span>
            </button>
            <button 
              onClick={() => onAction('deleteProfile')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Delete Profile</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
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
              <p className="text-purple-100 text-sm">Total Batches</p>
              <p className="text-2xl font-bold">{stats.totalBatches}</p>
            </div>
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Active Batches</p>
              <p className="text-2xl font-bold">{stats.activeBatches}</p>
            </div>
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </motion.div>

      {/* Additional Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Upcoming Batches</p>
              <p className="text-2xl font-bold">{stats.upcomingBatches}</p>
            </div>
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Completed Batches</p>
              <p className="text-2xl font-bold">{stats.completedBatches}</p>
            </div>
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Enrollments</p>
              <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
            </div>
            <UserPlus className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Courses</p>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
            </div>
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
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
            {systemStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${item.color}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6 space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
              <div>
                <p className="font-medium">{activity.message}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOverview;