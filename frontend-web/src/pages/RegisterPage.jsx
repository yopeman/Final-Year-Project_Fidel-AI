import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [testEmailIndex, setTestEmailIndex] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const formEmail = watch('email');

  // Generate unique test emails
  const generateTestEmail = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `testuser${timestamp}${randomNum}@example.com`;
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError('');
      setSuccessMessage('');
      
      console.log('Registration attempt:', data.email);
      
      // Prepare input with UNDETERMINED role
      const input = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        role: 'UNDETERMINED',
      };

      console.log('Sending registration request:', input);

      const response = await fetch('https://brittny-reprehensible-joel.ngrok-free.dev/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'fidelai'
        },
        body: JSON.stringify({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input)
            }
          `,
          variables: { input }
        }),
      });

      const result = await response.json();
      console.log('GraphQL Response:', result);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle GraphQL errors
      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.log('GraphQL error details:', error);
        
        // Check for specific errors
        if (error.message.includes('already registered') || error.message.includes('duplicate')) {
          throw new Error('Email already registered. Please use a different email address.');
        } else if (error.message.includes('validation') || error.message.includes('invalid')) {
          throw new Error('Invalid input. Please check your information.');
        } else if (error.message.includes('password')) {
          throw new Error('Password requirements not met.');
        } else {
          throw new Error(error.message || 'Registration failed');
        }
      }

      // Check if registration was successful
      if (result.data?.register === true || result.data?.register) {
        setSuccessMessage('🎉 Account created successfully! Redirecting to verification...');
        
        // Reset form
        reset();
        
        // Navigate to verification page after delay
        setTimeout(() => {
          navigate('/verify', { 
            state: { 
              email: data.email,
              message: 'Registration successful! Please verify your email to continue.' 
            } 
          });
        }, 2000);
      } else {
        throw new Error('Registration returned false');
      }

    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = err.message || 'Registration failed. Please try again.';
      
      setServerError(errorMessage);
      
      // Clear local storage on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  // Test registration with unique email
  const handleTestRegistration = () => {
    const testEmail = generateTestEmail();
    const testData = {
      firstName: 'Test',
      lastName: `User${testEmailIndex + 1}`,
      email: testEmail,
      password: 'Test123',
    };
    
    // Set form values
    setValue('firstName', testData.firstName);
    setValue('lastName', testData.lastName);
    setValue('email', testData.email);
    setValue('password', testData.password);
    
    setTestEmailIndex(prev => prev + 1);
    
    // Submit after short delay
    setTimeout(() => {
      onSubmit(testData);
    }, 100);
  };

  // Clear form and errors
  const handleClearForm = () => {
    reset();
    setServerError('');
    setSuccessMessage('');
  };

  // Update email to be unique
  const handleGenerateNewEmail = () => {
    const newEmail = generateTestEmail();
    setValue('email', newEmail);
    setServerError('');
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
            <h1 className="text-xl font-bold">Create Account</h1>
            <p className="text-indigo-100 text-sm mt-1">Join FidelAI Learning Platform</p>
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
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium text-sm">Registration Error</p>
                    <p className="text-red-600 text-sm mt-1">{serverError}</p>
                    
                    {/* Special handling for duplicate email */}
                    {serverError.includes('already registered') && (
                      <div className="mt-2">
                        <button
                          onClick={handleGenerateNewEmail}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
                        >
                          <RefreshCw className="w-3 h-3 inline mr-1" />
                          Generate New Email
                        </button>
                        <p className="text-xs text-gray-600 mt-2">
                          Current: <code className="bg-gray-100 px-1 rounded">{formEmail}</code>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { 
                      required: 'Required',
                      minLength: { value: 2, message: 'Min 2 chars' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="John"
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { 
                      required: 'Required',
                      minLength: { value: 2, message: 'Min 2 chars' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Doe"
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                </div>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password', { 
                    required: 'Required',
                    minLength: { value: 6, message: 'Min 6 chars' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  At least 6 characters
                </p>
              </div>


              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleClearForm}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Sign in
                </Link>
              </p>
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

export default RegisterPage;