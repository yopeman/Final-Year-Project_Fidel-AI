import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Clock,
  Sun, 
  Moon, 
  CheckCircle,
  X,
  ChevronRight,
  Save,
  Loader2,
  User,
  Users,
  Layers,
  Layout
} from 'lucide-react';
import { 
  GET_SCHEDULES, 
  CREATE_SCHEDULE, 
  UPDATE_SCHEDULE, 
  DELETE_SCHEDULE 
} from '../graphql/schedule';

import useSystemStore from '../store/systemStore';

const AdminSchedules = ({ 
  onScheduleAction, 
  onEditSchedule, 
  onViewSchedule, 
  onDeleteSchedule 
}) => {
  const { filters, setFilters, getFilteredSchedules, setSchedules } = useSystemStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data, loading: queryLoading, refetch } = useQuery(GET_SCHEDULES);
  const [createScheduleMutation] = useMutation(CREATE_SCHEDULE);
  const [updateScheduleMutation] = useMutation(UPDATE_SCHEDULE);
  const [deleteScheduleMutation] = useMutation(DELETE_SCHEDULE);

  const schedules = data?.schedules || [];

  // Sync schedules to store
  useEffect(() => {
    if (schedules.length > 0) {
      setSchedules(schedules);
    }
  }, [schedules, setSchedules]);

  const filteredSchedules = getFilteredSchedules();

  const dayOfWeekOptions = [
    'all', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
  ];

  const formatTime = (time) => {
    return time ? time.slice(0, 5) : 'N/A';
  };

  const getDayIcon = (day) => {
    switch (day) {
      case 'SATURDAY':
      case 'SUNDAY':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      default:
        return <Moon className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-brand-yellow/10 transition-all duration-1000"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <Calendar className="w-8 h-8 text-brand-yellow" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Schedules</h2>
              <p className="text-accent-secondary mt-1 font-medium flex items-center">
                <div className="w-2 h-2 rounded-full bg-brand-yellow mr-2 animate-pulse"></div>
                Manage academic class timings and availability
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="group px-8 py-4 bg-brand-yellow text-black rounded-2xl font-black uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,193,7,0.2)] flex items-center space-x-3 active:scale-95"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-premium rounded-3xl border border-white/10 p-6 shadow-xl bg-white/5 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-accent-muted w-5 h-5 group-focus-within:text-brand-yellow transition-colors" />
            <input
              type="text"
              placeholder="Filter by day or time slot..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 transition-all font-bold tracking-tight"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
              <Filter className="w-5 h-5 text-accent-muted ml-2" />
               <select
                value={filters.day}
                onChange={(e) => setFilters({ day: e.target.value })}
                className="bg-transparent text-white font-bold px-4 py-2 focus:outline-none cursor-pointer appearance-none min-w-[140px]"
              >
                {dayOfWeekOptions.map(day => (
                  <option key={day} value={day} className="bg-[#080C14] text-white">
                    {day === 'all' ? 'All Days' : day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="glass-premium rounded-3xl border border-white/10 shadow-2xl bg-white/5 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center">
              <div className="w-2 h-6 bg-brand-yellow rounded-full mr-3 shadow-[0_0_10px_rgba(255,193,7,0.5)]"></div>
              Active Slots ({filteredSchedules.length})
            </h3>
            <div className="text-xs font-black text-accent-muted uppercase tracking-[0.2em]">
              Real-time Sync Active
            </div>
          </div>

          {queryLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin"></div>
              <p className="text-accent-muted font-bold animate-pulse uppercase tracking-widest text-xs">Fetching Timetable...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20">
              <Calendar className="w-16 h-16 text-accent-muted mx-auto mb-6 opacity-20" />
              <p className="text-accent-secondary font-bold text-lg">No schedules found matching your criteria.</p>
              <button onClick={() => setFilters({ search: '', day: 'all' })} className="mt-4 text-brand-yellow text-sm font-black hover:underline uppercase tracking-widest">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative bg-[#080C14]/40 border border-white/10 rounded-3xl p-6 hover:border-brand-yellow/30 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-yellow/5 group-hover:bg-brand-yellow transition-all duration-500"></div>
                  
                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-brand-yellow/10 group-hover:border-brand-yellow/30 transition-all">
                          {getDayIcon(schedule.dayOfWeek)}
                        </div>
                        <span className="font-black text-white group-hover:text-brand-yellow transition-colors tracking-tight text-lg">
                          {schedule.dayOfWeek}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowEditModal(true);
                          }}
                          className="p-2.5 bg-white/5 hover:bg-brand-yellow/20 text-accent-muted hover:text-brand-yellow rounded-xl transition-all border border-white/5"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setScheduleToDelete(schedule.id);
                            setShowDeleteConfirmation(true);
                          }}
                          className="p-2.5 bg-white/5 hover:bg-red-500/20 text-accent-muted hover:text-red-400 rounded-xl transition-all border border-white/5"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                        <Clock className="w-5 h-5 text-brand-yellow" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-accent-muted uppercase tracking-widest">Time range</span>
                          <span className="text-white font-bold">{formatTime(schedule.startTime)} — {formatTime(schedule.endTime)}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-accent-muted uppercase tracking-tighter">Updated {new Date(schedule.updatedAt).toLocaleDateString()}</span>
                        <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-[#080C14] bg-white/10 flex items-center justify-center">
                              <Users className="w-3 h-3 text-accent-muted" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <ScheduleModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateSchedule}
            loading={loading}
            title="Create New Slot"
          />
        )}
      </AnimatePresence>

      {/* Edit Schedule Modal */}
      <AnimatePresence>
        {showEditModal && selectedSchedule && (
          <ScheduleModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedSchedule(null);
            }}
            onSave={(data) => handleUpdateSchedule(selectedSchedule.id, data)}
            loading={loading}
            title="Edit timing Slot"
            schedule={selectedSchedule}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <DeleteConfirmationModal
            isOpen={showDeleteConfirmation}
            onClose={() => {
              setShowDeleteConfirmation(false);
              setScheduleToDelete(null);
            }}
            onConfirm={() => handleDeleteSchedule(scheduleToDelete)}
            loading={loading}
            itemName="schedule pattern"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Schedule Modal Component
const ScheduleModal = ({ isOpen, onClose, onSave, loading, title, schedule }) => {
  const [formData, setFormData] = useState({
    dayOfWeek: schedule?.dayOfWeek || 'MONDAY',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || ''
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      });
    } else {
      setFormData({
        dayOfWeek: 'MONDAY',
        startTime: '',
        endTime: ''
      });
    }
  }, [schedule, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-premium w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl rounded-3xl"
      >
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/10 to-transparent">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <CalendarIcon className="w-6 h-6 text-brand-yellow" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-accent-secondary hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Day of Week</label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold text-lg appearance-none cursor-pointer"
              required
            >
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                <option key={day} value={day} className="bg-[#080C14]">{day}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-bold text-lg"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-brand-yellow text-black rounded-2xl font-black uppercase tracking-wider hover:bg-brand-yellow/90 transition-all shadow-[0_0_30px_rgba(255,193,7,0.3)] disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Save Pattern'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, loading, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center z-[200] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-premium w-full max-w-sm border border-white/10 shadow-2xl p-10 text-center rounded-3xl"
      >
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Delete Slot?</h3>
        <p className="text-accent-secondary mb-10 font-medium leading-relaxed">
          Are you sure you want to remove this <span className="text-white font-bold">{itemName}</span>? This action is permanent and cannot be reversed.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50"
          >
            {loading ? 'Invalidating...' : 'Delete Permanently'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSchedules;