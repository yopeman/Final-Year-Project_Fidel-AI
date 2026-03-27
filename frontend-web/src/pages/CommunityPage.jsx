import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  ThumbsUp,
  ThumbsDown,
  Heart,
  MessageCircle,
  Paperclip,
  FileText,
  Image,
  Video,
  File,
  X,
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Calendar,
  Users,
  RefreshCw
} from 'lucide-react';
import { 
  GET_COMMUNITIES, 
  POST_COMMUNITY, 
  UPDATE_COMMUNITY, 
  DELETE_COMMUNITY,
  POST_COMMUNITY_REACTION,
  POST_COMMENT,
  UPDATE_COMMENT,
  DELETE_COMMENT,
  DELETE_ATTACHMENT,
  COMMUNITY_UPDATED
} from '../graphql/community';
import { uploadCommunityAttachments, formatFileSize, getFileIcon, validateFile } from '../utils/api';
import { BASE_URL } from '../lib/apollo-client';


import useAuthStore from '../store/authStore';

const CommunityPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentUserId = user?.id;
  
  const [newPost, setNewPost] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFileInput, setShowFileInput] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAttachmentDeleteConfirm, setShowAttachmentDeleteConfirm] = useState(null);
  const [showUpdatePostModal, setShowUpdatePostModal] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea function
  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const handleTextareaChange = (e) => {
    setNewPost(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const { data, loading, error, refetch } = useQuery(GET_COMMUNITIES, {
    variables: { batchId },
    pollInterval: 30000, // Poll every 30 seconds
  });

  const { data: subscriptionData } = useSubscription(COMMUNITY_UPDATED, {
    variables: { batchId },
  });

  const [postCommunity] = useMutation(POST_COMMUNITY);
  const [updateCommunity] = useMutation(UPDATE_COMMUNITY);
  const [deleteCommunity] = useMutation(DELETE_COMMUNITY);
  const [postCommunityReaction] = useMutation(POST_COMMUNITY_REACTION);
  const [postComment] = useMutation(POST_COMMENT);
  const [updateComment] = useMutation(UPDATE_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);
  const [deleteAttachment] = useMutation(DELETE_ATTACHMENT);

  // Loading states for different operations
  const [isPosting, setIsPosting] = useState(false);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isDeletingAttachment, setIsDeletingAttachment] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Handle subscription updates
  useEffect(() => {
    if (subscriptionData?.communityUpdated) {
      refetch();
    }
  }, [subscriptionData, refetch]);

  const handlePost = async () => {
    if (!newPost.trim()) return;

    setIsPosting(true);
    try {
      const result = await postCommunity({
        variables: {
          batchId,
          content: newPost
        }
      });

      setNewPost('');
      const newCommunityId = result.data.postCommunity.id;
      
      if (selectedFiles.length > 0 && newCommunityId) {
        // Upload attachments after posting
        try {
          await uploadCommunityAttachments(newCommunityId, selectedFiles);
        } catch (uploadError) {
          console.error('Error uploading attachments:', uploadError);
        }
      }
      
      setSelectedFiles([]);
      refetch();
    } catch (err) {
      console.error('Error posting:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingContent.trim()) return;

    try {
      await updateCommunity({
        variables: {
          id: showUpdatePostModal.id,
          content: editingContent
        }
      });
      setShowUpdatePostModal(null);
      setEditingContent('');
      refetch();
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteCommunity({
        variables: { id: postId }
      });
      setShowDeleteConfirm(null);
      refetch();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleReaction = async (communityId, reactionType) => {
    try {
      await postCommunityReaction({
        variables: {
          communityId,
          reactionType
        }
      });
      refetch();
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  const handleComment = async (communityId) => {
    if (!newComment.trim()) return;

    try {
      await postComment({
        variables: {
          communityId,
          content: newComment
        }
      });
      setNewComment('');
      setShowCommentInput(null);
      refetch();
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleUpdateComment = async () => {
    if (!editingCommentContent.trim()) return;

    try {
      await updateComment({
        variables: {
          id: editingComment.id,
          content: editingCommentContent
        }
      });
      setEditingComment(null);
      setEditingCommentContent('');
      refetch();
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment({
        variables: { id: commentId }
      });
      refetch();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error });
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Invalid files:\n${invalidFiles.map(f => `${f.file.name}: ${f.error}`).join('\n')}`);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleAttachmentDelete = async (attachmentId) => {
    try {
      await deleteAttachment({
        variables: { id: attachmentId }
      });
      refetch();
    } catch (err) {
      console.error('Error deleting attachment:', err);
    }
  };

  const confirmAttachmentDelete = (attachmentId) => {
    setShowAttachmentDeleteConfirm(attachmentId);
  };

  const handleConfirmAttachmentDelete = async () => {
    if (showAttachmentDeleteConfirm) {
      try {
        await deleteAttachment({
          variables: { id: showAttachmentDeleteConfirm }
        });
        setShowAttachmentDeleteConfirm(null);
        refetch();
      } catch (err) {
        console.error('Error deleting attachment:', err);
      }
    }
  };

  const getReactionCount = (reactions, type) => {
    return reactions.filter(r => r.reactionType === type).length;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredCommunities = data?.communities?.filter(community =>
    community.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedCommunities = [...filteredCommunities].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'most_reactions':
        return (b.reactions?.length || 0) - (a.reactions?.length || 0);
      case 'most_comments':
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      default:
        return 0;
    }
  });

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Community</h2>
          <p className="text-gray-600 mb-6">Please try again or contact support.</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community</h1>
                <p className="text-sm text-gray-600">Batch {batchId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{data?.communities?.length || 0} posts</span>
              </div>
              {loading && (
                <div className="flex items-center space-x-2 text-sm text-indigo-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Refreshing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="most_reactions">Most reactions</option>
                <option value="most_comments">Most comments</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {sortedCommunities.length} post{sortedCommunities.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6 pb-48">
          {sortedCommunities.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share something with the community!</p>
              <button
                onClick={() => document.querySelector('textarea').focus()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Create your first post
              </button>
            </div>
          ) : (
            sortedCommunities.map((community) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {community.user.firstName} {community.user.lastName}
                        </h4>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {community.user.role}
                        </span>
                        {community.isEdited && (
                          <span className="text-xs text-gray-500">(edited)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(community.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {community.userId === currentUserId && (
                      <>
                        <button
                          onClick={() => setShowFileInput(showFileInput === community.id ? null : community.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShowUpdatePostModal(community);
                            setEditingContent(community.content);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(community.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{community.content}</p>
                </div>

                {/* Attachments */}
                {community.attachments && community.attachments.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {community.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={`${BASE_URL}/${attachment.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                          </div>
                          <div className="flex space-x-2">
                            {community.userId === currentUserId && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  confirmAttachmentDelete(attachment.id);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Input for Individual Post */}
                {showFileInput === community.id && (
                  <div className="mb-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Select Files
                      </button>
                      <span className="text-sm text-gray-600">
                        {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'No files selected'}
                      </span>
                    </div>
                    
                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Selected files:</p>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex space-x-2">
                          <button
                            onClick={async () => {
                              if (selectedFiles.length > 0) {
                                try {
                                  await uploadCommunityAttachments(community.id, selectedFiles);
                                  setSelectedFiles([]);
                                  setShowFileInput(null);
                                  refetch();
                                } catch (uploadError) {
                                  console.error('Error uploading attachments:', uploadError);
                                  alert('Error uploading files. Please try again.');
                                }
                              }
                            }}
                            disabled={selectedFiles.length === 0}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Upload Files
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFiles([]);
                              setShowFileInput(null);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reactions */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleReaction(community.id, 'LIKE')}
                      disabled={isReacting}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReacting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ThumbsUp className="w-4 h-4" />
                      )}
                      <span>{getReactionCount(community.reactions, 'LIKE')}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(community.id, 'DISLIKE')}
                      disabled={isReacting}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReacting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ThumbsDown className="w-4 h-4" />
                      )}
                      <span>{getReactionCount(community.reactions, 'DISLIKE')}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(community.id, 'LOVE')}
                      disabled={isReacting}
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReacting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                      <span>{getReactionCount(community.reactions, 'LOVE')}</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowCommentInput(showCommentInput === community.id ? null : community.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Comment ({community.comments?.length || 0})</span>
                  </button>
                </div>

                {/* Comments */}
                <AnimatePresence>
                  {showCommentInput === community.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          {editingComment ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Edit your comment..."
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditingCommentContent('');
                                  }}
                                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleUpdateComment}
                                  disabled={!editingCommentContent.trim()}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                  Update
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-3">
                              <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleComment(community.id)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Write a comment..."
                              />
                              <button
                                onClick={() => handleComment(community.id)}
                                disabled={!newComment.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Post
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Comments List */}
                {community.comments && community.comments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {community.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {comment.user.firstName} {comment.user.lastName}
                            </span>
                            <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
                            {comment.isEdited && (
                              <span className="text-xs text-gray-500">(edited)</span>
                            )}
                            {comment.userId === currentUserId && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingComment(comment);
                                    setEditingCommentContent(comment.content);
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )))}
        </div>
      </div>

      {/* Create Post Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-50">
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            {editingPost ? (
              <div className="space-y-4">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  placeholder="What would you like to share with the community?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingPost(null);
                        setEditingContent('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePost}
                      disabled={!editingContent.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Post
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end space-x-3">
                  <textarea
                    value={newPost}
                    onChange={handleTextareaChange}
                    placeholder="What would you like to share with the community?"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[44px] max-h-[120px]"
                    style={{ height: 'auto' }}
                  />
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {/* <button
                      onClick={() => setShowFileInput(!showFileInput)}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>Attach</span>
                    </button> */}
                    {showFileInput && (
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
                      />
                    )}
                  </div>
                </div>
                
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Post Modal */}
      {showUpdatePostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Edit className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Post</h3>
                  <p className="text-sm text-gray-600">Update your post content</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUpdatePostModal(null);
                  setEditingContent('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                placeholder="What would you like to share with the community?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={6}
              />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {editingContent.length} characters
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowUpdatePostModal(null);
                      setEditingContent('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePost}
                    disabled={!editingContent.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this post? This will also delete all associated comments and reactions.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Delete Confirmation Modal */}
      {showAttachmentDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Attachment</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setShowAttachmentDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this attachment? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAttachmentDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAttachmentDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Attachment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
