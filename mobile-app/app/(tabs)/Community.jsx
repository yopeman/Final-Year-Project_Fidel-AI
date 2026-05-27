import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    RefreshControl, StatusBar, KeyboardAvoidingView, Platform,
    ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentPicker } from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useCommunityStore } from '../../src/stores/communityStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants/theme';
import PremiumMenu from '../../src/components/PremiumMenu';
import PremiumUpgradeModal from '../../src/components/PremiumUpgradeModal';
import PostCard from '../../src/components/community/PostCard';
import PostComposer from '../../src/components/community/PostComposer';
import styles from '../styles/communityStyle';

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
    const [refreshing, setRefreshing] = useState(false);

    // Edit post modal
    const [editPostModal, setEditPostModal] = useState(null);
    const [editPostContent, setEditPostContent] = useState('');

    // Delete post confirm
    const [deletePostConfirm, setDeletePostConfirm] = useState(null);

    // Delete comment confirm
    const [deleteCommentConfirm, setDeleteCommentConfirm] = useState(null);

    // Delete attachment confirm
    const [deleteAttachConfirm, setDeleteAttachConfirm] = useState(null);

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

    const handleCreatePost = async (content) => {
        if (!batchId) return false;
        const res = await createPost(batchId, content, selectedFiles);
        if (res.success) {
            clearFiles();
            return true;
        }
        Alert.alert('Error', res.error || 'Failed to share post. Please try again.');
        return false;
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
        if (res.success) setDeletePostConfirm(null);
        else Alert.alert('Error', res.error || 'Failed to delete post.');
    };

    const handleDeleteComment = async () => {
        if (!deleteCommentConfirm) return;
        const res = await deleteComment(deleteCommentConfirm.postId, deleteCommentConfirm.id);
        if (res.success) setDeleteCommentConfirm(null);
        else Alert.alert('Error', res.error || 'Failed to delete comment.');
    };

    const handleDeleteAttachment = async () => {
        if (!deleteAttachConfirm) return;
        const res = await deleteAttachment(deleteAttachConfirm.postId, deleteAttachConfirm.id);
        if (res.success) setDeleteAttachConfirm(null);
        else Alert.alert('Error', res.error || 'Failed to delete attachment.');
    };

    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', multiple: true, copyToCacheDirectory: true,
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
                type: '*/*', multiple: true, copyToCacheDirectory: true,
            });
            if (!result.canceled) {
                return result.assets.map(a => ({
                    uri: a.uri, name: a.name, size: a.size, type: a.mimeType, file: a.file
                }));
            }
        } catch (e) {
            console.log('File pick error:', e);
        }
        return null;
    };

    const handleAddComment = async (postId, content) => {
        const res = await addComment(postId, content);
        if (res.success) return true;
        Alert.alert('Error', res.error || 'Failed to add comment.');
        return false;
    };

    const handleUpdateComment = async (postId, commentId, content) => {
        const res = await updateComment(postId, commentId, content);
        if (res.success) return true;
        Alert.alert('Error', res.error || 'Failed to update comment.');
        return false;
    };

    const handleUploadAttachments = async (postId, files) => {
        const res = await uploadAttachments(postId, files);
        if (res.success) return true;
        Alert.alert('Error', res.error || 'Failed to upload files.');
        return false;
    };

    const renderPost = ({ item }) => (
        <PostCard
            item={item}
            currentUser={user}
            onToggleReaction={toggleReaction}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={(postId, id) => setDeleteCommentConfirm({ postId, id })}
            onEditPost={(post) => { setEditPostModal(post); setEditPostContent(post.content); }}
            onDeletePost={(postId) => setDeletePostConfirm(postId)}
            onAttachFiles={handleAttachFilePick}
            onUploadAttachments={handleUploadAttachments}
            onDeleteAttachment={(postId, id) => setDeleteAttachConfirm({ postId, id })}
        />
    );

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
                keyboardShouldPersistTaps="handled"
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

            <PostComposer
                isPremium={isPremium}
                onUpgrade={() => setUpgradeModalVisible(true)}
                onSubmit={handleCreatePost}
                onFilePick={handleFilePick}
                selectedFiles={selectedFiles}
                onRemoveFile={removeFile}
                isSubmitting={isLoading}
            />

            {/* Edit Post Modal */}
            <Modal visible={!!editPostModal} transparent animationType="slide" onRequestClose={() => setEditPostModal(null)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
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
                                autoFocus
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
                </KeyboardAvoidingView>
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