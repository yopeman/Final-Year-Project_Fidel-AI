import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    TextInput, ScrollView, RefreshControl, StatusBar,
    Image, KeyboardAvoidingView, Platform,
    ActivityIndicator, Alert, Keyboard, Modal, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useCommunityStore } from '../../src/stores/communityStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants/theme';
import { API_BASE_URL } from '../../src/constants';
import PremiumMenu from '../../src/components/PremiumMenu';
import PremiumUpgradeModal from '../../src/components/PremiumUpgradeModal';
import FileViewerModal from '../../src/components/FileViewerModal';
import styles from '../styles/communityStyle';

// Base URL for file paths (strip /graphql suffix)
const FILE_BASE_URL = API_BASE_URL.replace('/graphql', '');

const REACTION_CONFIG = {
    LIKE: { icon: 'thumbs-up', color: '#3B82F6', label: 'Like', emoji: '👍' },
    DISLIKE: { icon: 'thumbs-down', color: '#6B7280', label: 'Dislike', emoji: '👎' },
    LOVE: { icon: 'heart', color: '#EF4444', label: 'Love', emoji: '❤️' }
};

const CommunityScreen = () => {
    const { user } = useAuthStore();
    const { activeBatchId, enrollments, premiumUnlocked } = useBatchStore();
    const {
        posts, isLoading, getPosts, createPost,
        updatePost, deletePost,
        toggleReaction,
        addComment, updateComment, deleteComment,
        uploadAttachments, deleteAttachment,
        selectedFiles, addFiles, removeFile, clearFiles
    } = useCommunityStore();

    const [menuVisible, setMenuVisible] = useState(false);
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Per-post comment visibility
    const [activePostId, setActivePostId] = useState(null);
    const [commentText, setCommentText] = useState('');

    // Edit post modal
    const [editPostModal, setEditPostModal] = useState(null); // { id, content }
    const [editPostContent, setEditPostContent] = useState('');

    // Delete post confirm
    const [deletePostConfirm, setDeletePostConfirm] = useState(null); // postId

    // Edit comment
    const [editingComment, setEditingComment] = useState(null); // { postId, id, content }
    const [editCommentText, setEditCommentText] = useState('');

    // Delete comment confirm
    const [deleteCommentConfirm, setDeleteCommentConfirm] = useState(null); // { postId, id }

    // Attach files to existing post
    const [attachPostId, setAttachPostId] = useState(null);
    const [attachFiles, setAttachFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    // Delete attachment confirm
    const [deleteAttachConfirm, setDeleteAttachConfirm] = useState(null); // { postId, id }



    const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');
    const batchId = activeBatchId || enrollments.find(e => e.status === 'ENROLLED')?.batch?.id;

    useEffect(() => {
        if (batchId) getPosts(batchId);
    }, [batchId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (batchId) await getPosts(batchId);
        setRefreshing(false);
    }, [batchId]);

    const handleCreatePost = async () => {
        if (!newPost.trim() && selectedFiles.length === 0) return;
        if (!batchId) return;
        const res = await createPost(batchId, newPost.trim(), selectedFiles);
        if (res.success) {
            Keyboard.dismiss();
            setNewPost('');
            clearFiles();
        } else {
            Alert.alert('Error', res.error || 'Failed to share post. Please try again.');
        }
    };

    const handleUpdatePost = async () => {
        if (!editPostContent.trim() || !editPostModal) return;
        const res = await updatePost(editPostModal.id, editPostContent.trim());
        if (res.success) {
            setEditPostModal(null);
            setEditPostContent('');
        } else {
            Alert.alert('Error', res.error || 'Failed to update post.');
        }
    };

    const handleDeletePost = async () => {
        if (!deletePostConfirm) return;
        const res = await deletePost(deletePostConfirm);
        if (res.success) {
            setDeletePostConfirm(null);
        } else {
            Alert.alert('Error', res.error || 'Failed to delete post.');
        }
    };

    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true,
                copyToCacheDirectory: true,
            });
            if (!result.canceled) {
                const files = result.assets.map(a => ({
                    uri: a.uri, name: a.name, size: a.size, type: a.mimeType, file: a.file
                }));
                addFiles(files);
            }
        } catch (e) {
            console.log('File pick error:', e);
        }
    };

    const handleAttachFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true,
                copyToCacheDirectory: true,
            });
            if (!result.canceled) {
                const files = result.assets.map(a => ({
                    uri: a.uri, name: a.name, size: a.size, type: a.mimeType, file: a.file
                }));
                setAttachFiles(prev => [...prev, ...files]);
            }
        } catch (e) {
            console.log('File pick error:', e);
        }
    };

    const handleUploadAttachments = async () => {
        if (!attachPostId || attachFiles.length === 0) return;
        setIsUploading(true);
        const res = await uploadAttachments(attachPostId, attachFiles);
        setIsUploading(false);
        if (res.success) {
            setAttachPostId(null);
            setAttachFiles([]);
        } else {
            Alert.alert('Error', res.error || 'Failed to upload files.');
        }
    };

    const handleDeleteAttachment = async () => {
        if (!deleteAttachConfirm) return;
        const res = await deleteAttachment(deleteAttachConfirm.postId, deleteAttachConfirm.id);
        if (res.success) {
            setDeleteAttachConfirm(null);
        } else {
            Alert.alert('Error', res.error || 'Failed to delete attachment.');
        }
    };

    const handleAddComment = async (postId) => {
        if (!commentText.trim()) return;
        const res = await addComment(postId, commentText.trim());
        if (res.success) {
            Keyboard.dismiss();
            setCommentText('');
        } else {
            Alert.alert('Error', res.error || 'Failed to add comment.');
        }
    };

    const handleUpdateComment = async () => {
        if (!editingComment || !editCommentText.trim()) return;
        const res = await updateComment(editingComment.postId, editingComment.id, editCommentText.trim());
        if (res.success) {
            setEditingComment(null);
            setEditCommentText('');
        } else {
            Alert.alert('Error', res.error || 'Failed to update comment.');
        }
    };

    const handleDeleteComment = async () => {
        if (!deleteCommentConfirm) return;
        const res = await deleteComment(deleteCommentConfirm.postId, deleteCommentConfirm.id);
        if (res.success) {
            setDeleteCommentConfirm(null);
        } else {
            Alert.alert('Error', res.error || 'Failed to delete comment.');
        }
    };

    const openFile = (att) => {
        const url = att.filePath?.startsWith('http') ? att.filePath : `${FILE_BASE_URL}/${att.filePath}`;
        Linking.openURL(url).catch(err => {
            console.log('Failed to open external link:', err);
            Alert.alert("Error", "Could not open external link.");
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString();
    };

    const renderPost = ({ item }) => {
        const isOwner = item.author?.id === user?.id || item.userId === user?.id;
        const userReaction = item.reactions?.find(r => r.userId === user?.id);
        const commentsCount = item.comments?.length || 0;
        const isShowingComments = activePostId === item.id;
        const isShowingAttach = attachPostId === item.id;

        return (
            <View style={styles.postCard}>
                {/* Header */}
                <View style={styles.postHeader}>
                    <View style={styles.authorAvatar}>
                        <Text style={styles.avatarText}>{item.author?.firstName?.[0]?.toUpperCase() || 'U'}</Text>
                    </View>
                    <View style={styles.authorInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={styles.authorName}>{item.author?.firstName} {item.author?.lastName}</Text>
                            {item.author?.role && (
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleBadgeText}>{item.author.role}</Text>
                                </View>
                            )}
                            {item.isEdited && (
                                <Text style={styles.editedLabel}>(edited)</Text>
                            )}
                        </View>
                        <Text style={styles.postTime}>{formatTime(item.createdAt)}</Text>
                    </View>
                    {/* Owner actions */}
                    {isOwner && (
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => setAttachPostId(isShowingAttach ? null : item.id)}
                            >
                                <Ionicons name="attach-outline" size={18} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => { setEditPostModal(item); setEditPostContent(item.content); }}
                            >
                                <Ionicons name="pencil-outline" size={18} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => setDeletePostConfirm(item.id)}
                            >
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Content */}
                <Text style={styles.postContent}>{item.content}</Text>

                {/* Image preview for image attachments */}
                {item.attachments?.some(a => /jpg|jpeg|png|gif/i.test(a.fileExtension || a.fileName)) && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            const img = item.attachments.find(a => /jpg|jpeg|png|gif/i.test(a.fileExtension || a.fileName));
                            if (img) openFile(img);
                        }}
                    >
                        <Image
                            source={{
                                uri: item.attachments.find(a => /jpg|jpeg|png|gif/i.test(a.fileExtension || a.fileName))?.filePath?.startsWith('http')
                                    ? item.attachments.find(a => /jpg|jpeg|png|gif/i.test(a.fileExtension || a.fileName)).filePath
                                    : `${FILE_BASE_URL}/${item.attachments.find(a => /jpg|jpeg|png|gif/i.test(a.fileExtension || a.fileName)).filePath}`
                            }}
                            style={styles.postImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}

                {/* All attachments list */}
                {item.attachments?.length > 0 && (
                    <View style={styles.attachmentsList}>
                        {item.attachments.map(att => (
                            <View key={att.id} style={styles.attachmentRow}>
                                <TouchableOpacity
                                    style={styles.attachmentBadge}
                                    onPress={() => openFile(att)}
                                >
                                    <Ionicons
                                        name={/jpg|jpeg|png|gif/i.test(att.fileExtension || att.fileName) ? 'image-outline'
                                            : /mp4|mov|avi/i.test(att.fileExtension || att.fileName) ? 'videocam-outline'
                                                : 'document-attach-outline'}
                                        size={14}
                                        color={COLORS.primary}
                                    />
                                    <Text style={styles.attachmentName} numberOfLines={1}>{att.fileName}</Text>
                                    {att.fileSize ? (
                                        <Text style={styles.attachmentSize}>{formatFileSize(att.fileSize)}</Text>
                                    ) : null}
                                </TouchableOpacity>
                                {isOwner && (
                                    <TouchableOpacity
                                        onPress={() => setDeleteAttachConfirm({ postId: item.id, id: att.id })}
                                        style={{ padding: 4 }}
                                    >
                                        <Ionicons name="close-circle" size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Attach files panel (owner only) */}
                {isShowingAttach && (
                    <View style={styles.attachPanel}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <TouchableOpacity style={styles.attachPickBtn} onPress={handleAttachFilePick}>
                                <Ionicons name="folder-open-outline" size={16} color="#fff" />
                                <Text style={styles.attachPickBtnText}>Select Files</Text>
                            </TouchableOpacity>
                            <Text style={styles.attachFileCount}>
                                {attachFiles.length > 0 ? `${attachFiles.length} file(s) selected` : 'No files selected'}
                            </Text>
                        </View>
                        {attachFiles.length > 0 && (
                            <>
                                {attachFiles.map((f, i) => (
                                    <View key={i} style={styles.attachFileRow}>
                                        <Ionicons name="document-outline" size={14} color={COLORS.primary} />
                                        <Text style={styles.attachFileName} numberOfLines={1}>{f.name}</Text>
                                        <Text style={styles.attachFileSize}>{formatFileSize(f.size)}</Text>
                                        <TouchableOpacity onPress={() => setAttachFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                            <Ionicons name="close-circle" size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                    <TouchableOpacity
                                        style={[styles.attachUploadBtn, isUploading && { opacity: 0.6 }]}
                                        onPress={handleUploadAttachments}
                                        disabled={isUploading}
                                    >
                                        {isUploading
                                            ? <ActivityIndicator size="small" color="#fff" />
                                            : <Text style={styles.attachUploadBtnText}>Upload</Text>}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.attachCancelBtn}
                                        onPress={() => { setAttachPostId(null); setAttachFiles([]); }}
                                    >
                                        <Text style={styles.attachCancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                )}

                <View style={styles.divider} />

                {/* Reactions + Comment toggle */}
                <View style={styles.actionsRow}>
                    {/* 3 always-visible reaction buttons with counts */}
                    <View style={styles.reactionsGroup}>
                        {Object.entries(REACTION_CONFIG).map(([type, config]) => {
                            const count = item.reactions?.filter(r => r.reactionType === type).length ?? 0;
                            const isActive = userReaction?.reactionType === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.reactionBtn, isActive && { borderColor: config.color, backgroundColor: config.color + '18' }]}
                                    onPress={() => toggleReaction(item.id, type, user?.id)}
                                >
                                    <Text style={styles.reactionBtnEmoji}>{config.emoji}</Text>
                                    <Text style={[styles.reactionBtnCount, isActive && { color: config.color }]}>
                                        {count}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => setActivePostId(isShowingComments ? null : item.id)}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color={isShowingComments ? COLORS.primary : 'rgba(255,255,255,0.5)'} />
                        <Text style={[styles.actionText, isShowingComments && { color: COLORS.primary }]}>
                            {commentsCount > 0 ? commentsCount : 'Comment'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Comments section */}
                {isShowingComments && (
                    <View style={styles.commentSection}>
                        {item.comments?.map(comment => {
                            const isCommentOwner = comment.author?.id === user?.id || comment.userId === user?.id;
                            const isEditingThis = editingComment?.id === comment.id;
                            return (
                                <View key={comment.id} style={styles.commentItem}>
                                    <View style={styles.commentAvatar}>
                                        <Text style={styles.commentAvatarText}>{comment.author?.firstName?.[0]?.toUpperCase() || '?'}</Text>
                                    </View>
                                    <View style={styles.commentBubble}>
                                        <View style={styles.commentHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                                                <Text style={styles.commentAuthor}>{comment.author?.firstName} {comment.author?.lastName}</Text>
                                                <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
                                                {comment.isEdited && <Text style={styles.editedLabel}>(edited)</Text>}
                                            </View>
                                            {isCommentOwner && !isEditingThis && (
                                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                                    <TouchableOpacity onPress={() => { setEditingComment({ postId: item.id, id: comment.id }); setEditCommentText(comment.content); }}>
                                                        <Ionicons name="pencil-outline" size={13} color="rgba(255,255,255,0.4)" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => setDeleteCommentConfirm({ postId: item.id, id: comment.id })}>
                                                        <Ionicons name="trash-outline" size={13} color="#EF4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                        {isEditingThis ? (
                                            <View style={{ marginTop: 4 }}>
                                                <TextInput
                                                    style={styles.commentInput}
                                                    value={editCommentText}
                                                    onChangeText={setEditCommentText}
                                                    placeholder="Edit comment..."
                                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                                    multiline
                                                />
                                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                                                    <TouchableOpacity
                                                        style={styles.commentSaveBtn}
                                                        onPress={handleUpdateComment}
                                                        disabled={!editCommentText.trim()}
                                                    >
                                                        <Text style={styles.commentSaveBtnText}>Save</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => { setEditingComment(null); setEditCommentText(''); }}>
                                                        <Text style={styles.commentCancelText}>Cancel</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : (
                                            <Text style={styles.commentText}>{comment.content}</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                        {/* New comment input */}
                        <View style={styles.commentInputRow}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={commentText}
                                onChangeText={setCommentText}
                                onSubmitEditing={() => handleAddComment(item.id)}
                                returnKeyType="send"
                            />
                            <TouchableOpacity
                                onPress={() => handleAddComment(item.id)}
                                disabled={!commentText.trim()}
                            >
                                <Ionicons name="send" size={20} color={commentText.trim() ? COLORS.primary : 'rgba(255,255,255,0.2)'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
            <PremiumUpgradeModal visible={upgradeModalVisible} onClose={() => setUpgradeModalVisible(false)} />

            <LinearGradient colors={['#0A2540', '#0D1B2A', '#080C14']} style={styles.heroBanner}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                        <Ionicons name="menu" size={26} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.titleGroup}>
                        <Text style={styles.headerTitle}>Batch Lounge</Text>
                        <Text style={styles.headerSubtitle}>
                            {posts.length} post{posts.length !== 1 ? 's' : ''} · Discuss with your batchmates
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={60} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>No posts yet. Be the first to say hi!</Text>
                        </View>
                    )
                }
            />

            {/* Composer */}
            {isPremium ? (
                <View style={styles.composerCard}>
                    <View style={styles.composerRow}>
                        <TouchableOpacity style={styles.attachmentButton} onPress={handleFilePick}>
                            <Ionicons name="attach-outline" size={24} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                        <View style={styles.verticalDivider} />
                        <TextInput
                            style={styles.composerInput}
                            placeholder="Write a message..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            multiline
                            value={newPost}
                            onChangeText={setNewPost}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, (!newPost.trim() && selectedFiles.length === 0) && styles.sendButtonDisabled]}
                            disabled={(!newPost.trim() && selectedFiles.length === 0) || isLoading}
                            onPress={handleCreatePost}
                        >
                            {isLoading
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Ionicons name="send" size={20} color={(!newPost.trim() && selectedFiles.length === 0) ? 'rgba(255,255,255,0.2)' : COLORS.primary} />}
                        </TouchableOpacity>
                    </View>
                    {selectedFiles.length > 0 && (
                        <View style={styles.previewContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {selectedFiles.map((file) => (
                                    <View key={file.uri} style={styles.filePreview}>
                                        <Ionicons name={file.type?.includes('image') ? 'image' : 'document'} size={18} color={COLORS.primary} />
                                        <Text style={styles.previewName} numberOfLines={1}>{file.name}</Text>
                                        <TouchableOpacity style={styles.removeFileBtn} onPress={() => removeFile(file.uri)}>
                                            <Ionicons name="close-circle" size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.composerCard, { alignItems: 'center', paddingVertical: 16, marginBottom: 16 }]}
                    onPress={() => setUpgradeModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="lock-closed" size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
                    <Text style={[styles.headerTitle, { fontSize: 16, textAlign: 'center' }]}>Batch Lounge is Premium</Text>
                    <Text style={[styles.headerSubtitle, { textAlign: 'center', marginTop: 2, fontSize: 11 }]}>
                        Enroll in a batch to participate in discussions.
                    </Text>
                </TouchableOpacity>
            )}

            {/* Edit Post Modal */}
            <Modal visible={!!editPostModal} transparent animationType="slide" onRequestClose={() => setEditPostModal(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="pencil" size={20} color={COLORS.primary} />
                            <Text style={styles.modalTitle}>Edit Post</Text>
                            <TouchableOpacity onPress={() => { setEditPostModal(null); setEditPostContent(''); }}>
                                <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.modalTextarea}
                            value={editPostContent}
                            onChangeText={setEditPostContent}
                            placeholder="What would you like to share?"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            multiline
                            numberOfLines={5}
                        />
                        <Text style={styles.charCount}>{editPostContent.length} characters</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setEditPostModal(null); setEditPostContent(''); }}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalConfirmBtn, !editPostContent.trim() && { opacity: 0.5 }]}
                                onPress={handleUpdatePost}
                                disabled={!editPostContent.trim()}
                            >
                                <Text style={styles.modalConfirmText}>Update Post</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Post Confirm Modal */}
            <Modal visible={!!deletePostConfirm} transparent animationType="fade" onRequestClose={() => setDeletePostConfirm(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="alert-circle" size={20} color="#EF4444" />
                            <Text style={styles.modalTitle}>Delete Post</Text>
                            <TouchableOpacity onPress={() => setDeletePostConfirm(null)}>
                                <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalBody}>
                            Are you sure you want to delete this post? This will also remove all comments and reactions.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setDeletePostConfirm(null)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleDeletePost}>
                                <Text style={styles.modalDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Comment Confirm Modal */}
            <Modal visible={!!deleteCommentConfirm} transparent animationType="fade" onRequestClose={() => setDeleteCommentConfirm(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="alert-circle" size={20} color="#EF4444" />
                            <Text style={styles.modalTitle}>Delete Comment</Text>
                            <TouchableOpacity onPress={() => setDeleteCommentConfirm(null)}>
                                <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalBody}>Are you sure you want to delete this comment?</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setDeleteCommentConfirm(null)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleDeleteComment}>
                                <Text style={styles.modalDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Attachment Confirm Modal */}
            <Modal visible={!!deleteAttachConfirm} transparent animationType="fade" onRequestClose={() => setDeleteAttachConfirm(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="alert-circle" size={20} color="#EF4444" />
                            <Text style={styles.modalTitle}>Delete Attachment</Text>
                            <TouchableOpacity onPress={() => setDeleteAttachConfirm(null)}>
                                <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalBody}>Are you sure you want to delete this attachment? This cannot be undone.</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setDeleteAttachConfirm(null)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleDeleteAttachment}>
                                <Text style={styles.modalDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
};

export default CommunityScreen;
