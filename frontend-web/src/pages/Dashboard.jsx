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
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium rounded-2xl shadow-2xl overflow-hidden text-center border border-white/10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-yellow/20 to-transparent p-6 text-white relative border-b border-white/10">
            <div className="absolute top-4 right-4">
              <NotificationBell userId={user?.id} />
            </div>
            <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-yellow/20 shadow-[0_0_20px_rgba(255,193,7,0.18)]">
              <Clock className="w-8 h-8 text-brand-yellow" />
            </div>
            <h1 className="text-2xl font-bold text-white">Account Pending Approval</h1>
            <p className="text-accent-secondary text-sm mt-1">Your account is under review by an administrator</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Warning Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center border border-brand-yellow/20">
                <AlertTriangle className="w-10 h-10 text-brand-yellow" />
              </div>
            </div>

            {/* Status Message */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Account Status: Pending</h2>
              <p className="text-accent-muted text-sm">
                Your account has been created successfully but requires administrator approval
                before you can access your dashboard.
              </p>
            </div>

            {/* What Happens Next */}
            <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10">
              <h3 className="font-medium text-white mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 text-brand-green mr-2" />
                What happens next:
              </h3>
              <ul className="text-sm text-accent-muted space-y-1">
                <li>• An administrator will review your account</li>
                <li>• You will receive an email notification when approved</li>
                <li>• You can then log in and access your dashboard</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-brand-indigo/10 rounded-xl p-4 text-left border border-brand-indigo/20">
              <h3 className="font-medium text-blue-300 mb-2 flex items-center">
                <Mail className="w-4 h-4 text-blue-400 mr-2" />
                Need help?
              </h3>
              <p className="text-sm text-blue-200/80">
                Contact your administrator or support team if you have questions
                about your account status.
              </p>
            </div>

            {/* Profile Section */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center border border-brand-yellow/20">
                    <User className="w-8 h-8 text-brand-yellow" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-accent-secondary">{user?.email}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-accent-muted">
                      <span className="px-2 py-1 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded-full text-xs">
                        Pending Verification
                      </span>
                      <span>Member since: {new Date(user?.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Actions - Spaced out buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowUpdatePopup(true)}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white/5 text-accent-secondary rounded-xl hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                >
                  <UserCog className="w-5 h-5" />
                  <span className="text-sm font-medium">Update Profile</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Delete Profile</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-brand-yellow text-black rounded-xl hover:bg-brand-yellow/90 yellow-glow transition-colors font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-brand-indigo/20 text-blue-300 rounded-xl border border-brand-indigo/30 hover:bg-brand-indigo/30 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white/5 text-accent-secondary rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Footer Note */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-accent-muted">
                Last checked: {timeRemaining}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 text-center">
          <p className="text-xs text-accent-muted">
            © 2026 FidelAI - Bahir Dar University
          </p>
        </div>

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
    </div>
  );
};

export default Dashboard;
