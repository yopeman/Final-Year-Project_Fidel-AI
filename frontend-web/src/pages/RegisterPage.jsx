import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client';
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
  Sparkles
} from 'lucide-react';
import { registerSchema } from '../lib/validation';
import { REGISTER_MUTATION } from '../graphql/auth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setSuccessMessage('');
      console.log('Registration data:', data);
      
      // Format the input - NO ROLE FIELD in frontend
      const input = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        // Role is NOT sent from frontend - backend will assign it
      };

      console.log('Sending registration input (no role field):', input);

      const response = await registerMutation({
        variables: {
          input: input,
        },
      });

      console.log('Registration response:', response);

      // Handle successful registration
      if (response.data?.register || response.data?.register?.success) {
        setSuccessMessage('Account created successfully! You will be registered as a Student.');
        
        // Navigate to login after a delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please login to continue.' 
            } 
          });
        }, 2000);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error details:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const graphQLError = err.graphQLErrors[0];
        console.log('GraphQL Error:', graphQLError);
        
        if (graphQLError.message.includes('unique') || graphQLError.message.includes('duplicate')) {
          errorMessage = 'Email already exists. Please use a different email.';
        } else if (graphQLError.message.includes('validation') || graphQLError.message.includes('invalid')) {
          errorMessage = 'Invalid input data. Please check your information.';
        } else {
          errorMessage = graphQLError.message;
        }
      } else if (err.networkError) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setServerError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="md:flex">
            {/* Left Panel */}
            <div className="md:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-600 p-12 text-white">
              <div className="h-full flex flex-col justify-center">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-bold">Fidel<span className="text-indigo-200">AI</span></span>
                </div>
                
                <h1 className="text-4xl font-bold mb-6">Start Your English Journey</h1>
                <p className="text-indigo-100 text-lg mb-8">
                  Join thousands of learners using AI-powered English education.
                </p>
                
                <div className="space-y-4">
                  {[
                    "AI-Personalized Learning Path",
                    "Live Tutor Sessions",
                    "Progress Tracking & Certificates",
                    "Community Interaction",
                    "Local Payment Integration"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-indigo-100">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="md:w-3/5 p-12">
              <div className="max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                <p className="text-gray-600 mb-6">
                  Start learning English with AI-powered lessons
                </p>

                {/* Auto Role Assignment Notice */}
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-indigo-800 font-medium">Automatic Role Assignment</p>
                      <p className="text-indigo-700 text-sm mt-1">
                        You will be automatically registered as a <strong>Student</strong>.
                        Role assignment is handled by the system.
                      </p>
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
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
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
                        <p className="text-red-800 font-medium">Registration Error</p>
                        <p className="text-red-700 text-sm mt-1">{serverError}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          {...register('firstName')}
                          className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="John"
                          disabled={loading}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          {...register('lastName')}
                          className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="Doe"
                          disabled={loading}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        {...register('email')}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="you@example.com"
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        {...register('password')}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password.message}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Must be at least 6 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        {...register('terms')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        disabled={loading}
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link to="/terms" className="text-indigo-600 hover:text-indigo-700">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700">
                          Privacy Policy
                        </Link>
                      </label>
                      {errors.terms && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.terms.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Student Account...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Create Student Account
                      </>
                    )}
                  </button>

                  {/* Login Link */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>

                {/* Registration Info */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      <GraduationCap className="w-3 h-3 inline mr-1" />
                      All new registrations are automatically assigned as <strong>Students</strong>
                    </p>
                    <p className="text-xs text-gray-400">
                      Role assignment is managed by the backend system
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 FidelAI. Bahir Dar University Final Year Project.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;