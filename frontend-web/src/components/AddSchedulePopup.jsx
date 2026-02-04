import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  X,
  AlertTriangle,
  CheckCircle
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add Schedule to Course</h3>
              <p className="text-sm text-gray-600">Assign a schedule for this course</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Schedule Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Schedule</label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select a schedule...</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.dayOfWeek} - {schedule.startTime} to {schedule.endTime}
                  {schedule.location && ` • ${schedule.location}`}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule Preview */}
          {selectedScheduleId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Schedule Selected:</strong>
                  <div className="mt-1 space-y-1">
                    {schedules.find(s => s.id === selectedScheduleId) && (
                      <>
                        <div className="flex items-center space-x-4 text-blue-700">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{schedules.find(s => s.id === selectedScheduleId).dayOfWeek}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{schedules.find(s => s.id === selectedScheduleId).startTime} - {schedules.find(s => s.id === selectedScheduleId).endTime}</span>
                          </div>
                          {schedules.find(s => s.id === selectedScheduleId).location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{schedules.find(s => s.id === selectedScheduleId).location}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> This will assign the selected schedule to this course. Students enrolled in this course will attend classes according to this schedule.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !selectedScheduleId}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  <span>Add Schedule</span>
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