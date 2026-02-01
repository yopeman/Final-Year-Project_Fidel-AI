import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Shield,
  BookOpen
} from 'lucide-react';
import { loginSchema } from '../lib/validation';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useMockAuth, setUseMockAuth] = useState(true); // Set to true for mock auth

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        redirectBasedOnRole(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
      }
    }
  }, [location]);

  const redirectBasedOnRole = (userData) => {
    switch (userData.role) {
      case 'STUDENT':
        navigate('/student/dashboard', { replace: true });
        break;
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
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Mock authentication - working offline
  const mockAuthenticate = (email, password) => {
    const demoUsers = {
      // Student demo account
      'student@fidelai.com': {
        token: 'mock-jwt-token-student-12345',
        user: {
          id: '1',
          email: 'student@fidelai.com',
          role: 'STUDENT',
          firstName: 'Demo',
          lastName: 'Student',
          profileImage: null,
          createdAt: new Date().toISOString()
        }
      },
      // Tutor demo account
      'tutor@fidelai.com': {
        token: 'mock-jwt-token-tutor-12345',
        user: {
          id: '2',
          email: 'tutor@fidelai.com',
          role: 'TUTOR',
          firstName: 'Demo',
          lastName: 'Tutor',
          profileImage: null,
          createdAt: new Date().toISOString()
        }
      },
      // Admin demo account
      'admin@fidelai.com': {
        token: 'mock-jwt-token-admin-12345',
        user: {
          id: '3',
          email: 'admin@fidelai.com',
          role: 'ADMIN',
          firstName: 'Demo',
          lastName: 'Admin',
          profileImage: null,
          createdAt: new Date().toISOString()
        }
      }
    };

    // Check demo accounts
    if (demoUsers[email] && password === 'demo123') {
      return demoUsers[email];
    }

    // Auto-create account for any email with password >= 6 chars
    if (password.length >= 6) {
      const emailParts = email.split('@');
      const username = emailParts[0];
      const firstName = username.charAt(0).toUpperCase() + username.slice(1);
      
      // Determine role based on email
      let role = 'STUDENT';
      if (email.includes('admin')) role = 'ADMIN';
      else if (email.includes('tutor') || email.includes('teacher') || email.includes('instructor')) role = 'TUTOR';
      
      return {
        token: `mock-jwt-token-${Date.now()}-${role.toLowerCase()}`,
        user: {
          id: Date.now().toString(),
          email: email,
          role: role,
          firstName: firstName,
          lastName: 'User',
          profileImage: null,
          createdAt: new Date().toISOString()
        }
      };
    }

    return null;
  };

  // Real GraphQL login attempt
  const attemptGraphQLLogin = async (email, password) => {
    try {
      const response = await fetch('https://brittny-reprehensible-joel.ngrok-free.dev/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                token
                user {
                  id
                  email
                  role
                  firstName
                  lastName
                }
              }
            }
          `,
          variables: {
            email: email,
            password: password,
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      if (result.data?.login) {
        return result.data.login;
      }
      
      throw new Error('Login failed');
    } catch (error) {
      console.error('GraphQL login error:', error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError('');
      
      console.log('Attempting login with:', data.email);
      
      let authResult;
      
      if (useMockAuth) {
        // Use mock authentication
        authResult = mockAuthenticate(data.email, data.password);
        
        if (!authResult) {
          throw new Error('Invalid credentials. Try demo accounts or any email with password ≥ 6 characters.');
        }
      } else {
        // Try real GraphQL login (currently failing with 400)
        authResult = await attemptGraphQLLogin(data.email, data.password);
      }
      
      if (authResult) {
        // Save authentication data
        const { token, user } = authResult;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('User logged in:', user);
        console.log('User role:', user.role);
        
        // Show success message
        setSuccessMessage(`Welcome back, ${user.firstName}! Redirecting...`);
        
        // Brief delay for UX
        setTimeout(() => {
          redirectBasedOnRole(user);
        }, 1000);
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMsg = err.message || 'Login failed.';
      
      // Provide helpful error messages
      if (err.message.includes('400') || err.message.includes('Bad Request')) {
        errorMsg = 'Backend error (400 Bad Request). Using mock authentication instead. Try demo accounts.';
        setUseMockAuth(true); // Switch to mock auth
      } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        errorMsg = 'Network error. Check your connection or try demo accounts.';
      }
      
      setServerError(errorMsg);
      
      // Clear any existing auth data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      STUDENT: { email: 'student@fidelai.com', password: 'demo123' },
      TUTOR: { email: 'tutor@fidelai.com', password: 'demo123' },
      ADMIN: { email: 'admin@fidelai.com', password: 'demo123' }
    };

    const credentials = demoCredentials[role];
    if (credentials) {
      // Set form values
      setValue('email', credentials.email);
      setValue('password', credentials.password);
      
      // Submit form
      setTimeout(() => {
        onSubmit(credentials);
      }, 100);
    }
  };

  const handleQuickLogin = (email) => {
    setValue('email', email);
    setValue('password', 'Password123');
    
    setTimeout(() => {
      onSubmit({ email, password: 'Password123' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Welcome to FidelAI</h1>
            <p className="text-center text-indigo-100 opacity-90">
              AI-Powered English Learning Platform
            </p>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
            <p className="text-gray-600 mb-6">
              {useMockAuth ? 'Using mock authentication' : 'Enter your credentials'}
            </p>

            {/* Development Notice */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 font-medium">Development Mode</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    {useMockAuth 
                      ? 'Using mock authentication due to backend issues. Try demo accounts below.' 
                      : 'Backend connection issues detected. Switching to mock auth.'}
                  </p>
                  <button 
                    onClick={() => setUseMockAuth(!useMockAuth)}
                    className="mt-2 text-xs text-yellow-700 hover:text-yellow-800 underline"
                  >
                    {useMockAuth ? 'Try real login' : 'Use mock auth'}
                  </button>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium">Success!</p>
                    <p className="text-green-700 text-sm mt-1">{successMessage}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Login Issue</p>
                    <p className="text-red-700 text-sm mt-1">{serverError}</p>
                    <p className="text-red-600 text-xs mt-2">
                      Try demo accounts or any email with password ≥ 6 characters.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Demo Accounts Section */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Quick login with demo accounts:</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  onClick={() => handleDemoLogin('STUDENT')}
                  disabled={isLoading}
                  className="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition flex items-center justify-center disabled:opacity-50"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Student
                </button>
                <button
                  onClick={() => handleDemoLogin('TUTOR')}
                  disabled={isLoading}
                  className="px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition flex items-center justify-center disabled:opacity-50"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Tutor
                </button>
                <button
                  onClick={() => handleDemoLogin('ADMIN')}
                  disabled={isLoading}
                  className="px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition flex items-center justify-center disabled:opacity-50"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickLogin('john@example.com')}
                  disabled={isLoading}
                  className="px-3 py-2 bg-gray-50 text-gray-700 text-xs rounded hover:bg-gray-100 transition disabled:opacity-50"
                >
                  john@example.com
                </button>
                <button
                  onClick={() => handleQuickLogin('sara@example.com')}
                  disabled={isLoading}
                  className="px-3 py-2 bg-gray-50 text-gray-700 text-xs rounded hover:bg-gray-100 transition disabled:opacity-50"
                >
                  sara@example.com
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Demo password: <code className="bg-gray-100 px-1 rounded">demo123</code>
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-indigo-600 hover:text-indigo-700 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  For mock auth: Use any email with password length ≥ 6
                </p>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="font-medium text-indigo-600 hover:text-indigo-700 transition"
                  >
                    Sign up now
                  </Link>
                </p>
              </div>
            </form>

            {/* Auth Mode Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Auth mode: <span className="font-medium">{useMockAuth ? 'Mock' : 'Real'}</span>
                </p>
                <button
                  onClick={() => setUseMockAuth(!useMockAuth)}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Switch to {useMockAuth ? 'real auth' : 'mock auth'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 FidelAI. Bahir Dar University Final Year Project.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Note: Backend GraphQL endpoint returns 400 error
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;