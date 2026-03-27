import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  CheckCircle, 
  Shield, 
  AlertCircle, 
  User, 
  UserPlus, 
  AlertTriangle 
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useBatchStore from '../store/batchStore';
import useContentStore from '../store/contentStore';
import useFinanceStore from '../store/financeStore';

const AdminOverview = ({ onAction }) => {
  const { user } = useAuthStore();
  const { users } = useUserStore();
  const { batches } = useBatchStore();
  const { courses } = useContentStore();
  
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
    totalCourses: courses.length
  };
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
        className="glass-premium rounded-2xl border border-white/10 p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 yellow-glow">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">{user?.firstName} {user?.lastName}</h3>
              <p className="text-accent-secondary font-medium">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                  Administrator
                </span>
                <span className="text-accent-muted text-xs font-medium">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => onAction('updateProfile')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-bold text-sm"
            >
              <Shield className="w-4 h-4 text-primary" />
              <span>Security Settings</span>
            </button>
            <button 
              onClick={() => onAction('deleteProfile')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all font-bold text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Remove Account</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <div className="glass-premium rounded-2xl p-6 border border-primary/20 relative overflow-hidden group hover:bg-primary/5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-accent-secondary text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
              <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 yellow-glow">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="glass-premium rounded-2xl p-6 border border-brand-green/20 relative overflow-hidden group hover:bg-brand-green/5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-brand-green/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-accent-secondary text-xs font-bold uppercase tracking-wider mb-1">Verified</p>
              <p className="text-3xl font-black text-white">{stats.verified}</p>
            </div>
            <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center border border-brand-green/20">
              <CheckCircle className="w-6 h-6 text-brand-green" />
            </div>
          </div>
        </div>
        
        <div className="glass-premium rounded-2xl p-6 border border-brand-indigo/20 relative overflow-hidden group hover:bg-brand-indigo/5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-indigo/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-brand-indigo/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-accent-secondary text-xs font-bold uppercase tracking-wider mb-1">Batches</p>
              <p className="text-3xl font-black text-white">{stats.totalBatches}</p>
            </div>
            <div className="w-12 h-12 bg-brand-indigo/10 rounded-xl flex items-center justify-center border border-brand-indigo/20">
              <Calendar className="w-6 h-6 text-brand-indigo" />
            </div>
          </div>
        </div>

        <div className="glass-premium rounded-2xl p-6 border border-primary/20 relative overflow-hidden group hover:bg-primary/5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-accent-secondary text-xs font-bold uppercase tracking-wider mb-1">Enrollments</p>
              <p className="text-3xl font-black text-white">{stats.totalEnrollments}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 yellow-glow">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
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
    </div>
  );
};

export default AdminOverview;