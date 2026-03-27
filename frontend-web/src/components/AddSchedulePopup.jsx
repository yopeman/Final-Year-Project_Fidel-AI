import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Save,
  Loader2
} from 'lucide-react';

const AddSchedulePopup = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  batchCourseId, 
  schedules, 
  isAdding, 
  zIndex = 60 
}) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedScheduleId) {
      onSubmit(batchCourseId, selectedScheduleId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center p-4" style={{ zIndex }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-premium w-full max-w-xl overflow-hidden border border-white/10 shadow-2xl flex flex-col rounded-3xl"
      >
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <CalendarIcon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Add Course Slot</h3>
              <p className="text-accent-secondary text-sm font-medium">Assign timing to this academic course</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-white/10 rounded-full transition-all text-accent-secondary hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Schedule Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Select Available Schedule</label>
            <div className="relative group">
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer font-bold text-lg"
                required
              >
                <option value="" className="bg-[#080C14]">Choose a schedule pattern...</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id} className="bg-[#080C14]">
                    {schedule.dayOfWeek} — {schedule.startTime} to {schedule.endTime}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-accent-muted group-hover:text-primary transition-colors">
                <Plus className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Schedule Preview & Info */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>
            
            <div className="flex items-start space-x-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Assignment Confirmation</h4>
                <p className="text-sm text-accent-secondary leading-relaxed font-medium">
                  This timing will be officially added to the course roadmap. All students enrolled in this batch course will receive automatic calendar updates.
                </p>
              </div>
            </div>

            {selectedScheduleId && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 relative z-10"
              >
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-[10px] font-black text-accent-muted uppercase tracking-widest mb-1">Day of Week</div>
                  <div className="text-white font-bold">{schedules.find(s => s.id === selectedScheduleId).dayOfWeek}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-[10px] font-black text-accent-muted uppercase tracking-widest mb-1">Class Time</div>
                  <div className="text-white font-bold">
                    {schedules.find(s => s.id === selectedScheduleId).startTime} — {schedules.find(s => s.id === selectedScheduleId).endTime}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 px-8 py-4 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !selectedScheduleId}
              className="flex-1 px-8 py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(255,193,7,0.3)] active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <CalendarIcon className="w-5 h-5" />
                  <span>Assign Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddSchedulePopup;