import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  UserPlus,
  UserCheck,
  UserX,
  BookOpen,
  Calendar as CalendarIcon,
  MapPin,
  FileText
} from 'lucide-react';
import { 
  GET_BATCHES, 
  CREATE_BATCH, 
  UPDATE_BATCH, 
  DELETE_BATCH,
  GET_BATCH_COURSES,
  CREATE_BATCH_COURSE,
  DELETE_BATCH_COURSE,
  GET_INSTRUCTORS,
  GET_ENROLLMENTS,
  GET_COURSE_SCHEDULES
} from '../graphql/batch';
import { GET_COURSES } from '../graphql/course';
import { GET_SCHEDULES } from '../graphql/schedule';

const AdminBatches = ({ 
  onBatchAction, 
  onEditBatch, 
  onViewBatch, 
  onDeleteBatch 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_BATCHES);
  const { data: coursesData } = useQuery(GET_COURSES);
  const { data: schedulesData } = useQuery(GET_SCHEDULES);

  const [createBatch] = useMutation(CREATE_BATCH);
  const [updateBatch] = useMutation(UPDATE_BATCH);
  const [deleteBatchMutation] = useMutation(DELETE_BATCH);
  
  // State for activity indicators
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  const batches = data?.batches || [];
  const courses = coursesData?.courses || [];
  const schedules = schedulesData?.schedules || [];

  // Filter batches based on search and filters
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || batch.level === filterLevel;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const handleCreateBatch = async (batchData) => {
    try {
      await createBatch({
        variables: {
          input: {
            name: batchData.name,
            description: batchData.description,
            level: batchData.level,
            language: batchData.language || 'English',
            startDate: batchData.startDate,
            endDate: batchData.endDate,
            maxStudents: parseInt(batchData.maxStudents),
            feeAmount: parseFloat(batchData.feeAmount)
          }
        }
      });
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      console.error('Error creating batch:', err);
    }
  };

  const handleUpdateBatch = async (batchId, batchData) => {
    setIsUpdating(true);
    try {
      await updateBatch({
        variables: {
          id: batchId,
          input: {
            name: batchData.name,
            description: batchData.description,
            level: batchData.level,
            language: batchData.language,
            startDate: batchData.startDate,
            endDate: batchData.endDate,
            maxStudents: parseInt(batchData.maxStudents),
            feeAmount: parseFloat(batchData.feeAmount),
            status: batchData.status
          }
        }
      });
      setShowEditModal(false);
      setSelectedBatch(null);
      refetch();
    } catch (err) {
      console.error('Error updating batch:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    setBatchToDelete(batchId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBatch = async () => {
    if (!batchToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteBatchMutation({ variables: { id: batchToDelete } });
      setShowDeleteConfirm(false);
      setBatchToDelete(null);
      refetch();
    } catch (err) {
      console.error('Error deleting batch:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBatchToDelete(null);
  };

  const handleViewBatchDetails = async (batch) => {
    setSelectedBatch(batch);
    setShowViewModal(true);
    
    // Fetch detailed batch information
    try {
      const [coursesResult, instructorsResult, enrollmentsResult, schedulesResult] = await Promise.all([
        useQuery(GET_BATCH_COURSES, { variables: { batchId: batch.id } }),
        useQuery(GET_INSTRUCTORS, { variables: { batchId: batch.id } }),
        useQuery(GET_ENROLLMENTS, { variables: { batchId: batch.id } }),
        useQuery(GET_COURSE_SCHEDULES, { variables: { batchCourseId: null } })
      ]);
      
      setBatchDetails({
        courses: coursesResult.data?.batchCourses || [],
        instructors: instructorsResult.data?.instructors || [],
        enrollments: enrollmentsResult.data?.enrollments || [],
        schedules: schedulesResult.data?.courseSchedules || []
      });
    } catch (err) {
      console.error('Error fetching batch details:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'BEGINNER': return 'bg-purple-100 text-purple-800';
      case 'BASIC': return 'bg-blue-100 text-blue-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
            <p className="text-gray-600 mt-1">Manage batches, courses, and enrollments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Batch</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="BASIC">Basic</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch List */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading batches...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Batches</h3>
            <p className="text-gray-600">Please try again.</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-6 text-center">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batches Found</h3>
            <p className="text-gray-600">Create your first batch to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                        <div className="text-sm text-gray-500">{batch.description}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{batch.language}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">Fee: ${batch.feeAmount}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(batch.level)}`}>
                        {batch.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {batch.enrollments?.length || 0} / {batch.maxStudents}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${((batch.enrollments?.length || 0) / batch.maxStudents) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{batch.batchCourses?.length || 0}</div>
                      <div className="text-xs text-gray-500">
                        {batch.batchCourses?.map(bc => bc.course?.name).join(', ') || 'No courses'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {batch.endDate ? `to ${new Date(batch.endDate).toLocaleDateString()}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBatchDetails(batch)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatch(batch);
                            setShowEditModal(true);
                          }}
                          disabled={isUpdating}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit Batch"
                        >
                          {isUpdating ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Batch"
                        >
                          {isDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <CreateBatchModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateBatch}
          courses={courses}
        />
      )}

      {/* Edit Batch Modal */}
      {showEditModal && selectedBatch && (
        <EditBatchModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBatch(null);
          }}
          onSubmit={handleUpdateBatch}
          batch={selectedBatch}
          courses={courses}
          isUpdating={isUpdating}
        />
      )}

      {/* View Batch Details Modal */}
      {showViewModal && selectedBatch && (
        <ViewBatchModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedBatch(null);
            setBatchDetails(null);
          }}
          batch={selectedBatch}
          details={batchDetails}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={cancelDelete}
          onConfirm={confirmDeleteBatch}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

// Create Batch Modal Component
const CreateBatchModal = ({ isOpen, onClose, onSubmit, courses }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Batch</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="BASIC">Basic</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.feeAmount}
                onChange={(e) => setFormData({...formData, feeAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Batch Modal Component
const EditBatchModal = ({ isOpen, onClose, onSubmit, batch, courses, isUpdating }) => {
  const [formData, setFormData] = useState({
    name: batch?.name || '',
    description: batch?.description || '',
    level: batch?.level || 'BEGINNER',
    language: batch?.language || 'English',
    startDate: batch?.startDate ? batch.startDate.split('T')[0] : '',
    endDate: batch?.endDate ? batch.endDate.split('T')[0] : '',
    maxStudents: batch?.maxStudents || '',
    feeAmount: batch?.feeAmount || '',
    status: batch?.status || 'UPCOMING'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(batch.id, formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Batch</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="BASIC">Basic</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.feeAmount}
                onChange={(e) => setFormData({...formData, feeAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Batch</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Batch Details Modal Component
const ViewBatchModal = ({ isOpen, onClose, batch, details }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{batch.name}</h3>
              <p className="text-gray-600">{batch.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(batch.level)}`}>
                  {batch.level}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                  {batch.status}
                </span>
                <span className="text-xs text-gray-500">{batch.language}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Schedule</span>
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Start Date:</span>
                <span>{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>End Date:</span>
                <span>{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee Amount:</span>
                <span>${batch.feeAmount}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Capacity</span>
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Max Students:</span>
                <span>{batch.maxStudents}</span>
              </div>
              <div className="flex justify-between">
                <span>Enrolled:</span>
                <span>{batch.enrollments?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span>{batch.maxStudents - (batch.enrollments?.length || 0)}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${((batch.enrollments?.length || 0) / batch.maxStudents) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Courses</span>
            </h4>
            {batch.batchCourses && batch.batchCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {batch.batchCourses.map((bc) => (
                  <div key={bc.id} className="bg-white rounded p-3">
                    <div className="font-medium text-sm">{bc.course?.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{bc.course?.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No courses assigned</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Enrollments</span>
            </h4>
            {details?.enrollments && details.enrollments.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {details.enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="bg-white rounded p-3">
                    <div className="font-medium text-sm">
                      {enrollment.profile?.user?.firstName} {enrollment.profile?.user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{enrollment.profile?.user?.email}</div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Status: {enrollment.status}</span>
                      <span>Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No enrollments yet</p>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'UPCOMING': return 'bg-blue-100 text-blue-800';
    case 'COMPLETED': return 'bg-gray-100 text-gray-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getLevelColor = (level) => {
  switch (level) {
    case 'BEGINNER': return 'bg-purple-100 text-purple-800';
    case 'BASIC': return 'bg-blue-100 text-blue-800';
    case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
    case 'ADVANCED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Batch</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to delete this batch? This will permanently remove the batch and all associated data including courses, enrollments, and schedules.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong>Warning:</strong> This action is irreversible. Please make sure this is the intended batch before proceeding.
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Batch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBatches;
