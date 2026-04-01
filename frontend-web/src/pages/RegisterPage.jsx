import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import useAuthStore from '../store/authStore';

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
      
      // Clear store on error if needed
      useAuthStore.getState().logout();
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
    <div className="gradient-bg flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-brand-indigo/30 selection:text-white">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -mr-96 -mt-96 mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-indigo/10 rounded-full blur-[150px] -ml-96 -mb-96 mix-blend-screen opacity-50"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-accent-secondary hover:text-white mb-6 transition-colors font-medium text-sm"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-3 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Terminal
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-premium rounded-[2rem] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-10 pb-6 text-center border-b border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-indigo via-primary to-brand-green"></div>
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Initialize Profile</h1>
            <p className="text-accent-secondary text-sm font-medium">Join FidelAI Educational Engine</p>
          </div>

          <div className="p-10 pt-8">
            {/* Success Message */}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-brand-green/10 border border-brand-green/30 rounded-xl"
              >
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-brand-green mr-3 shrink-0" />
                  <p className="text-brand-green font-medium text-sm">{successMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {serverError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-red-400 font-bold text-sm tracking-wide uppercase">System Error</p>
                    <p className="text-red-300/80 text-sm mt-1">{serverError}</p>
                    
                    {/* Special handling for duplicate email */}
                    {serverError.includes('already registered') && (
                      <div className="mt-4">
                        <button
                          onClick={handleGenerateNewEmail}
                          className="text-xs bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors uppercase tracking-widest font-bold flex items-center"
                        >
                          <RefreshCw className="w-3 h-3 mr-2" />
                          Regenerate Identity
                        </button>
                        <p className="text-xs text-accent-muted mt-3">
                          Current: <code className="bg-white/10 px-2 py-1 rounded text-white">{formEmail}</code>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}


            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-accent-secondary mb-2 uppercase tracking-widest">
                    Given Name
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { 
                      required: 'Required',
                      minLength: { value: 2, message: 'Min 2 chars' }
                    })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-indigo/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                    placeholder="John"
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-xs text-red-400 font-medium">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-accent-secondary mb-2 uppercase tracking-widest">
                    Surname
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { 
                      required: 'Required',
                      minLength: { value: 2, message: 'Min 2 chars' }
                    })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-indigo/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                    placeholder="Doe"
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-xs text-red-400 font-medium">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-accent-secondary mb-2 uppercase tracking-widest">
                  Communication Vector
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email'
                    }
                  })}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-indigo/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                  placeholder="operator@fidel.ai"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-red-400 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-accent-secondary mb-2 uppercase tracking-widest">
                  Security Passkey
                </label>
                <input
                  type="password"
                  {...register('password', { 
                    required: 'Required',
                    minLength: { value: 6, message: 'Min 6 chars' }
                  })}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-indigo/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20 tracking-[0.2em]"
                  placeholder="••••••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="mt-2 text-xs text-red-400 font-medium">{errors.password.message}</p>
                )}
                <p className="text-[10px] text-accent-muted mt-2 uppercase tracking-widest font-bold">
                  Minimum 6 characters required for encryption
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleClearForm}
                  disabled={loading}
                  className="px-6 py-4 border border-white/10 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 text-xs font-black uppercase tracking-widest"
                >
                  Purge Data
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-4 bg-primary text-[#080C14] rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center yellow-glow text-xs font-black uppercase tracking-widest"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Establish Identity'
                  )}
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 text-center">
                <p className="text-sm text-accent-secondary font-medium">
                  Protocol already established?{' '}
                  <Link to="/login" className="text-primary hover:text-white transition-colors font-bold underline decoration-primary/30 underline-offset-4">
                    Authenticate Here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>

        <div className="mt-8 text-center relative z-10">
          <p className="text-xs text-accent-muted font-bold tracking-widest uppercase">
            © 2026 FidelAI Core Systems
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;