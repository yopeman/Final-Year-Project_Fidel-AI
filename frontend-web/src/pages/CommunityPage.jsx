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
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="glass-premium rounded-[2rem] border border-white/10 p-10 text-center shadow-2xl max-w-md w-full">
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <h2 className="mt-4 text-xl font-bold text-white">Loading community...</h2>
          <p className="mt-2 text-accent-secondary">Fetching the latest posts and discussions for this batch.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="glass-premium rounded-[2rem] border border-white/10 p-10 text-center shadow-2xl max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Community</h2>
          <p className="text-accent-secondary mb-6">Please try again or contact support.</p>
          <button 
            onClick={() => refetch()}
            className="bg-brand-yellow text-black px-4 py-2 rounded-xl hover:bg-brand-yellow/90 yellow-glow font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-16 left-8 h-48 w-48 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-24 right-12 h-56 w-56 rounded-full bg-brand-indigo/10 blur-3xl"></div>
        <div className="absolute bottom-16 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080C14]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-primary/20"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Community Hub</h1>
                <p className="text-sm text-accent-secondary">Batch #{batchId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-accent-secondary bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
                <Users className="w-4 h-4 text-primary" />
                <span><span className="text-white font-bold">{data?.communities?.length || 0}</span> posts</span>
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Refreshing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filters */}
        <div className="glass-premium rounded-[2rem] shadow-xl border border-white/10 p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-accent-muted">
              <Filter className="w-4 h-4 text-primary" />
              <span>Filter Feed</span>
            </div>
            <div className="flex flex-1 flex-col sm:flex-row gap-3 lg:max-w-3xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts, tutors, or students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0B111B]/80 border border-white/10 rounded-xl text-white placeholder:text-accent-muted focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-[#0B111B]/80 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="most_reactions">Most reactions</option>
                <option value="most_comments">Most comments</option>
              </select>
            </div>
            <div className="text-sm text-accent-muted">
              {sortedCommunities.length} post{sortedCommunities.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6 pb-56">
          {sortedCommunities.length === 0 ? (
            <div className="glass-premium rounded-[2.5rem] shadow-xl border border-dashed border-white/20 p-10 text-center bg-white/5">
              <MessageCircle className="w-16 h-16 text-accent-muted/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-accent-secondary mb-6">Be the first to share something with the community!</p>
              <button
                onClick={() => document.querySelector('textarea')?.focus()}
                className="bg-brand-yellow text-black px-4 py-2 rounded-xl hover:bg-brand-yellow/90 yellow-glow font-bold"
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
                className="glass-premium rounded-[2rem] shadow-xl border border-white/10 p-6"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-white">
                          {community.user.firstName} {community.user.lastName}
                        </h4>
                        <span className="px-2 py-1 bg-white/5 border border-white/10 text-accent-secondary text-xs rounded-full">
                          {community.user.role}
                        </span>
                        {community.isEdited && (
                          <span className="text-xs text-accent-muted">(edited)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-accent-muted mt-1">
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
                          className="p-2 text-accent-muted hover:text-white border border-white/10 rounded-xl hover:bg-white/5"
                          title="Attach files"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShowUpdatePostModal(community);
                            setEditingContent(community.content);
                          }}
                          className="p-2 text-accent-muted hover:text-primary rounded-xl hover:bg-primary/5"
                          title="Edit post"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(community.id)}
                          className="p-2 text-accent-muted hover:text-red-400 rounded-xl hover:bg-red-500/5"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{community.content}</p>
                </div>

                {/* Attachments */}
                {community.attachments && community.attachments.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-accent-secondary mb-2">Attachments</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {community.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={`${BASE_URL}/${attachment.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/10 transition-colors"
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{attachment.fileName}</p>
                            <p className="text-xs text-accent-muted">{formatFileSize(attachment.fileSize)}</p>
                          </div>
                          <div className="flex space-x-2 shrink-0">
                            {community.userId === currentUserId && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  confirmAttachmentDelete(attachment.id);
                                }}
                                className="text-red-400 hover:text-red-300"
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
                  <div className="mb-4 border-t border-white/10 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
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
                        className="px-4 py-2 bg-brand-yellow text-black rounded-xl hover:bg-brand-yellow/90 yellow-glow font-bold"
                      >
                        Select Files
                      </button>
                      <span className="text-sm text-accent-secondary">
                        {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'No files selected'}
                      </span>
                    </div>
                    
                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-accent-secondary">Selected files:</p>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-white/5 border border-white/10 p-2 rounded-xl">
                            <div className="flex items-center space-x-2 min-w-0">
                              <FileText className="w-4 h-4 text-primary" />
                              <span className="text-sm text-white truncate">{file.name}</span>
                              <span className="text-xs text-accent-muted">{formatFileSize(file.size)}</span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300"
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
                            className="px-4 py-2 bg-brand-green text-white rounded-xl hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                          >
                            Upload Files
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFiles([]);
                              setShowFileInput(null);
                            }}
                            className="px-4 py-2 text-accent-secondary hover:text-white border border-white/10 rounded-xl hover:bg-white/5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reactions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <button
                      onClick={() => handleReaction(community.id, 'LIKE')}
                      disabled={isReacting}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-accent-secondary hover:text-brand-indigo hover:bg-brand-indigo/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-accent-secondary hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-accent-secondary hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-accent-secondary hover:text-white hover:bg-white/10"
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
                      className="mt-4 pt-4 border-t border-white/10"
                    >
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 bg-brand-indigo/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-indigo/20">
                          <User className="w-4 h-4 text-brand-indigo" />
                        </div>
                        <div className="flex-1">
                          {editingComment ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                className="w-full px-3 py-2 border border-white/10 bg-[#0B111B]/80 text-white rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
                                placeholder="Edit your comment..."
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditingCommentContent('');
                                  }}
                                  className="px-3 py-2 text-accent-secondary hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleUpdateComment}
                                  disabled={!editingCommentContent.trim()}
                                  className="px-3 py-2 bg-brand-yellow text-black rounded-xl hover:bg-brand-yellow/90 disabled:opacity-50 font-semibold"
                                >
                                  Update
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleComment(community.id)}
                                className="flex-1 px-3 py-2 border border-white/10 bg-[#0B111B]/80 text-white rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
                                placeholder="Write a comment..."
                              />
                              <button
                                onClick={() => handleComment(community.id)}
                                disabled={!newComment.trim()}
                                className="px-4 py-2 bg-brand-yellow text-black rounded-xl hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
                      <div key={comment.id} className="flex items-start space-x-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
                        <div className="w-8 h-8 bg-brand-indigo/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-indigo/20">
                          <User className="w-4 h-4 text-brand-indigo" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-white">
                              {comment.user.firstName} {comment.user.lastName}
                            </span>
                            <span className="text-xs text-accent-muted">{formatTime(comment.createdAt)}</span>
                            {comment.isEdited && (
                              <span className="text-xs text-accent-muted">(edited)</span>
                            )}
                            {comment.userId === currentUserId && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingComment(comment);
                                    setEditingCommentContent(comment.content);
                                  }}
                                  className="text-accent-muted hover:text-primary"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-accent-muted hover:text-red-400"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-accent-secondary text-sm">{comment.content}</p>
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
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto">
          <div className="glass-premium rounded-[2rem] border border-white/10 shadow-2xl p-4 sm:p-5">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                {editingPost ? (
                  <div className="space-y-4">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      placeholder="What would you like to share with the community?"
                      className="w-full px-4 py-3 border border-white/10 bg-[#0B111B]/80 text-white rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 resize-none"
                      rows={4}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingPost(null);
                            setEditingContent('');
                          }}
                          className="px-4 py-2 text-accent-secondary hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdatePost}
                          disabled={!editingContent.trim()}
                          className="px-4 py-2 bg-brand-yellow text-black rounded-xl hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          Update Post
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                      <textarea
                        value={newPost}
                        onChange={handleTextareaChange}
                        placeholder="What would you like to share with the community?"
                        className="flex-1 px-4 py-3 border border-white/10 bg-[#0B111B]/80 text-white rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 resize-none min-h-[52px] max-h-[140px] placeholder:text-accent-muted"
                        style={{ height: 'auto' }}
                      />
                      <button
                        onClick={handlePost}
                        disabled={!newPost.trim() || isPosting}
                        className="px-5 py-3 bg-brand-yellow text-black rounded-xl hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-bold yellow-glow"
                      >
                        {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{isPosting ? 'Posting...' : 'Post'}</span>
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex flex-wrap gap-2">
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
                          className="flex items-center space-x-2 px-3 py-2 text-accent-secondary hover:text-white border border-white/10 rounded-xl hover:bg-white/5"
                        >
                          <Paperclip className="w-4 h-4" />
                          <span>Attach files</span>
                        </button>
                      </div>
                      <p className="text-xs text-accent-muted">Share updates, files, and notes with your batch community.</p>
                    </div>
                    
                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-sm font-medium text-accent-secondary mb-2">Selected files:</p>
                        <div className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white/5 border border-white/10 p-2 rounded-xl">
                              <div className="flex items-center space-x-2 min-w-0">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="text-sm text-white truncate">{file.name}</span>
                                <span className="text-xs text-accent-muted">{formatFileSize(file.size)}</span>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-red-400 hover:text-red-300"
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
        </div>
      </div>

      {/* Update Post Modal */}
      {showUpdatePostModal && (
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="glass-premium rounded-[2rem] p-6 w-full max-w-2xl mx-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Edit className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Edit Post</h3>
                  <p className="text-sm text-accent-secondary">Update your post content</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUpdatePostModal(null);
                  setEditingContent('');
                }}
                className="text-accent-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                placeholder="What would you like to share with the community?"
                className="w-full px-4 py-3 border border-white/10 bg-[#0B111B]/80 text-white rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 resize-none"
                rows={6}
              />
              
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <div className="text-sm text-accent-muted">
                  {editingContent.length} characters
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowUpdatePostModal(null);
                      setEditingContent('');
                    }}
                    className="px-4 py-2 text-accent-secondary hover:text-white border border-white/10 rounded-xl hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePost}
                    disabled={!editingContent.trim()}
                    className="px-6 py-2 bg-brand-yellow text-black rounded-xl hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[160] p-4">
          <div className="glass-premium rounded-[2rem] p-6 w-full max-w-md mx-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/15 rounded-2xl flex items-center justify-center border border-red-500/30">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Post</h3>
                  <p className="text-sm text-accent-secondary">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-accent-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-accent-secondary mb-6">
              Are you sure you want to delete this post? This will also delete all associated comments and reactions.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-white/10 text-accent-secondary rounded-xl hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Delete Confirmation Modal */}
      {showAttachmentDeleteConfirm && (
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[160] p-4">
          <div className="glass-premium rounded-[2rem] p-6 w-full max-w-md mx-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/15 rounded-2xl flex items-center justify-center border border-red-500/30">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Attachment</h3>
                  <p className="text-sm text-accent-secondary">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setShowAttachmentDeleteConfirm(null)}
                className="text-accent-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-accent-secondary mb-6">
              Are you sure you want to delete this attachment? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAttachmentDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-white/10 text-accent-secondary rounded-xl hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAttachmentDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
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
