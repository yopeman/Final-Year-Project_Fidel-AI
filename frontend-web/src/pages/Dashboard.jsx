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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden text-center"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white relative">
            <div className="absolute top-4 right-4">
              <NotificationBell userId={user?.id} />
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Account Pending Approval</h1>
            <p className="text-yellow-100 text-sm mt-1">Your account is under review by an administrator</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Warning Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-yellow-600" />
              </div>
            </div>

            {/* Status Message */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Account Status: Pending</h2>
              <p className="text-gray-600 text-sm">
                Your account has been created successfully but requires administrator approval 
                before you can access your dashboard.
              </p>
            </div>

            {/* What Happens Next */}
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                What happens next:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• An administrator will review your account</li>
                <li>• You will receive an email notification when approved</li>
                <li>• You can then log in and access your dashboard</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                <Mail className="w-4 h-4 text-blue-500 mr-2" />
                Need help?
              </h3>
              <p className="text-sm text-blue-700">
                Contact your administrator or support team if you have questions 
                about your account status.
              </p>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
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
                  className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors shadow-sm border border-yellow-200"
                >
                  <UserCog className="w-5 h-5" />
                  <span className="text-sm font-medium">Update Profile</span>
                </button>
                <button 
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors shadow-sm border border-red-200"
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
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Footer Note */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Last checked: {timeRemaining}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
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
    </div>
  );
};

export default Dashboard;
