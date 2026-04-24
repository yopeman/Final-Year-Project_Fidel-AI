import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  Mail,
  Shield,
  CheckCircle,
  RefreshCw,
  Home,
  LogIn,
  User,
  UserCog,
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_USER, UPDATE_ME_MUTATION, DELETE_ME_MUTATION } from '../graphql/auth';
import UpdateProfilePopup from '../components/UpdateProfilePopup';
import NotificationBell from '../components/NotificationBell';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { user: storedUser, logout } = useAuthStore();
  const navigate = useNavigate(); // I need to import this if not present

  const [deleteMe] = useMutation(DELETE_ME_MUTATION);

  const { data, loading, error } = useQuery(GET_CURRENT_USER);

  const user = data?.me;

  const handleDeleteProfile = async () => {
    try {
      setDeleting(true);
      await deleteMe();
      logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Error deleting profile:', err);
      setDeleting(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated but not verified using store
    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    // If user is verified, redirect to appropriate dashboard based on role
    if (storedUser.isVerified) {
      switch (storedUser.role) {
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'TUTOR':
          navigate('/tutor/dashboard', { replace: true });
          break;
        default:
          break;
      }
    }

    // Set up timer for countdown
    const timer = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050B14] via-[#080C14] to-[#0D1B2A] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -mr-96 -mt-96 mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-indigo/10 rounded-full blur-[150px] -ml-96 -mb-96 mix-blend-screen opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-white/5 rounded-[100%] blur-[120px] rotate-45 opacity-20"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-[#080C14]/80 backdrop-blur-xl shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="glass-premium rounded-3xl border border-white/10 p-5 bg-white/5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 border border-brand-yellow/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,193,7,0.15)]">
                  <Shield className="w-6 h-6 text-brand-yellow" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tighter">Status Portal</h1>
                  <p className="text-xs text-accent-secondary">Fidel AI Verification Center</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBell userId={user?.id} />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Status Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-premium rounded-[2.5rem] border border-white/10 shadow-2xl bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
              <div className="bg-gradient-to-r from-brand-yellow/20 to-transparent p-10 border-b border-white/10">
                <div className="w-20 h-20 bg-brand-yellow/10 rounded-3xl flex items-center justify-center mb-6 border border-brand-yellow/20 shadow-[0_0_30px_rgba(255,193,7,0.2)]">
                  <Clock className="w-10 h-10 text-brand-yellow" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight mb-4">Account Pending Approval</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="px-4 py-1.5 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded-full text-sm font-black uppercase tracking-widest">
                    Verification In Progress
                  </span>
                  <p className="text-accent-secondary">Your workspace will be ready once an admin reviews your profile.</p>
                </div>
              </div>

              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10">
                      <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-green/20">
                        <CheckCircle className="w-6 h-6 text-brand-green" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
                      <ul className="space-y-4">
                        {[
                          'Admin reviews your credentials',
                          'Role-based permissions granted',
                          'Email notification sent to you',
                          'Full dashboard access enabled'
                        ].map((step, i) => (
                          <li key={i} className="flex items-center gap-3 text-accent-secondary text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow"></div>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => window.location.reload()}
                      className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-brand-yellow text-black rounded-[1.5rem] hover:scale-[1.02] transition-all font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(255,193,7,0.15)]"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>Refresh Application Status</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-brand-indigo/10 rounded-[2rem] p-8 border border-brand-indigo/20 h-full">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                        <Mail className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Need Assistance?</h3>
                      <p className="text-accent-secondary text-sm leading-relaxed mb-6">
                        If your verification is taking longer than expected (usually 24-48 hours), 
                        please contact the system administrator for your department.
                      </p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => window.location.href = '/'}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-bold text-sm"
                        >
                          Go Home
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Column */}
          <div className="space-y-8">
            <div className="glass-premium rounded-[2.5rem] border border-white/10 p-8 shadow-2xl bg-gradient-to-b from-white/5 to-transparent h-fit">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-brand-yellow/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-brand-yellow/20 shadow-[0_0_30px_rgba(255,193,7,0.1)]">
                  <User className="w-12 h-12 text-brand-yellow" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">{user?.firstName} {user?.lastName}</h3>
                <p className="text-accent-secondary text-sm">{user?.email}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 text-sm">
                  <span className="text-accent-muted">Status</span>
                  <span className="font-bold text-brand-yellow">Pending</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 text-sm">
                  <span className="text-accent-muted">Joined</span>
                  <span className="font-bold text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowUpdatePopup(true)}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all border border-white/10 font-bold"
                >
                  <UserCog className="w-5 h-5 text-accent-muted" />
                  <span>Update Profile</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition-all border border-red-500/20 font-bold"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Profile</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-accent-muted uppercase tracking-[0.2em]">
                Last checked: {timeRemaining}
              </p>
              <p className="text-xs text-accent-muted/50 mt-4">
                © 2026 FidelAI - Bahir Dar University
              </p>
            </div>
          </div>
        </motion.div>
      </main>

        {/* Update Profile Popup */}
        <UpdateProfilePopup
          isOpen={showUpdatePopup}
          onClose={() => setShowUpdatePopup(false)}
          user={user}
        />

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[200]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-premium rounded-2xl p-6 w-full max-w-md mx-4 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Delete Profile</h3>
                    <p className="text-sm text-accent-secondary">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="text-accent-muted hover:text-white transition-colors"
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
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-accent-secondary rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete Profile'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </div>
  );
};

export default Dashboard;
