import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Beaker } from 'lucide-react';

const TestVerification = () => {
  const navigate = useNavigate();

  const handleTestVerification = () => {
    // Navigate to /verify with simulation data
    navigate('/verify', {
      state: {
        email: 'operator@fidel.ai',
        message: 'Diagnostic Verification Sequence Initiated'
      }
    });
  };

  return (
    <div className="gradient-bg flex items-center justify-center min-h-screen p-6 relative overflow-hidden font-sans selection:bg-brand-indigo/30 selection:text-white">
      {/* Background Decorators */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-indigo/10 rounded-full blur-[150px] -mr-48 -mt-48 mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -ml-48 -mb-48 mix-blend-screen opacity-50"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-premium rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="bg-white/5 border-b border-white/10 p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-indigo via-primary to-brand-green"></div>
            
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(255,193,7,0.15)] relative">
              <div className="absolute inset-0 bg-primary opacity-20 blur-xl rounded-full"></div>
              <Beaker className="w-10 h-10 text-primary relative z-10" />
            </div>

            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Diagnostic Mode</h1>
            <p className="text-accent-secondary font-medium tracking-wide">Verification Module Telemetry Test</p>
          </div>

          <div className="p-10 pt-8 text-center">
            <div className="mb-10 p-5 bg-white/5 border border-white/10 rounded-2xl flex items-start text-left space-x-4">
              <ShieldAlert className="w-6 h-6 text-brand-indigo shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-bold tracking-tight mb-2">Simulated Data Injection</h3>
                <p className="text-accent-secondary text-sm leading-relaxed">
                  Initializing this routine will bypass standard registration pathways and inject simulated telemetry (<span className="text-primary font-mono text-xs">operator@fidel.ai</span>) directly into the verification matrix.
                </p>
              </div>
            </div>

            <button 
              onClick={handleTestVerification}
              className="group w-full py-5 bg-primary text-[#080C14] rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all yellow-glow flex items-center justify-center space-x-3 mb-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10">Engage Verification Test</span>
              <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-xs text-accent-muted font-bold tracking-widest uppercase">
              Debug Environment Only
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TestVerification;