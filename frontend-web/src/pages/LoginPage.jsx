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

const LoginPage = () => {
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
    
    // Check if already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        redirectBasedOnRole(userData);
      } catch (err) {
        console.error('Error parsing user:', err);
        localStorage.clear();
      }
    }
  }, [location]);

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
      
      // Save auth data
      localStorage.setItem('token', authResult.accessToken);
      localStorage.setItem('user', JSON.stringify(authResult.user));
      
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
      
      // Clear storage on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">Welcome to FidelAI</h1>
            <p className="text-indigo-100 text-sm mt-1">Sign in to continue</p>
          </div>

          <div className="p-6">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium text-sm">Login Issue</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                   Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    {...register('username', { 
                      required: ' email is required'
                    })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="email@example.com"
                    disabled={loading}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  {/* <Link 
                    to="/forgot-password" 
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot?
                  </Link> */}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' }
                    })}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Sign up
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