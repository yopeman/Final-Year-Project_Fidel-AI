import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Save,
  Loader2,
  Calendar,
  Layers,
  Award,
  Settings,
  Edit2,
  Hash
} from 'lucide-react';

// Create Batch Modal Component
export const CreateBatchModal = ({ isOpen, onClose, onSubmit, courses }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'BEGINNER',
    language: 'English',
    startDate: '',
    endDate: '',
    maxStudents: '',
    feeAmount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-premium w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl rounded-[3rem]"
      >
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/10 to-transparent relative">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
              <Plus className="w-6 h-6 text-brand-yellow" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Deploy Batch</h3>
              <p className="text-[10px] font-black text-accent-muted uppercase tracking-widest mt-1">Initialization Phase</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white">
            <X className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Batch Identifier</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Full Stack Web Development v2"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold placeholder:text-white/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Objective Overview</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter batch mission parameters..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold placeholder:text-white/20 resize-none"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="BEGINNER" className="bg-[#080C14]">Beginner</option>
                <option value="BASIC" className="bg-[#080C14]">Basic</option>
                <option value="INTERMEDIATE" className="bg-[#080C14]">Intermediate</option>
                <option value="ADVANCED" className="bg-[#080C14]">Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Archive Size</label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                placeholder="Limit"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Start Timeline</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold cursor-pointer"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">End Timeline</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold cursor-pointer"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
            >
              Abort
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-brand-yellow text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,193,7,0.2)]"
            >
              Initialize Batch
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Edit Batch Modal Component
export const EditBatchModal = ({ isOpen, onClose, onSubmit, batch, isUpdating }) => {
  const [formData, setFormData] = useState({
    name: batch?.name || '',
    description: batch?.description || '',
    level: batch?.level || 'BEGINNER',
    language: batch?.language || 'English',
    startDate: batch?.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
    endDate: batch?.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
    maxStudents: batch?.maxStudents || '',
    feeAmount: batch?.feeAmount || '',
    status: batch?.status || 'ACTIVE'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(batch.id, formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-premium w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl rounded-[3rem]"
      >
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/10 to-transparent">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
              <Edit className="w-6 h-6 text-brand-yellow" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Update Constraints</h3>
              <p className="text-[10px] font-black text-accent-muted uppercase tracking-widest mt-1">Batch Modification Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white">
            <X className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Batch Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-yellow/50 outline-none font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="ACTIVE" className="bg-[#080C14]">Active</option>
                <option value="UPCOMING" className="bg-[#080C14]">Upcoming</option>
                <option value="COMPLETED" className="bg-[#080C14]">Completed</option>
                <option value="CANCELLED" className="bg-[#080C14]">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="BEGINNER" className="bg-[#080C14]">Beginner</option>
                <option value="BASIC" className="bg-[#080C14]">Basic</option>
                <option value="INTERMEDIATE" className="bg-[#080C14]">Intermediate</option>
                <option value="ADVANCED" className="bg-[#080C14]">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold cursor-pointer"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.2em] ml-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold cursor-pointer"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 py-4 bg-brand-yellow text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl"
            >
              {isUpdating ? "Syncing..." : "Update Archive"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Confirmation Modal Component
export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[120] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium w-full max-w-sm overflow-hidden border border-white/10 shadow-2xl rounded-[2.5rem]"
      >
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">Delete Batch?</h3>
          <p className="text-accent-secondary mb-10 font-medium leading-relaxed">
            This will permanently decommission this batch and all linked assets. This protocol is irreversible.
          </p>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center justify-center text-xs uppercase tracking-widest"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Decommission"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
