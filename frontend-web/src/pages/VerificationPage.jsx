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
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-brand-indigo/30 selection:text-white">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-indigo/5 rounded-full blur-[150px] -mr-96 -mt-96 mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -ml-96 -mb-96 mix-blend-screen opacity-50"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center text-accent-secondary hover:text-white mb-6 transition-colors font-medium text-sm"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-3 hover:bg-white/10 transition-colors">
            <span className="text-lg leading-none mb-0.5">←</span>
          </div>
          Back to Terminal
        </button>

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
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Verify Identity</h1>
            <p className="text-accent-secondary text-sm font-medium">Check your secure inbox for the verification code</p>
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
                    <p className="text-red-400 font-bold text-sm tracking-wide uppercase">Verification Error</p>
                    <p className="text-red-300/80 text-sm mt-1">{serverError}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Email Info */}
            {email && (
              <div className="mb-8 p-4 bg-brand-indigo/10 border border-brand-indigo/30 rounded-xl">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-brand-indigo mr-3 shrink-0" />
                  <div>
                    <p className="text-brand-indigo/80 font-bold text-xs tracking-wide uppercase">Code Transmitted To</p>
                    <p className="text-white text-sm mt-1 font-mono">{email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-8 p-5 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="text-xs font-bold text-accent-secondary mb-3 uppercase tracking-widest">Protocol Steps:</h3>
              <ul className="text-sm text-accent-muted space-y-2 font-medium">
                <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-primary/50 mr-2"></div> Check incoming transmissions</li>
                <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-primary/50 mr-2"></div> Locate the 6-digit access code</li>
                <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-primary/50 mr-2"></div> Enter it below to unlock access</li>
              </ul>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-accent-secondary mb-3 uppercase tracking-widest text-center">
                  Authentication Code
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
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-indigo/50 focus:bg-white/10 transition-all text-center text-2xl tracking-[0.5em] placeholder:text-white/10 font-mono"
                  placeholder="000000"
                  disabled={loading}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.verificationCode && (
                  <p className="mt-2 text-xs text-red-400 font-medium text-center">{errors.verificationCode.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  disabled={loading}
                  className="px-6 py-4 border border-white/10 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 text-xs font-black uppercase tracking-widest"
                >
                  Abort
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
                    'Verify Identity'
                  )}
                </button>
              </div>

              {/* Resend Code */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-accent-secondary mr-2" />
                    <span className="text-sm font-medium text-accent-secondary">Signal lost?</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading || resendCooldown > 0}
                    className="inline-flex items-center text-primary hover:text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                        Transmitting...
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1.5" />
                        Cooldown {resendCooldown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1.5" />
                        Retransmit Signal
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Alternative Actions */}
              <div className="mt-4 text-center">
                <p className="text-sm text-accent-secondary font-medium">
                  Protocol failure?{' '}
                  <button
                    type="button"
                    onClick={handleGoToRegister}
                    className="text-primary hover:text-white font-bold underline decoration-primary/30 underline-offset-4 transition-colors"
                  >
                    Restart Registration
                  </button>
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

export default VerificationPage;