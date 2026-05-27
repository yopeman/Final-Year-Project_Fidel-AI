import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Platform, Animated, Easing,
    Modal, ScrollView, Image, Alert, Linking
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCommunityStore } from '../../src/stores/communityStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS, API_BASE_URL } from '../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import FileViewerModal from '../../src/components/FileViewerModal';
import styles, { card } from '../styles/communityIdStyle';

const FILE_BASE_URL = API_BASE_URL.replace('/graphql', '');

// ─────────────────────────────────────────────
// Reaction emojis
// ─────────────────────────────────────────────
const REACTIONS = [
    { type: 'LIKE', emoji: '👍', color: '#3B82F6' },
    { type: 'LOVE', emoji: '❤️', color: '#EF4444' },
    { type: 'DISLIKE', emoji: '👎', color: '#6B7280' },
];

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTime = (dateStr) => new Date(dateStr).toLocaleString();

// ─────────────────────────────────────────────
// Single Post Card
// ─────────────────────────────────────────────
function PostCard({ item, currentUserId, onReact, onDeletePost, onEditPost, onDeleteAttachment, onUploadAttachments }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [sending, setSending] = useState(false);
    const [editingComment, setEditingComment] = useState(null); // { id, content }
    const [editCommentText, setEditCommentText] = useState('');
    const [deleteCommentConfirm, setDeleteCommentConfirm] = useState(null); // commentId
    const [attachFiles, setAttachFiles] = useState([]);
    const [showAttachPanel, setShowAttachPanel] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const emojiAnim = useRef(new Animated.Value(0)).current;
    const commentInputRef = useRef(null);
    const editCommentInputRef = useRef(null);
    const { addComment, updateComment, deleteComment } = useCommunityStore();

    const isOwner = item.author?.id === currentUserId || item.userId === currentUserId;
    const userReaction = item.reactions?.find(r => r.userId === currentUserId);
    const commentCount = item.comments?.length || 0;

    const handleComment = async () => {
        if (!commentText.trim()) return;
        setSending(true);
        await addComment(item.id, commentText.trim());
        setSending(false);
        setCommentText('');
    };

    const handleUpdateComment = async () => {
        if (!editingComment || !editCommentText.trim()) return;
        await updateComment(item.id, editingComment.id, editCommentText.trim());
        setEditingComment(null);
        setEditCommentText('');
    };

    const handleDeleteComment = async () => {
        if (!deleteCommentConfirm) return;
        await deleteComment(item.id, deleteCommentConfirm);
        setDeleteCommentConfirm(null);
    };

    const handleAttachFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: true, copyToCacheDirectory: true });
            if (!result.canceled) {
                const files = result.assets.map(a => ({ uri: a.uri, name: a.name, size: a.size, type: a.mimeType, file: a.file }));
                setAttachFiles(prev => [...prev, ...files]);
            }
        } catch (e) { console.log('File pick error:', e); }
    };

    const handleUpload = async () => {
        if (!attachFiles.length) return;
        setIsUploading(true);
        const res = await onUploadAttachments(item.id, attachFiles);
        setIsUploading(false);
        if (res?.success) { setAttachFiles([]); setShowAttachPanel(false); }
        else Alert.alert('Error', res?.error || 'Upload failed.');
    };

    const openFile = (att) => {
        const url = att.filePath?.startsWith('http') ? att.filePath : `${FILE_BASE_URL}/${att.filePath}`;
        Linking.openURL(url).catch(err => {
            console.log('Failed to open external link:', err);
            Alert.alert("Error", "Could not open external link.");
        });
    };

    const emojiScale = emojiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
    const emojiOpacity = emojiAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    return (
        <View style={card.wrapper}>
            {/* Author row */}
            <View style={card.header}>
                <View style={card.avatar}>
                    <Text style={card.avatarText}>{item.author?.firstName?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={card.authorName}>{item.author?.firstName} {item.author?.lastName}</Text>
                        {item.author?.role && (
                            <View style={card.roleBadge}>
                                <Text style={card.roleBadgeText}>{item.author.role}</Text>
                            </View>
                        )}
                        {item.isEdited && <Text style={card.editedLabel}>(edited)</Text>}
                    </View>
                    <Text style={card.date}>{formatTime(item.createdAt)}</Text>
                </View>
                {isOwner && (
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                        <TouchableOpacity style={card.iconBtn} onPress={() => setShowAttachPanel(!showAttachPanel)}>
                            <Ionicons name="attach-outline" size={17} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                        <TouchableOpacity style={card.iconBtn} onPress={() => onEditPost(item)}>
                            <Ionicons name="pencil-outline" size={17} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                        <TouchableOpacity style={card.iconBtn} onPress={() => onDeletePost(item.id)}>
                            <Ionicons name="trash-outline" size={17} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Content */}
            <Text style={card.content}>{item.content}</Text>

            {/* Image preview */}
            {item.attachments?.some(a => /jpg|jpeg|png|gif/i.test(a.fileExtension || a.fileName)) && (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        const img = item.attachments.find(a => /jpg|jpeg|png|gif/i.test(a.fileExtension || a.fileName));
                        if (img) openFile(img);
                    }}
                >
                    <Image
                        source={{ uri: (() => {
                            const img = item.attachments.find(a => /jpg|jpeg|png|gif/i.test(a.fileExtension || a.fileName));
                            return img?.filePath?.startsWith('http') ? img.filePath : `${FILE_BASE_URL}/${img?.filePath}`;
                        })() }}
                        style={card.postImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            )}

            {/* Attachments list */}
            {item.attachments?.length > 0 && (
                <View style={card.attachmentsList}>
                    {item.attachments.map(att => (
                        <View key={att.id} style={card.attachmentRow}>
                            <TouchableOpacity style={card.attachmentBadge} onPress={() => openFile(att)}>
                                <Ionicons
                                    name={/jpg|jpeg|png|gif/i.test(att.fileExtension || att.fileName) ? 'image-outline'
                                        : /mp4|mov|avi/i.test(att.fileExtension || att.fileName) ? 'videocam-outline'
                                        : 'document-attach-outline'}
                                    size={14}
                                    color={COLORS.primary}
                                />
                                <Text style={card.attachmentName} numberOfLines={1}>{att.fileName}</Text>
                                {att.fileSize ? <Text style={card.attachmentSize}>{formatFileSize(att.fileSize)}</Text> : null}
                            </TouchableOpacity>
                            {isOwner && (
                                <TouchableOpacity onPress={() => onDeleteAttachment(item.id, att.id)} style={{ padding: 4 }}>
                                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Attach panel */}
            {showAttachPanel && isOwner && (
                <View style={card.attachPanel}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <TouchableOpacity style={card.attachPickBtn} onPress={handleAttachFilePick}>
                            <Ionicons name="folder-open-outline" size={15} color="#000" />
                            <Text style={card.attachPickBtnText}>Select Files</Text>
                        </TouchableOpacity>
                        <Text style={card.attachFileCount}>{attachFiles.length > 0 ? `${attachFiles.length} selected` : 'No files'}</Text>
                    </View>
                    {attachFiles.map((f, i) => (
                        <View key={i} style={card.attachFileRow}>
                            <Ionicons name="document-outline" size={13} color={COLORS.primary} />
                            <Text style={card.attachFileName} numberOfLines={1}>{f.name}</Text>
                            <Text style={card.attachFileSize}>{formatFileSize(f.size)}</Text>
                            <TouchableOpacity onPress={() => setAttachFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                <Ionicons name="close-circle" size={15} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {attachFiles.length > 0 && (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                            <TouchableOpacity style={[card.attachUploadBtn, isUploading && { opacity: 0.6 }]} onPress={handleUpload} disabled={isUploading}>
                                {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={card.attachUploadBtnText}>Upload</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={card.attachCancelBtn} onPress={() => { setShowAttachPanel(false); setAttachFiles([]); }}>
                                <Text style={card.attachCancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Actions */}
            <View style={card.footer}>
                {/* 3 always-visible reaction buttons with counts */}
                <View style={card.reactionsGroup}>
                    {REACTIONS.map(r => {
                        const count = item.reactions?.filter(rx => rx.reactionType === r.type).length ?? 0;
                        const isActive = userReaction?.reactionType === r.type;
                        return (
                            <TouchableOpacity
                                key={r.type}
                                style={[card.reactionBtn, isActive && { borderColor: r.color, backgroundColor: r.color + '18' }]}
                                onPress={() => onReact(item.id, r.type)}
                            >
                                <Text style={card.reactionBtnEmoji}>{r.emoji}</Text>
                                <Text style={[card.reactionBtnCount, isActive && { color: r.color }]}>{count}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <TouchableOpacity style={card.action} onPress={() => setShowComments(!showComments)}>
                    <Ionicons name="chatbubble-outline" size={18} color={showComments ? COLORS.primary : '#9CA3AF'} />
                    <Text style={card.actionNum}>{commentCount > 0 ? commentCount : ''}</Text>
                </TouchableOpacity>
            </View>

            {/* Comments section */}
            {showComments && (
                <View style={card.commentSection}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        {item.comments?.map((c) => {
                            const isCommentOwner = c.author?.id === currentUserId || c.userId === currentUserId;
                            const isEditingThis = editingComment?.id === c.id;
                            return (
                                <View key={c.id} style={card.commentBubble}>
                                    <View style={card.commentAvatar}>
                                        <Text style={card.commentAvatarText}>{c.author?.firstName?.[0]?.toUpperCase() || '?'}</Text>
                                    </View>
                                    <View style={card.commentContent}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                                            <Text style={card.commentAuthor}>{c.author?.firstName} {c.author?.lastName}</Text>
                                            <Text style={card.commentTime}>{formatTime(c.createdAt)}</Text>
                                            {c.isEdited && <Text style={card.editedLabel}>(edited)</Text>}
                                            {isCommentOwner && !isEditingThis && (
                                                <View style={{ flexDirection: 'row', gap: 6, marginLeft: 'auto' }}>
                                                    <TouchableOpacity onPress={() => { setEditingComment(c); setEditCommentText(c.content); }}>
                                                        <Ionicons name="pencil-outline" size={12} color="rgba(255,255,255,0.35)" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => setDeleteCommentConfirm(c.id)}>
                                                        <Ionicons name="trash-outline" size={12} color="#EF4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                        {isEditingThis ? (
                                            <View>
                                                <TextInput
                                                    ref={editCommentInputRef}
                                                    style={card.input}
                                                    value={editCommentText}
                                                    onChangeText={setEditCommentText}
                                                    placeholder="Edit comment..."
                                                    placeholderTextColor="#4B5563"
                                                    multiline
                                                />
                                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                                                    <TouchableOpacity style={card.saveBtn} onPress={handleUpdateComment} disabled={!editCommentText.trim()}>
                                                        <Text style={card.saveBtnText}>Save</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => { setEditingComment(null); setEditCommentText(''); }}>
                                                        <Text style={card.cancelText}>Cancel</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : (
                                            <Text style={card.commentText}>{c.content}</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}

                        <View style={card.commentInput}>
                            <TextInput
                                ref={commentInputRef}
                                style={card.input}
                                placeholder="Write a comment..."
                                placeholderTextColor="#4B5563"
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                onSubmitEditing={handleComment}
                                returnKeyType="send"
                            />
                            <TouchableOpacity
                                style={[card.sendBtn, !commentText.trim() && card.sendBtnDisabled]}
                                onPress={handleComment}
                                disabled={!commentText.trim() || sending}
                            >
                                {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={16} color="#fff" />}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            )}

            {/* Delete comment confirm */}
            <Modal visible={!!deleteCommentConfirm} transparent animationType="fade" onRequestClose={() => setDeleteCommentConfirm(null)}>
                <View style={card.modalOverlay}>
                    <View style={card.modalCard}>
                        <Text style={card.modalTitle}>Delete Comment</Text>
                        <Text style={card.modalBody}>Are you sure you want to delete this comment?</Text>
                        <View style={card.modalActions}>
                            <TouchableOpacity style={card.modalCancelBtn} onPress={() => setDeleteCommentConfirm(null)}>
                                <Text style={card.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={card.modalDeleteBtn} onPress={handleDeleteComment}>
                                <Text style={card.modalDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ─────────────────────────────────────────────
// Community Screen
// ─────────────────────────────────────────────
export default function CommunityScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { posts, getPosts, createPost, postReaction, updatePost, deletePost, uploadAttachments, deleteAttachment, isLoading } = useCommunityStore();
    const { checkEnrollmentStatus } = useBatchStore();
    const [isEnrolled, setIsEnrolled] = useState(null);
    const [newPostContent, setNewPostContent] = useState('');
    const [sending, setSending] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Edit post modal
    const [editPostModal, setEditPostModal] = useState(null);
    const [editPostContent, setEditPostContent] = useState('');

    // Delete post confirm
    const [deletePostConfirm, setDeletePostConfirm] = useState(null);

    // Delete attachment confirm
    const [deleteAttachConfirm, setDeleteAttachConfirm] = useState(null); // { postId, id }

    const inputRef = useRef(null);
    const editPostInputRef = useRef(null);

    useEffect(() => {
        if (id) checkAccess();
    }, [id]);

    const checkAccess = async () => {
        const result = await checkEnrollmentStatus(id);
        if (result.isEnrolled && (result.status === 'ENROLLED' || result.status === 'COMPLETED')) {
            setIsEnrolled(true);
            getPosts(id);
        } else {
            setIsEnrolled(false);
        }
    };

    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: true, copyToCacheDirectory: true });
            if (!result.canceled) {
                const files = result.assets.map(a => ({ uri: a.uri, name: a.name, size: a.size, type: a.mimeType, file: a.file }));
                setSelectedFiles(prev => [...prev, ...files]);
            }
        } catch (e) { console.log('File pick error:', e); }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && selectedFiles.length === 0) return;
        setSending(true);
        await createPost(id, newPostContent.trim(), selectedFiles);
        setSending(false);
        setNewPostContent('');
        setSelectedFiles([]);
    };

    const handleUpdatePost = async () => {
        if (!editPostModal || !editPostContent.trim()) return;
        const res = await updatePost(editPostModal.id, editPostContent.trim());
        if (res.success) { setEditPostModal(null); setEditPostContent(''); }
        else Alert.alert('Error', res.error || 'Failed to update post.');
    };

    const handleDeletePost = async () => {
        if (!deletePostConfirm) return;
        const res = await deletePost(deletePostConfirm);
        if (res.success) setDeletePostConfirm(null);
        else Alert.alert('Error', res.error || 'Failed to delete post.');
    };

    const handleDeleteAttachment = async () => {
        if (!deleteAttachConfirm) return;
        const res = await deleteAttachment(deleteAttachConfirm.postId, deleteAttachConfirm.id);
        if (res.success) setDeleteAttachConfirm(null);
        else Alert.alert('Error', res.error || 'Failed to delete attachment.');
    };

    const handleUploadAttachments = async (postId, files) => {
        return await uploadAttachments(postId, files);
    };

    const handleReact = (postId, reactionType) => postReaction(postId, reactionType);

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const ListHeader = () => (
        <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Batch Discussion</Text>
            <Text style={styles.listSub}>{posts.length} post{posts.length !== 1 ? 's' : ''} · Share ideas with your class</Text>
        </View>
    );

    const ListEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={56} color="#374151" />
            <Text style={styles.emptyTitle}>Start the conversation</Text>
            <Text style={styles.emptyDesc}>Be the first to post something to this batch community.</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <View style={styles.container}>
                <LinearGradient colors={['#0A1628', '#0D2137', '#0A1628']} style={StyleSheet.absoluteFillObject} />

                {/* Header */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.topBarCenter}>
                        <Ionicons name="people" size={18} color={COLORS.primary} />
                        <Text style={styles.topBarTitle}>Community</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {isEnrolled === false ? (
                    <View style={[styles.emptyContainer, { justifyContent: 'center', flex: 1 }]}>
                        <Ionicons name="lock-closed" size={64} color="#F59E0B" />
                        <Text style={[styles.emptyTitle, { color: '#fff', marginTop: 16 }]}>Premium Access Required</Text>
                        <Text style={styles.emptyDesc}>Join this batch to access the community discussion.</Text>
                        <TouchableOpacity
                            style={{ marginTop: 24, backgroundColor: '#F59E0B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                            onPress={() => router.back()}
                        >
                            <Text style={{ fontWeight: 'bold', color: '#1A1A2E' }}>Go to Enrollment</Text>
                        </TouchableOpacity>
                    </View>
                ) : isLoading || isEnrolled === null ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading community...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={posts}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={ListHeader}
                        ListEmptyComponent={ListEmpty}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <PostCard
                                item={item}
                                currentUserId={user?.id}
                                onReact={handleReact}
                                onEditPost={(post) => { setEditPostModal(post); setEditPostContent(post.content); }}
                                onDeletePost={(postId) => setDeletePostConfirm(postId)}
                                onDeleteAttachment={(postId, attId) => setDeleteAttachConfirm({ postId, id: attId })}
                                onUploadAttachments={handleUploadAttachments}
                            />
                        )}
                    />
                )}

                {/* Compose bar */}
                <View style={styles.composeBar}>
                    {selectedFiles.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                            {selectedFiles.map((f, i) => (
                                <View key={i} style={card.attachFileRow}>
                                    <Ionicons name="document-outline" size={13} color={COLORS.primary} />
                                    <Text style={card.attachFileName} numberOfLines={1}>{f.name}</Text>
                                    <Text style={card.attachFileSize}>{formatFileSize(f.size)}</Text>
                                    <TouchableOpacity onPress={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                        <Ionicons name="close-circle" size={15} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                    <View style={styles.composeInner}>
                        <TouchableOpacity onPress={handleFilePick} style={{ padding: 4 }}>
                            <Ionicons name="attach-outline" size={22} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                        <TextInput
                            ref={inputRef}
                            style={styles.composeInput}
                            placeholder="Share something with the class..."
                            placeholderTextColor="#4B5563"
                            value={newPostContent}
                            onChangeText={setNewPostContent}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.postBtn, (!newPostContent.trim() && selectedFiles.length === 0) && styles.postBtnDisabled]}
                            onPress={handleCreatePost}
                            disabled={(!newPostContent.trim() && selectedFiles.length === 0) || sending}
                        >
                            {sending ? <ActivityIndicator size="small" color="#1A1A2E" /> : <Ionicons name="send" size={18} color="#1A1A2E" />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Edit Post Modal */}
                <Modal visible={!!editPostModal} transparent animationType="slide" onRequestClose={() => setEditPostModal(null)}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={card.modalOverlay}>
                            <View style={card.modalCard}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                    <Ionicons name="pencil" size={18} color={COLORS.primary} />
                                    <Text style={[card.modalTitle, { flex: 1 }]}>Edit Post</Text>
                                    <TouchableOpacity onPress={() => { setEditPostModal(null); setEditPostContent(''); }}>
                                        <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    ref={editPostInputRef}
                                    style={[card.input, { minHeight: 100, textAlignVertical: 'top', marginBottom: 8 }]}
                                    value={editPostContent}
                                    onChangeText={setEditPostContent}
                                    placeholder="What would you like to share?"
                                    placeholderTextColor="#4B5563"
                                    multiline
                                    autoFocus
                                />
                                <Text style={{ color: '#4B5563', fontSize: 11, textAlign: 'right', marginBottom: 14 }}>{editPostContent.length} characters</Text>
                                <View style={card.modalActions}>
                                    <TouchableOpacity style={card.modalCancelBtn} onPress={() => { setEditPostModal(null); setEditPostContent(''); }}>
                                        <Text style={card.modalCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[card.modalConfirmBtn, !editPostContent.trim() && { opacity: 0.5 }]} onPress={handleUpdatePost} disabled={!editPostContent.trim()}>
                                        <Text style={card.modalConfirmText}>Update Post</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Delete Post Confirm */}
                <Modal visible={!!deletePostConfirm} transparent animationType="fade" onRequestClose={() => setDeletePostConfirm(null)}>
                    <View style={card.modalOverlay}>
                        <View style={card.modalCard}>
                            <Text style={card.modalTitle}>Delete Post</Text>
                            <Text style={card.modalBody}>Are you sure? This will also remove all comments and reactions.</Text>
                            <View style={card.modalActions}>
                                <TouchableOpacity style={card.modalCancelBtn} onPress={() => setDeletePostConfirm(null)}>
                                    <Text style={card.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={card.modalDeleteBtn} onPress={handleDeletePost}>
                                    <Text style={card.modalDeleteText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Delete Attachment Confirm */}
                <Modal visible={!!deleteAttachConfirm} transparent animationType="fade" onRequestClose={() => setDeleteAttachConfirm(null)}>
                    <View style={card.modalOverlay}>
                        <View style={card.modalCard}>
                            <Text style={card.modalTitle}>Delete Attachment</Text>
                            <Text style={card.modalBody}>Are you sure you want to delete this attachment? This cannot be undone.</Text>
                            <View style={card.modalActions}>
                                <TouchableOpacity style={card.modalCancelBtn} onPress={() => setDeleteAttachConfirm(null)}>
                                    <Text style={card.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={card.modalDeleteBtn} onPress={handleDeleteAttachment}>
                                    <Text style={card.modalDeleteText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </KeyboardAvoidingView>
    );
}