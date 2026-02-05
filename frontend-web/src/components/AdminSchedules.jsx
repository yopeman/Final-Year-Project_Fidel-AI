import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
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
  Users,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { 
  GET_SCHEDULES, 
  CREATE_SCHEDULE, 
  UPDATE_SCHEDULE, 
  DELETE_SCHEDULE 
} from '../graphql/schedule';

const AdminSchedules = ({ 
  onScheduleAction, 
  onEditSchedule, 
  onViewSchedule, 
  onDeleteSchedule 
}) => {
  const [schedules, setSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('all');
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

  useEffect(() => {
    if (data?.schedules) {
      setSchedules(data.schedules);
    }
  }, [data]);

  const handleCreateSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      const { data: newData } = await createScheduleMutation({
        variables: { input: scheduleData }
      });
      
      setSchedules(prev => [...prev, newData.createSchedule]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (scheduleId, scheduleData) => {
    try {
      setLoading(true);
      const { data: newData } = await updateScheduleMutation({
        variables: { id: scheduleId, input: scheduleData }
      });
      
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? newData.updateSchedule : s
      ));
      setShowEditModal(false);
      setSelectedSchedule(null);
    } catch (err) {
      console.error('Error updating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      setLoading(true);
      await deleteScheduleMutation({ variables: { id: scheduleId } });
      
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      setShowDeleteConfirmation(false);
      setScheduleToDelete(null);
    } catch (err) {
      console.error('Error deleting schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.dayOfWeek.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.startTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.endTime.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterDay === 'all' || schedule.dayOfWeek === filterDay;
    
    return matchesSearch && matchesFilter;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule Management</h2>
            <p className="text-gray-600 mt-1">Manage class schedules and time slots</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {dayOfWeekOptions.map(day => (
                  <option key={day} value={day}>
                    {day === 'all' ? 'All Days' : day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Schedules ({filteredSchedules.length})
            </h3>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          {queryLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No schedules found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredSchedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getDayIcon(schedule.dayOfWeek)}
                        <span className="font-semibold text-gray-900">
                          {schedule.dayOfWeek}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit Schedule"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setScheduleToDelete(schedule.id);
                          setShowDeleteConfirmation(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>Created: {new Date(schedule.createdAt).toLocaleDateString()}</span>
                    <span>Last updated: {new Date(schedule.updatedAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <ScheduleModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateSchedule}
          loading={loading}
          title="Create New Schedule"
        />
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && selectedSchedule && (
        <ScheduleModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
          onSave={(data) => handleUpdateSchedule(selectedSchedule.id, data)}
          loading={loading}
          title="Edit Schedule"
          schedule={selectedSchedule}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setScheduleToDelete(null);
          }}
          onConfirm={() => handleDeleteSchedule(scheduleToDelete)}
          loading={loading}
          itemName="schedule"
        />
      )}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day of Week
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, loading, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete {itemName}</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this {itemName}? This will permanently remove it from the system.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedules;