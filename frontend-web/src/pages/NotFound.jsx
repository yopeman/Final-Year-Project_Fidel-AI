import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-indigo/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-brand-yellow/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center max-w-md relative z-10 glass-premium p-10 rounded-3xl border border-white/10 shadow-2xl">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-accent-secondary mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="gap-4 flex flex-col">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-4 bg-brand-indigo text-white rounded-xl hover:bg-brand-indigo/90 transition-all duration-300 font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-4 bg-white/5 border border-white/10 text-accent-secondary hover:text-white hover:bg-white/10 rounded-xl transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;