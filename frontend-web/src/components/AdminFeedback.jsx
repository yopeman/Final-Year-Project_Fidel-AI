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

import useSystemStore from '../store/systemStore';

const AdminFeedback = ({ 
  onFeedbackAction, 
  onEditFeedback, 
  onViewFeedback, 
  onDeleteFeedback 
}) => {
  const { filters, setFilters, getFilteredFeedback, setFeedback } = useSystemStore();
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

  // Sync feedback to store
  useEffect(() => {
    if (feedbacks.length > 0) {
      setFeedback(feedbacks);
    }
  }, [feedbacks, setFeedback]);

  const filteredFeedbacks = getFilteredFeedback();

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
      <div className="glass-premium rounded-3xl border border-white/10 p-10 shadow-2xl bg-white/5">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin"></div>
          <p className="text-accent-muted font-bold uppercase tracking-widest text-xs">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-premium rounded-3xl border border-white/10 p-10 shadow-2xl bg-white/5">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Error Loading Feedback</h3>
          <p className="text-accent-secondary mb-4">Please try again.</p>
          <button 
            onClick={() => refetch()}
            className="bg-brand-yellow text-black px-5 py-3 rounded-2xl font-black hover:scale-105 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-brand-yellow/10 transition-all duration-1000"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <MessageSquare className="w-8 h-8 text-brand-yellow" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Feedback</h2>
              <p className="text-accent-secondary mt-1 font-medium flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-yellow mr-2 animate-pulse"></span>
                Manage user reviews, ratings, and platform comments
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-5 py-3 bg-green-500/10 text-green-400 rounded-2xl border border-green-500/20 hover:bg-green-500/20 transition-all font-bold"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
            <button 
              onClick={() => refetch()}
              className="flex items-center space-x-2 px-5 py-3 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="glass-premium rounded-3xl border border-white/10 p-6 shadow-xl bg-white/5 backdrop-blur-md">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-center">
          <div className="relative group xl:col-span-2">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-accent-muted w-5 h-5 group-focus-within:text-brand-yellow transition-colors" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-accent-muted focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 outline-none transition-all"
            />
          </div>

          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
            <Filter className="w-5 h-5 text-accent-muted ml-2" />
            <select
              value={filters.read}
              onChange={(e) => setFilters({ read: e.target.value })}
              className="w-full bg-transparent text-white font-bold px-4 py-2 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all" className="bg-[#080C14] text-white">All Status</option>
              <option value="unread" className="bg-[#080C14] text-white">Unread</option>
              <option value="read" className="bg-[#080C14] text-white">Read</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
            <Star className="w-5 h-5 text-brand-yellow ml-2" />
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ rating: e.target.value })}
              className="w-full bg-transparent text-white font-bold px-4 py-2 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all" className="bg-[#080C14] text-white">All Ratings</option>
              <option value="5" className="bg-[#080C14] text-white">5 Stars</option>
              <option value="4" className="bg-[#080C14] text-white">4 Stars</option>
              <option value="3" className="bg-[#080C14] text-white">3 Stars</option>
              <option value="2" className="bg-[#080C14] text-white">2 Stars</option>
              <option value="1" className="bg-[#080C14] text-white">1 Star</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">Total</p>
            <p className="text-2xl font-black text-white mt-2">{feedbacks.length}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <p className="text-[11px] font-black text-green-300 uppercase tracking-[0.2em]">Read</p>
            <p className="text-2xl font-black text-white mt-2">{feedbacks.filter(f => f.isRead).length}</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <p className="text-[11px] font-black text-orange-300 uppercase tracking-[0.2em]">Unread</p>
            <p className="text-2xl font-black text-white mt-2">{feedbacks.filter(f => !f.isRead).length}</p>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="glass-premium rounded-3xl border border-white/10 shadow-2xl bg-white/5 overflow-hidden">
        {filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-accent-muted/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Feedback Found</h3>
            <p className="text-accent-secondary">No feedback matches your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredFeedbacks.map((feedback) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 transition-colors ${!feedback.isRead ? 'bg-brand-yellow/5' : 'bg-transparent hover:bg-white/5'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <Star className={`w-5 h-5 ${getRatingColor(feedback.rate)}`} />
                          <span className="font-bold text-white">{feedback.rate}/5</span>
                          <span className="text-sm text-accent-muted">({getRatingText(feedback.rate)})</span>
                        </div>
                        {!feedback.isRead && (
                          <span className="px-2 py-1 bg-orange-500/15 text-orange-300 text-xs font-bold rounded-full border border-orange-500/20">
                            Unread
                          </span>
                        )}
                        {feedback.context && (
                          <span className="px-2 py-1 bg-blue-500/15 text-blue-300 text-xs font-bold rounded-full border border-blue-500/20">
                            {feedback.context}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-accent-secondary flex items-center gap-1 mr-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleMarkAsRead(feedback.id)}
                          className={`p-2 rounded-xl border transition-all ${
                            feedback.isRead
                              ? 'text-green-400 bg-green-500/10 border-green-500/20 hover:bg-green-500/20'
                              : 'text-accent-muted bg-white/5 border-white/10 hover:bg-white/10'
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
                          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-accent-muted transition-all"
                          title="View details"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackToDelete(feedback.id);
                            setShowDeleteConfirmation(true);
                          }}
                          className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all"
                          title="Delete feedback"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-accent-secondary leading-relaxed mb-4">
                      {feedback.content}
                    </p>

                    {feedback.user && (
                      <div className="flex flex-wrap items-center gap-3 text-sm text-accent-muted border-t border-white/10 pt-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{feedback.user.firstName} {feedback.user.lastName}</span>
                        </div>
                        <span>•</span>
                        <span>{feedback.user.email}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          feedback.user.role === 'ADMIN' 
                            ? 'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30' 
                            : feedback.user.role === 'TUTOR'
                            ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                            : 'bg-primary/20 text-primary border border-primary/30'
                        }`}>
                          {feedback.user.role}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Details Modal */}
      {showDetails && selectedFeedback && (
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="glass-premium bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/90 rounded-[2.5rem] p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-yellow/10 rounded-2xl flex items-center justify-center border border-brand-yellow/20">
                  <MessageSquare className="w-6 h-6 text-brand-yellow" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Feedback Details</h3>
                  <p className="text-accent-secondary">Detailed view of user feedback</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedFeedback(null);
                }}
                className="p-2 rounded-xl text-accent-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Star className={`w-6 h-6 ${getRatingColor(selectedFeedback.rate)}`} />
                  <span className="text-2xl font-black text-white">{selectedFeedback.rate}/5</span>
                  <span className="text-lg text-accent-secondary">({getRatingText(selectedFeedback.rate)})</span>
                </div>
                {!selectedFeedback.isRead && (
                  <span className="px-3 py-1 bg-orange-500/15 text-orange-300 text-sm font-bold rounded-full border border-orange-500/20">
                    Unread
                  </span>
                )}
              </div>

              {selectedFeedback.context && (
                <div>
                  <h4 className="font-bold text-white mb-2">Context</h4>
                  <span className="px-3 py-1 bg-blue-500/15 text-blue-300 text-sm font-bold rounded-full border border-blue-500/20">
                    {selectedFeedback.context}
                  </span>
                </div>
              )}

              <div>
                <h4 className="font-bold text-white mb-2">Feedback Content</h4>
                <p className="text-accent-secondary bg-white/5 border border-white/10 p-4 rounded-2xl leading-relaxed">
                  {selectedFeedback.content}
                </p>
              </div>

              {selectedFeedback.user && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h4 className="font-bold text-white mb-3">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-accent-secondary">
                    <div>
                      <span className="font-bold text-white">Name:</span>
                      <span className="ml-2">{selectedFeedback.user.firstName} {selectedFeedback.user.lastName}</span>
                    </div>
                    <div>
                      <span className="font-bold text-white">Email:</span>
                      <span className="ml-2">{selectedFeedback.user.email}</span>
                    </div>
                    <div>
                      <span className="font-bold text-white">Role:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        selectedFeedback.user.role === 'ADMIN' 
                          ? 'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30' 
                          : selectedFeedback.user.role === 'TUTOR'
                          ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                          : 'bg-primary/20 text-primary border border-primary/30'
                      }`}>
                        {selectedFeedback.user.role}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-white">User ID:</span>
                      <span className="ml-2 font-mono text-xs">{selectedFeedback.user.id}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-accent-secondary">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <span className="font-bold text-white">Submitted:</span>
                  <span className="ml-2">{new Date(selectedFeedback.createdAt).toLocaleString()}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <span className="font-bold text-white">Last Updated:</span>
                  <span className="ml-2">{new Date(selectedFeedback.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedFeedback(null);
                }}
                className="flex-1 px-4 py-3 bg-white/5 text-white rounded-2xl hover:bg-white/10 border border-white/10 transition-all font-bold"
              >
                Close
              </button>
              <button
                onClick={() => handleMarkAsRead(selectedFeedback.id)}
                className={`flex-1 px-4 py-3 rounded-2xl font-bold transition-all ${
                  selectedFeedback.isRead 
                    ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' 
                    : 'bg-green-500/90 text-black hover:bg-green-400'
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
                className="flex-1 px-4 py-3 bg-red-500/90 text-white rounded-2xl hover:bg-red-500 font-bold transition-all"
              >
                Delete Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="glass-premium w-full max-w-md mx-4 rounded-[2.5rem] border border-white/10 shadow-2xl p-6 bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/90">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Delete Feedback</h3>
                  <p className="text-sm text-accent-secondary">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setFeedbackToDelete(null);
                }}
                className="p-2 rounded-xl text-accent-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-accent-secondary mb-6">
              Are you sure you want to delete this feedback? This will permanently remove it from the system.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setFeedbackToDelete(null);
                }}
                className="flex-1 px-4 py-3 border border-white/10 text-white rounded-2xl hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFeedback(feedbackToDelete)}
                className="flex-1 px-4 py-3 bg-red-500/90 text-white rounded-2xl hover:bg-red-500 transition-all font-bold"
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