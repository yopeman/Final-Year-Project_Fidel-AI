import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Star, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle,
  User,
  Calendar,
  MessageCircle,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { GET_FEEDBACKS, MARK_AS_READ_FEEDBACK_MUTATION, MARK_AS_READ_ALL_FEEDBACKS_MUTATION, DELETE_FEEDBACK_MUTATION } from '../graphql/feedback';

const AdminFeedback = ({ 
  onFeedbackAction, 
  onEditFeedback, 
  onViewFeedback, 
  onDeleteFeedback 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_FEEDBACKS, {
    variables: { pagination: { page: 1, limit: 50 } }
  });

  const [markAsRead] = useMutation(MARK_AS_READ_FEEDBACK_MUTATION);
  const [markAsReadAll] = useMutation(MARK_AS_READ_ALL_FEEDBACKS_MUTATION);
  const [deleteFeedback] = useMutation(DELETE_FEEDBACK_MUTATION);

  const feedbacks = data?.feedbacks || [];

  // Filter feedbacks based on search and filters
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.context?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && feedback.isRead) ||
                       (filterRead === 'unread' && !feedback.isRead);
    
    const matchesRating = filterRating === 'all' || 
                         feedback.rate.toString() === filterRating;

    return matchesSearch && matchesRead && matchesRating;
  });

  const handleMarkAsRead = async (feedbackId) => {
    try {
      await markAsRead({ variables: { id: feedbackId } });
      refetch();
    } catch (err) {
      console.error('Error marking feedback as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAsReadAll();
      refetch();
    } catch (err) {
      console.error('Error marking all feedback as read:', err);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await deleteFeedback({ variables: { id: feedbackId } });
      setShowDeleteConfirmation(false);
      setFeedbackToDelete(null);
      refetch();
    } catch (err) {
      console.error('Error deleting feedback:', err);
    }
  };

  const getRatingColor = (rate) => {
    switch (rate) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-green-500';
      case 5: return 'text-emerald-600';
      default: return 'text-gray-500';
    }
  };

  const getRatingText = (rate) => {
    switch (rate) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-center text-gray-600 mt-4">Loading feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Feedback</h3>
          <p className="text-gray-600 mb-4">Please try again.</p>
          <button 
            onClick={() => refetch()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Feedback Management</h2>
              <p className="text-gray-600">Manage user feedback and reviews</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
            <button 
              onClick={() => refetch()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Read Status Filter */}
          <div>
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {feedbacks.length}</span>
            <span className="text-green-600">Read: {feedbacks.filter(f => f.isRead).length}</span>
            <span className="text-orange-600">Unread: {feedbacks.filter(f => !f.isRead).length}</span>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredFeedbacks.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Found</h3>
            <p className="text-gray-600">No feedback matches your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFeedbacks.map((feedback) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 ${!feedback.isRead ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Star className={`w-5 h-5 ${getRatingColor(feedback.rate)}`} />
                          <span className="font-semibold text-gray-900">{feedback.rate}/5</span>
                          <span className="text-sm text-gray-500">({getRatingText(feedback.rate)})</span>
                        </div>
                        {!feedback.isRead && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            Unread
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleMarkAsRead(feedback.id)}
                          className={`p-1 rounded hover:bg-gray-200 ${
                            feedback.isRead ? 'text-green-600' : 'text-gray-400'
                          }`}
                          title={feedback.isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          {feedback.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFeedback(feedback);
                            setShowDetails(true);
                          }}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400"
                          title="View details"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackToDelete(feedback.id);
                            setShowDeleteConfirmation(true);
                          }}
                          className="p-1 rounded hover:bg-red-100 text-red-400"
                          title="Delete feedback"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      {feedback.context && (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {feedback.context}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-gray-700 leading-relaxed">
                        {feedback.content}
                      </p>

                      {/* User Info */}
                      {feedback.user && (
                        <div className="flex items-center space-x-3 text-sm text-gray-500 border-t border-gray-200 pt-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{feedback.user.firstName} {feedback.user.lastName}</span>
                          </div>
                          <span>•</span>
                          <span>{feedback.user.email}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            feedback.user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : feedback.user.role === 'TUTOR'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {feedback.user.role}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Details Modal */}
      {showDetails && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Feedback Details</h3>
                  <p className="text-gray-600">Detailed view of user feedback</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedFeedback(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className={`w-6 h-6 ${getRatingColor(selectedFeedback.rate)}`} />
                  <span className="text-2xl font-bold text-gray-900">{selectedFeedback.rate}/5</span>
                  <span className="text-lg text-gray-600">({getRatingText(selectedFeedback.rate)})</span>
                </div>
                {!selectedFeedback.isRead && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                    Unread
                  </span>
                )}
              </div>

              {/* Context */}
              {selectedFeedback.context && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Context</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {selectedFeedback.context}
                  </span>
                </div>
              )}

              {/* Content */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Feedback Content</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedFeedback.content}
                </p>
              </div>

              {/* User Information */}
              {selectedFeedback.user && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{selectedFeedback.user.firstName} {selectedFeedback.user.lastName}</span>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{selectedFeedback.user.email}</span>
                    </div>
                    <div>
                      <span className="font-medium">Role:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedFeedback.user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : selectedFeedback.user.role === 'TUTOR'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedFeedback.user.role}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span>
                      <span className="ml-2 font-mono text-xs">{selectedFeedback.user.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Submitted:</span>
                  <span className="ml-2">{new Date(selectedFeedback.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">{new Date(selectedFeedback.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedFeedback(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => handleMarkAsRead(selectedFeedback.id)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  selectedFeedback.isRead 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {selectedFeedback.isRead ? 'Mark as Unread' : 'Mark as Read'}
              </button>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedFeedback(null);
                  setFeedbackToDelete(selectedFeedback.id);
                  setShowDeleteConfirmation(true);
                }}
                className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                Delete Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Feedback</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setFeedbackToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this feedback? This will permanently remove it from the system.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setFeedbackToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFeedback(feedbackToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;