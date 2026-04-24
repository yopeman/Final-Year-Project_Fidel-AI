import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';

const DeleteSchedulePopup = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  zIndex = 200 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4" style={{ zIndex }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-premium w-full max-w-sm border border-white/10 shadow-2xl p-10 text-center rounded-3xl relative overflow-hidden group"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/10 rounded-full blur-[80px] group-hover:bg-red-500/20 transition-all duration-700"></div>
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)] transform group-hover:rotate-12 transition-transform duration-500">
          <Trash2 className="w-12 h-12 text-red-500" />
        </div>

        <div className="space-y-4 relative z-10">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Delete Slot?</h3>
            <div className="w-12 h-1 bg-red-500 mx-auto mt-2 rounded-full"></div>
          </div>
          
          <p className="text-accent-secondary font-medium leading-relaxed px-4">
            Are you sure you want to remove this <span className="text-white font-black underline decoration-red-500/50 underline-offset-4">schedule pattern</span>? This action is irrevocable and will affect student bookings.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 mt-10 relative z-10">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full py-5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(239,68,68,0.3)] disabled:opacity-50 flex items-center justify-center space-x-3"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>Delete Pattern</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
          >
            Keep Schedule
          </button>
        </div>

        {/* Bottom decorative bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
      </motion.div>
    </div>
  );
};

export default DeleteSchedulePopup;