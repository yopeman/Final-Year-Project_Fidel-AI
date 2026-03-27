import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  ShieldCheck,
  Clock,
  RefreshCw
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const VerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      verificationCode: '',
    },
  });

  // Get email from location state or localStorage
  useEffect(() => {
    const stateEmail = location.state?.email;
    const storedEmail = localStorage.getItem('verificationEmail');
    
    if (stateEmail) {
      setEmail(stateEmail);
      localStorage.setItem('verificationEmail', stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect to register
      navigate('/register');
    }
  }, [location.state, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError('');
      setSuccessMessage('');
      
      console.log('Verification attempt for:', email);
      
      const input = {
        email: email.toLowerCase().trim(),
        verificationCode: data.verificationCode.trim(),
      };

      console.log('Sending verification request:', input);

      const response = await fetch('https://brittny-reprehensible-joel.ngrok-free.dev/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'fidelai'
        },
        body: JSON.stringify({
          query: `
            mutation Verify($input: VerifyInput!) {
              verify(input: $input)
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
        
        if (error.message.includes('invalid') || error.message.includes('Invalid')) {
          throw new Error('Invalid verification code. Please try again.');
        } else if (error.message.includes('expired') || error.message.includes('Expired')) {
          throw new Error('Verification code has expired. Please request a new one.');
        } else if (error.message.includes('already verified')) {
          throw new Error('This account is already verified. Please login.');
        } else if (error.message.includes('not found')) {
          throw new Error('No verification code found for this email. Please register again.');
        } else {
          throw new Error(error.message || 'Verification failed');
        }
      }

      // Check if verification was successful
      if (result.data?.verify === true || result.data?.verify) {
        setSuccessMessage('🎉 Email verified successfully! Redirecting to login...');
        
        // Clear verification email from localStorage
        localStorage.removeItem('verificationEmail');
        
        // Reset form
        reset();
        
        // Navigate to login after delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! Please login to continue.' 
            } 
          });
        }, 2000);
      } else {
        throw new Error('Verification failed');
      }

    } catch (err) {
      console.error('Verification error:', err);
      
      let errorMessage = err.message || 'Verification failed. Please try again.';
      
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      setResendLoading(true);
      setServerError('');
      
      const input = {
        email: email.toLowerCase().trim(),
      };

      console.log('Resending verification code for:', input.email);

      const response = await fetch('https://brittny-reprehensible-joel.ngrok-free.dev/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'fidelai'
        },
        body: JSON.stringify({
          query: `
            mutation ResendVerification($input: ResendVerificationInput!) {
              resendVerification(input: $input)
            }
          `,
          variables: { input }
        }),
      });

      const result = await response.json();
      console.log('Resend GraphQL Response:', result);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle GraphQL errors
      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.log('GraphQL error details:', error);
        
        if (error.message.includes('not found') || error.message.includes('No user')) {
          throw new Error('No account found with this email. Please register first.');
        } else if (error.message.includes('already verified')) {
          throw new Error('This account is already verified. Please login.');
        } else if (error.message.includes('too many')) {
          throw new Error('Too many resend attempts. Please try again later.');
        } else {
          throw new Error(error.message || 'Failed to resend verification code');
        }
      }

      if (result.data?.resendVerification === true) {
        setSuccessMessage('Verification code resent! Please check your email.');
        setResendCooldown(60); // 60 second cooldown
      } else {
        throw new Error('Failed to resend verification code');
      }

    } catch (err) {
      console.error('Resend error:', err);
      setServerError(err.message || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoToLogin = () => {
    localStorage.removeItem('verificationEmail');
    useAuthStore.getState().logout();
    navigate('/login');
  };

  const handleGoToRegister = () => {
    localStorage.removeItem('verificationEmail');
    useAuthStore.getState().logout();
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-6"
        >
          ← Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">Verify Your Email</h1>
            <p className="text-indigo-100 text-sm mt-1">Check your inbox for the verification code</p>
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
                    <p className="text-red-700 font-medium text-sm">Verification Error</p>
                    <p className="text-red-600 text-sm mt-1">{serverError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Info */}
            {email && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-blue-600 mr-2" />
                  <div>
                    <p className="text-blue-700 font-medium text-sm">Verification Email Sent To:</p>
                    <p className="text-blue-600 text-sm mt-1 font-mono">{email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check your email inbox</li>
                <li>• Copy the 6-digit verification code</li>
                <li>• Enter it below to verify your account</li>
              </ul>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  {...register('verificationCode', { 
                    required: 'Required',
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: 'Enter 6-digit code'
                    },
                    maxLength: { value: 6, message: 'Max 6 digits' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  disabled={loading}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.verificationCode && (
                  <p className="mt-1 text-xs text-red-600">{errors.verificationCode.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Go to Login
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </div>

              {/* Resend Code */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-700">Didn't receive the code?</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading || resendCooldown > 0}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Resend Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Alternative Actions */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Having trouble?{' '}
                  <button
                    type="button"
                    onClick={handleGoToRegister}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Try registering again
                  </button>
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

export default VerificationPage;