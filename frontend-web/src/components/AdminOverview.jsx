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
      color: 'bg-green-500/20 text-green-400 border border-green-500/30'
    },
    {
      label: 'Database Status',
      status: 'Connected',
      color: 'bg-green-500/20 text-green-400 border border-green-500/30'
    },
    {
      label: 'Last Backup',
      status: '2 hours ago',
      color: 'bg-white/10 text-white border border-white/20'
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
        <div className="glass-premium rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-teal-500/30 transition-all duration-300 bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-accent-secondary text-xs font-bold uppercase tracking-wider mb-1 text-teal-300/70">Upcoming Batches</p>
              <p className="text-3xl font-black text-white">{stats.upcomingBatches}</p>
            </div>
            <Calendar className="w-8 h-8 text-teal-400/80" />
          </div>
        </div>
        
        <div className="glass-premium rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300 bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-accent-secondary text-xs font-bold uppercase tracking-wider mb-1 text-red-300/70">Completed Batches</p>
              <p className="text-3xl font-black text-white">{stats.completedBatches}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-red-400/80" />
          </div>
        </div>
        
        <div className="glass-premium rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-brand-indigo/30 transition-all duration-300 bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-indigo/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-accent-secondary text-xs font-bold uppercase tracking-wider mb-1 text-brand-indigo/70">Total Enrollments</p>
              <p className="text-3xl font-black text-white">{stats.totalEnrollments}</p>
            </div>
            <UserPlus className="w-8 h-8 text-brand-indigo/80" />
          </div>
        </div>

        <div className="glass-premium rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-accent-secondary text-xs font-bold uppercase tracking-wider mb-1 text-emerald-300/70">Total Courses</p>
              <p className="text-3xl font-black text-white">{stats.totalCourses}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-emerald-400/80" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="glass-premium rounded-2xl border border-white/10 p-8 shadow-xl bg-white/5 backdrop-blur-md">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                <span className="text-sm font-bold text-accent-secondary uppercase tracking-widest">Students</span>
              </div>
              <span className="text-xl font-black text-white">{stats.students}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-brand-green rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
                <span className="text-sm font-bold text-accent-secondary uppercase tracking-widest">Tutors</span>
              </div>
              <span className="text-xl font-black text-white">{stats.tutors}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-brand-indigo rounded-full shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
                <span className="text-sm font-bold text-accent-secondary uppercase tracking-widest">Admins</span>
              </div>
              <span className="text-xl font-black text-white">{stats.admins}</span>
            </div>
          </div>
        </div>

        <div className="glass-premium rounded-2xl border border-white/10 p-8 shadow-xl bg-white/5 backdrop-blur-md">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">System Status</h3>
          <div className="space-y-4">
            {systemStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm font-bold text-accent-secondary uppercase tracking-widest">{item.label}</span>
                <span className={`px-3 py-1 font-black uppercase text-[10px] tracking-widest rounded-xl ${item.color}`}>
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