import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    Image, ActivityIndicator, Alert, Linking, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { API_BASE_URL } from '../../constants';
import styles from '../../../app/styles/communityStyle';
const FILE_BASE_URL = API_BASE_URL.replace('/graphql', '');

const REACTION_CONFIG = {
    LIKE: { icon: 'thumbs-up', color: '#3B82F6', label: 'Like', emoji: '👍' },
    DISLIKE: { icon: 'thumbs-down', color: '#6B7280', label: 'Dislike', emoji: '👎' },
    LOVE: { icon: 'heart', color: '#EF4444', label: 'Love', emoji: '❤️' }
};

const PostCard = ({
    item,
    currentUser,
    onToggleReaction,
    onAddComment,
    onUpdateComment,
    onDeleteComment,
    onEditPost,
    onDeletePost,
    onAttachFiles,
    onUploadAttachments,
    onDeleteAttachment
}) => {
    const [activePostId, setActivePostId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [deleteCommentConfirm, setDeleteCommentConfirm] = useState(null);
    const [attachPostId, setAttachPostId] = useState(null);
    const [attachFiles, setAttachFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const isOwner = item.author?.id === currentUser?.id || item.userId === currentUser?.id;
    const userReaction = item.reactions?.find(r => r.userId === currentUser?.id);
    const commentsCount = item.comments?.length || 0;
    const isShowingComments = activePostId === item.id;
    const isShowingAttach = attachPostId === item.id;

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

    const formatTime = (dateStr) => new Date(dateStr).toLocaleString();

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        const success = await onAddComment(item.id, commentText.trim());
        if (success) setCommentText('');
    };

    const handleUpdateComment = async () => {
        if (!editingComment || !editCommentText.trim()) return;
        const success = await onUpdateComment(item.id, editingComment.id, editCommentText.trim());
        if (success) {
            setEditingComment(null);
            setEditCommentText('');
        }
    };

    const handleDeleteComment = async () => {
        if (!deleteCommentConfirm) return;
        const success = await onDeleteComment(item.id, deleteCommentConfirm);
        if (success) setDeleteCommentConfirm(null);
    };

    const handleUploadAttachments = async () => {
        if (!attachPostId || attachFiles.length === 0) return;
        setIsUploading(true);
        const success = await onUploadAttachments(item.id, attachFiles);
        setIsUploading(false);
        if (success) {
            setAttachPostId(null);
            setAttachFiles([]);
        }
    };

    const handleAttachFilePick = async () => {
        const files = await onAttachFiles();
        if (files) setAttachFiles(prev => [...prev, ...files]);
    };

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
                        {item.isEdited && <Text style={styles.editedLabel}>(edited)</Text>}
                    </View>
                    <Text style={styles.postTime}>{formatTime(item.createdAt)}</Text>
                </View>
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
                            onPress={() => onEditPost(item)}
                        >
                            <Ionicons name="pencil-outline" size={18} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => onDeletePost(item.id)}
                        >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Content */}
            <Text style={styles.postContent}>{item.content}</Text>

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
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            )}

            {/* Attachments list */}
            {item.attachments?.length > 0 && (
                <View style={styles.attachmentsList}>
                    {item.attachments.map(att => (
                        <View key={att.id} style={styles.attachmentRow}>
                            <TouchableOpacity style={styles.attachmentBadge} onPress={() => openFile(att)}>
                                <Ionicons
                                    name={/jpg|jpeg|png|gif/i.test(att.fileExtension || att.fileName) ? 'image-outline'
                                        : /mp4|mov|avi/i.test(att.fileExtension || att.fileName) ? 'videocam-outline'
                                        : 'document-attach-outline'}
                                    size={14}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.attachmentName} numberOfLines={1}>{att.fileName}</Text>
                                {att.fileSize ? <Text style={styles.attachmentSize}>{formatFileSize(att.fileSize)}</Text> : null}
                            </TouchableOpacity>
                            {isOwner && (
                                <TouchableOpacity
                                    onPress={() => onDeleteAttachment(item.id, att.id)}
                                    style={{ padding: 4 }}
                                >
                                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Attach files panel */}
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
                                    {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.attachUploadBtnText}>Upload</Text>}
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
                <View style={styles.reactionsGroup}>
                    {Object.entries(REACTION_CONFIG).map(([type, config]) => {
                        const count = item.reactions?.filter(r => r.reactionType === type).length ?? 0;
                        const isActive = userReaction?.reactionType === type;
                        return (
                            <TouchableOpacity
                                key={type}
                                style={[styles.reactionBtn, isActive && { borderColor: config.color, backgroundColor: config.color + '18' }]}
                                onPress={() => onToggleReaction(item.id, type, currentUser?.id)}
                            >
                                <Text style={styles.reactionBtnEmoji}>{config.emoji}</Text>
                                <Text style={[styles.reactionBtnCount, isActive && { color: config.color }]}>{count}</Text>
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
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.commentSection}>
                        {item.comments?.map(comment => {
                            const isCommentOwner = comment.author?.id === currentUser?.id || comment.userId === currentUser?.id;
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
                                                    <TouchableOpacity onPress={() => { setEditingComment({ id: comment.id }); setEditCommentText(comment.content); }}>
                                                        <Ionicons name="pencil-outline" size={13} color="rgba(255,255,255,0.4)" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => setDeleteCommentConfirm(comment.id)}>
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
                        <View style={styles.commentInputRow}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={commentText}
                                onChangeText={setCommentText}
                                onSubmitEditing={handleAddComment}
                                returnKeyType="send"
                            />
                            <TouchableOpacity onPress={handleAddComment} disabled={!commentText.trim()}>
                                <Ionicons name="send" size={20} color={commentText.trim() ? COLORS.primary : 'rgba(255,255,255,0.2)'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            )}
        </View>
    );
};

export default PostCard;