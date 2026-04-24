import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Edit, 
  Save, 
  Loader2, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

// Add Course Modal Component
export const AddCourseModal = ({ isOpen, onClose, onSubmit, courseForm, onFormChange, formErrors, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-premium w-full max-w-md overflow-hidden border border-white/10 shadow-2xl rounded-[2.5rem]"
      >
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/10 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-yellow shadow-[0_0_20px_rgba(255,193,7,0.5)]"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
              <Plus className="w-6 h-6 text-brand-yellow" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">New Course</h3>
              <p className="text-[10px] font-bold text-accent-muted uppercase tracking-widest">Initialization Phase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          {formErrors.submit && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm font-bold flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{formErrors.submit}</span>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Archive Name</label>
            <input
              type="text"
              value={courseForm.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold text-lg ${
                formErrors.name ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
              }`}
              placeholder="e.g. Greeting"
            />
            {formErrors.name && (
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest ml-1">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Syllabus Definition</label>
            <textarea
              value={courseForm.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              rows={4}
              className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold resize-none ${
                formErrors.description ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
              }`}
              placeholder="Describe the learning objectives..."
            />
            {formErrors.description && (
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest ml-1">{formErrors.description}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-brand-yellow text-black rounded-2xl font-black uppercase tracking-widest hover:bg-brand-yellow/90 transition-all shadow-[0_0_30px_rgba(255,193,7,0.3)] disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Deploy Course</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Edit Course Modal Component
export const EditCourseModal = ({ isOpen, onClose, onSubmit, courseForm, onFormChange, formErrors, isSubmitting, editingCourse }) => {
  if (!isOpen || !editingCourse) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-premium w-full max-w-md overflow-hidden border border-white/10 shadow-2xl rounded-[2.5rem]"
      >
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/10 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-yellow shadow-[0_0_20px_rgba(255,193,7,0.5)]"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
              <Edit className="w-6 h-6 text-brand-yellow" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Update Course</h3>
              <p className="text-[10px] font-bold text-accent-muted uppercase tracking-widest">Syllabus Modification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          {formErrors.submit && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm font-bold flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{formErrors.submit}</span>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Archive Name</label>
            <input
              type="text"
              value={courseForm.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold text-lg ${
                formErrors.name ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
              }`}
            />
            {formErrors.name && (
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest ml-1">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Syllabus Definition</label>
            <textarea
              value={courseForm.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              rows={4}
              className={`w-full bg-white/5 border rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold resize-none ${
                formErrors.description ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'
              }`}
            />
            {formErrors.description && (
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest ml-1">{formErrors.description}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-brand-yellow text-black rounded-2xl font-black uppercase tracking-widest hover:bg-brand-yellow/90 transition-all shadow-[0_0_30px_rgba(255,193,7,0.3)] disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Sync Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Course Confirmation Modal Component
export const DeleteCourseConfirmationModal = ({ isOpen, onClose, onConfirm, courseToDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/95 backdrop-blur-2xl flex items-center justify-center z-[300] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium w-full max-w-sm border border-white/10 shadow-2xl p-12 text-center rounded-[3rem] relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]"></div>
        
        <div className="w-28 h-28 bg-red-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-red-500/30 shadow-[0_20px_40px_rgba(239,68,68,0.1)] transform group-hover:-rotate-6 transition-transform">
          <AlertTriangle className="w-14 h-14 text-red-500" />
        </div>

        <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Delete Course?</h3>
        <p className="text-accent-secondary mb-12 font-bold leading-relaxed px-2 text-sm">
          Initiating a <span className="text-white">full course purge</span>. All materials, files, and student enrollment data linked to this archive will be lost forever.
        </p>
        
        <div className="flex flex-col gap-5">
          <button
            onClick={() => onConfirm(courseToDelete)}
            className="w-full py-6 bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.25em] hover:bg-red-600 transition-all shadow-[0_15px_35px_rgba(239,68,68,0.3)] hover:-translate-y-1 active:translate-y-0"
          >
            Execute Purge
          </button>
          <button
            onClick={onClose}
            className="w-full py-5 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-[0.2em]"
          >
            Retrieve System
          </button>
        </div>
      </motion.div>
    </div>
  );
};
