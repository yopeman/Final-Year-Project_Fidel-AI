import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@apollo/client';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { LOGIN_MUTATION } from '../graphql/auth';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const { login: setAuth, user: currentUser, token: currentToken } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    
    // Check if already logged in using store
    if (currentToken && currentUser) {
      redirectBasedOnRole(currentUser);
    }
  }, [location, currentUser, currentToken]);

  const redirectBasedOnRole = (userData) => {
    switch (userData.role) {
      case 'TUTOR':
        navigate('/tutor/dashboard', { replace: true });
        break;
      case 'ADMIN':
        navigate('/admin/dashboard', { replace: true });
        break;
      default:
        navigate('/dashboard', { replace: true });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      username: '', // Changed from email to username
      password: '',
    },
  });

  // Apollo Client login mutation
  const [login, { loading: mutationLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const authResult = data.login;
      
      // Save auth data to store
      setAuth(authResult.user, authResult.accessToken);
      
      setSuccessMessage(`Welcome back, ${authResult.user.firstName}!`);
      
      // Redirect after delay
      setTimeout(() => {
        redirectBasedOnRole(authResult.user);
      }, 1000);
    },
    onError: (error) => {
      console.error('Login error:', error);
      
      let errorMsg = error.message || 'Login failed.';
      
      // Specific error messages
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMsg = 'Network error. Please check your connection.';
      }
      
      setError(errorMsg);
      
      // Store clear is handled by logout or manual if needed, 
      // but usually we don't clear on login error if someone was already logged in (unlikely here)
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      // Use Apollo Client mutation
      await login({
        variables: {
          input: {
            email: data.username, // Using email field for username/email input
            password: data.password
          }
        }
      });
      
    } catch (err) {
      // Error handling is done in onError callback
      console.error('Login submission error:', err);
    }
  };


  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-accent-secondary hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium rounded-2xl shadow-2xl overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-brand-green to-brand-indigo"></div>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 yellow-glow">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to FidelAI</h1>
            <p className="text-accent-secondary text-sm mt-2">Sign in to your learning journey</p>
          </div>

          <div className="p-8 pt-0">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-brand-green/10 border border-brand-green/20 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-brand-green mr-3" />
                  <p className="text-brand-green text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-bold text-sm">Authentication Failed</p>
                    <p className="text-red-400/80 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                   Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-muted" />
                  <input
                    type="text"
                    {...register('username', { 
                      required: 'Email is required'
                    })}
                    className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="email@example.com"
                    disabled={loading}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-white/90">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' }
                    })}
                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-muted hover:text-white transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-black font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-accent-secondary text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:underline font-bold">
                    Create Account
                  </Link>
                </p>
              </div>
            </form>

          </div>
        </motion.div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            © 2026 FidelAI - Bahir Dar University
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;