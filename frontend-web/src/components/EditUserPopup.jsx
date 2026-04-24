import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  X, 
  Save, 
  AlertCircle,
  Eye, 
  EyeOff,
  Users,
  CheckCircle,
  Ban,
  UserCheck,
  UserX
} from 'lucide-react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_MUTATION } from '../graphql/auth';

const EditUserPopup = ({ isOpen, onClose, user, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    role: user?.role || 'UNDETERMINED',
    isVerified: user?.isVerified || false
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [updateUser] = useMutation(UPDATE_USER_MUTATION);

  useEffect(() => {
    if (!user) return;

    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      role: user.role || 'UNDETERMINED',
      isVerified: user.isVerified || false
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Only validate password if it's provided
    if (formData.password && formData.password.length > 0) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // If password is provided but confirmPassword is empty, show error
    if (formData.password && formData.password.length > 0 && !formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    
    try { ///////////////////////////////// userId is required
      const input = {
        firstName: formData.firstName.trim() || user.firstName,
        lastName: formData.lastName.trim() || user.lastName,
        email: formData.email.trim() || user.email,
        role: formData.role,
        isVerified: formData.isVerified
      };

      // Only include password if it's provided
      if (formData.password) {
        input.password = formData.password;
      }

      const { data } = await updateUser({
        variables: { id: user.id, input }
      });

      // Call success callback if provided
      if (onUpdateSuccess) {
        onUpdateSuccess(data.updateUser);
      }

      onClose();
    } catch (err) {
      console.error('Error updating user:', err);
      setErrors({ submit: 'Failed to update user. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center p-4 z-[150]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-premium rounded-[2rem] shadow-2xl max-w-2xl w-full mx-auto border border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(255,193,7,0.18)]">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Edit User</h2>
                <p className="text-sm text-accent-secondary">Update user details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-accent-muted" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Error Display */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-400">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* User Info Display */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{user.firstName} {user.lastName}</h4>
                  <p className="text-sm text-accent-secondary">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'ADMIN' 
                        ? 'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30' 
                        : user.role === 'TUTOR'
                        ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                        : 'bg-primary/20 text-primary border border-primary/30'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.isVerified 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ID Field */}
            <div>
              <label className="block text-sm font-medium text-accent-secondary mb-2">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-muted w-4 h-4" />
                <input
                  type="text"
                  value={user.id || ''}
                  readOnly
                  className="w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#0B111B]/80 text-accent-secondary cursor-not-allowed"
                  placeholder="User ID"
                />
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-accent-secondary mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-muted w-4 h-4" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-3 bg-[#0B111B]/80 text-white border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 ${
                      errors.firstName ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-secondary mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-muted w-4 h-4" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-3 bg-[#0B111B]/80 text-white border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 ${
                      errors.lastName ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-accent-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-muted w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-3 bg-[#0B111B]/80 text-white border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 ${
                    errors.email ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-accent-secondary mb-2">
                  New Password (optional)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-muted w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-3 bg-[#0B111B]/80 text-white border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 ${
                      errors.password ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Enter new password (leave blank to keep current)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-secondary mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-muted w-4 h-4" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-3 bg-[#0B111B]/80 text-white border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-muted hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-accent-secondary mb-2">
                User Role
              </label>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { value: 'UNDETERMINED', label: 'Undetermined', icon: Users },
                  { value: 'STUDENT', label: 'Student', icon: Users },
                  { value: 'TUTOR', label: 'Tutor', icon: UserCheck },
                  { value: 'ADMIN', label: 'Admin', icon: UserX }
                ].map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleInputChange({
                        target: { name: 'role', value: role.value }
                      })}
                      className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors w-full whitespace-nowrap ${
                        formData.role === role.value
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-white/10 hover:border-primary/30 text-accent-secondary bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verification Status */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-brand-yellow bg-[#0B111B]/80 border-white/10 rounded focus:ring-primary/40"
                />
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-accent-secondary">User is verified</span>
                </div>
              </label>
              <p className="text-xs text-accent-muted mt-1">
                Check this box to verify the user's email address
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-accent-secondary bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-brand-yellow text-black rounded-xl hover:bg-brand-yellow/90 yellow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 font-bold"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update User</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditUserPopup;