import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, ScrollView, RefreshControl, StatusBar,
    Dimensions, Image, KeyboardAvoidingView, Platform,
    ActivityIndicator, Alert, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useCommunityStore } from '../../src/stores/communityStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import PremiumMenu from '../../src/components/PremiumMenu';
import PremiumUpgradeModal from '../../src/components/PremiumUpgradeModal';
import FileViewerModal from '../../src/components/FileViewerModal';

const { width } = Dimensions.get('window');

const REACTION_CONFIG = {
    LIKE: { icon: 'thumbs-up', color: '#3B82F6', label: 'Like', emoji: '👍' },
    DISLIKE: { icon: 'thumbs-down', color: '#6B7280', label: 'Dislike', emoji: '👎' },
    LOVE: { icon: 'heart', color: '#EF4444', label: 'Love', emoji: '❤️' }
};

const CommunityScreen = () => {
    const { user } = useAuthStore();
    const { activeBatchId, enrollments, premiumUnlocked } = useBatchStore();
    const {
        posts, isLoading, getPosts, createPost, toggleReaction, toggleCommentReaction,
        addComment, selectedFiles, addFiles, removeFile, clearFiles
    } = useCommunityStore();

    const [menuVisible, setMenuVisible] = useState(false);
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [activePostId, setActivePostId] = useState(null); // For comments
    const [commentText, setCommentText] = useState('');
    const [showReactionPickerId, setShowReactionPickerId] = useState(null);
    const [viewFileModalVisible, setViewFileModalVisible] = useState(false);
    const [viewFileUrl, setViewFileUrl] = useState('');
    const [viewFileTitle, setViewFileTitle] = useState('');

    const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');
    const batchId = activeBatchId || enrollments.find(e => e.status === 'ENROLLED')?.batch?.id;

    useEffect(() => {
        if (batchId) {
            getPosts(batchId);
        }
    }, [batchId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (batchId) {
            await getPosts(batchId);
        }
        setRefreshing(false);
    }, [batchId]);

    const handleCreatePost = async () => {
        const hasContent = newPost.trim().length > 0;
        const hasFiles = selectedFiles.length > 0;

        if ((!hasContent && !hasFiles) || !batchId) return;

        const res = await createPost(batchId, newPost.trim(), selectedFiles);
        if (res.success) {
            Keyboard.dismiss();
            setNewPost('');
            clearFiles();
        } else {
            Alert.alert("Error", res.error || "Failed to share post. Please try again.");
        }
    };

    const handleFilePick = async (type = 'all') => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: type === 'photo' ? 'image/*' : '*/*',
                multiple: true,
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                const files = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.name,
                    size: asset.size,
                    type: asset.mimeType
                }));
                addFiles(files);
            }
        } catch (error) {
            console.error("File pick error:", error);
        }
    };

    const handleAddComment = async (postId) => {
        if (!commentText.trim()) return;
        const res = await addComment(postId, commentText.trim());
        if (res.success) {
            Keyboard.dismiss();
            setCommentText('');
            // Optional: Close comments view
            // setActivePostId(null); 
        } else {
            Alert.alert("Error", res.error || "Failed to add comment. Please try again.");
        }
    };

    const renderPost = ({ item }) => {
        const userReaction = item.reactions?.find(r => r.userId === user?.id);
        const reactionsCount = item.reactions?.length || 0;
        const commentsCount = item.comments?.length || 0;

        return (
            <View style={styles.postCard}>
                <View style={styles.postHeader}>
                    <View style={styles.authorAvatar}>
                        <Text style={styles.avatarText}>{item.author?.firstName?.[0] || 'U'}</Text>
                    </View>
                    <View style={styles.authorInfo}>
                        <Text style={styles.authorName}>{item.author?.firstName} {item.author?.lastName}</Text>
                        <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>

                </View>

                {item.attachments?.some(att => att.fileExtension?.match(/jpg|jpeg|png|gif|mp4|mp3/i)) && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            const img = item.attachments.find(att => att.fileExtension?.match(/jpg|jpeg|png|gif|mp4|mp3/i));
                            if (img) {
                                setViewFileUrl(img.filePath);
                                setViewFileTitle(img.fileName);
                                setViewFileModalVisible(true);
                            }
                        }}
                    >
                        <Image
                            source={{ uri: item.attachments.find(att => att.fileExtension?.match(/jpg|jpeg|png|gif|mp4|mp3/i)).filePath }}
                            style={styles.postImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}

                <Text style={styles.postContent}>{item.content}</Text>

                {item.attachments?.length > 0 && (
                    <View style={styles.attachmentsRow}>
                        {item.attachments.map(att => (
                            <TouchableOpacity
                                key={att.id}
                                style={styles.attachmentBadge}
                                onPress={() => {
                                    setViewFileUrl(att.filePath);
                                    setViewFileTitle(att.fileName);
                                    setViewFileModalVisible(true);
                                }}
                            >
                                <Ionicons name="document-attach" size={14} color={COLORS.primary} />
                                <Text style={styles.attachmentName} numberOfLines={1}>{att.fileName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.divider} />

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => setShowReactionPickerId(showReactionPickerId === item.id ? null : item.id)}
                    >
                        <Ionicons
                            name={userReaction ? REACTION_CONFIG[userReaction.reactionType].icon : "happy-outline"}
                            size={22}
                            color={userReaction ? REACTION_CONFIG[userReaction.reactionType].color : "rgba(255,255,255,0.5)"}
                        />
                        <Text style={[styles.actionText, userReaction && { color: REACTION_CONFIG[userReaction.reactionType].color }]}>
                            {reactionsCount > 0 ? reactionsCount : 'React'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => setActivePostId(activePostId === item.id ? null : item.id)}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.actionText}>{commentsCount > 0 ? commentsCount : 'Comment'}</Text>
                    </TouchableOpacity>
                </View>

                {showReactionPickerId === item.id && (
                    <View style={styles.reactionPicker}>
                        {Object.entries(REACTION_CONFIG).map(([type, config]) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.reactionOption,
                                    userReaction?.reactionType === type && styles.reactionOptionActive
                                ]}
                                onPress={() => {
                                    toggleReaction(item.id, type, user?.id);
                                    setShowReactionPickerId(null);
                                }}
                            >
                                <Text style={styles.reactionEmoji}>{config.emoji}</Text>
                                <Text style={styles.reactionLabel}>{config.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {activePostId === item.id && (
                    <View style={styles.commentSection}>
                        {item.comments?.map(comment => (
                            <View key={comment.id} style={styles.commentItem}>
                                <View style={styles.commentAvatar}>
                                    <Text style={styles.commentAvatarText}>{comment.author?.firstName?.[0]}</Text>
                                </View>
                                <View style={styles.commentBubble}>
                                    <View style={styles.commentHeader}>
                                        <Text style={styles.commentAuthor}>{comment.author?.firstName}</Text>
                                        <View style={styles.commentReactions}>
                                            {Object.entries(REACTION_CONFIG).map(([type, config]) => {
                                                const hasReacted = comment.reactions?.some(r => r.userId === user?.id && r.reactionType === type);
                                                const count = comment.reactions?.filter(r => r.reactionType === type).length || 0;
                                                return (
                                                    <TouchableOpacity
                                                        key={type}
                                                        onPress={() => toggleCommentReaction(item.id, comment.id, type, user?.id)}
                                                        style={[styles.smallReaction, hasReacted && styles.smallReactionActive]}
                                                    >
                                                        <Text style={styles.smallEmoji}>{config.emoji}</Text>
                                                        {count > 0 && <Text style={styles.reactionCountText}>{count}</Text>}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                    <Text style={styles.commentText}>{comment.content}</Text>
                                </View>
                            </View>
                        ))}
                        <View style={styles.commentInputRow}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={commentText}
                                onChangeText={setCommentText}
                            />
                            <TouchableOpacity onPress={() => handleAddComment(item.id)}>
                                <Ionicons name="send" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
            <PremiumUpgradeModal visible={upgradeModalVisible} onClose={() => setUpgradeModalVisible(false)} />

            <LinearGradient
                colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.heroBanner}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                        <Ionicons name="menu" size={26} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.titleGroup}>
                        <Text style={styles.headerTitle}>Batch Lounge</Text>
                        <Text style={styles.headerSubtitle}>Discuss with your batchmates</Text>
                    </View>
                </View>
            </LinearGradient>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
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

            {isPremium ? (
                <View style={styles.composerCard}>
                    <View style={styles.composerRow}>
                        <TouchableOpacity
                            style={styles.attachmentButton}
                            onPress={() => handleFilePick('all')}
                        >
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
                            style={[
                                styles.sendButton,
                                (!newPost.trim() && selectedFiles.length === 0) && styles.sendButtonDisabled
                            ]}
                            disabled={(!newPost.trim() && selectedFiles.length === 0) || isLoading}
                            onPress={handleCreatePost}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons
                                    name="send"
                                    size={20}
                                    color={(!newPost.trim() && selectedFiles.length === 0) ? "rgba(255,255,255,0.2)" : COLORS.primary}
                                />
                            )}
                        </TouchableOpacity>
                    </View>

                    {selectedFiles.length > 0 && (
                        <View style={styles.previewContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {selectedFiles.map((file) => (
                                    <View key={file.uri} style={styles.filePreview}>
                                        <Ionicons
                                            name={file.type?.includes('image') ? "image" : "document"}
                                            size={18}
                                            color={COLORS.primary}
                                        />
                                        <Text style={styles.previewName} numberOfLines={1}>{file.name}</Text>
                                        <TouchableOpacity
                                            style={styles.removeFileBtn}
                                            onPress={() => removeFile(file.uri)}
                                        >
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

            <FileViewerModal
                visible={viewFileModalVisible}
                onClose={() => setViewFileModalVisible(false)}
                fileUrl={viewFileUrl}
                title={viewFileTitle}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },
    heroBanner: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    menuBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    titleGroup: { flex: 1 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
    notifBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center'
    },

    // Composer
    composerCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        margin: 12, borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 8,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    composerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    attachmentButton: {
        padding: 4
    },
    verticalDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 4
    },
    composerInput: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        padding: 8,
        marginLeft: 4
    },
    sendButtonDisabled: {
        opacity: 0.5
    },
    previewContainer: {
        marginVertical: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 10,
        gap: 6,
        position: 'relative',
    },
    previewName: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        maxWidth: 100,
    },
    removeFileBtn: {
        marginLeft: 4,
    },
    composerActions: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)'
    },
    composerTool: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginRight: 20,
    },
    toolText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
    postBtn: {
        marginLeft: 'auto',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20, paddingVertical: 8,
        borderRadius: 12,
    },
    postBtnDisabled: { opacity: 0.5 },
    postBtnText: { color: '#fff', fontWeight: 'bold' },

    // Feed
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    postCard: {
        backgroundColor: '#0F172A',
        borderRadius: 20, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    authorAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center'
    },
    authorInfo: { flex: 1 },
    authorName: { color: '#fff', fontWeight: '600', fontSize: 15 },
    postTime: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
    postContent: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 22, marginBottom: 12 },

    attachmentsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    attachmentBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(16,185,129,0.12)',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    },
    attachmentName: { color: COLORS.primary, fontSize: 12, maxWidth: 120 },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 12 },
    actionsRow: { flexDirection: 'row', gap: 24 },
    actionItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },

    // Comments
    commentSection: {
        marginTop: 16, paddingTop: 16,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)'
    },
    commentItem: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    commentAvatar: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center'
    },
    commentAvatarText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    commentBubble: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 10, borderRadius: 12,
    },
    commentAuthor: { color: '#fff', fontWeight: '600', fontSize: 13, marginBottom: 2 },
    commentText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    commentInputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginTop: 8, paddingHorizontal: 4
    },
    commentInput: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#fff', paddingHorizontal: 15, paddingVertical: 8,
        borderRadius: 20, fontSize: 14
    },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyText: { color: 'rgba(255,255,255,0.3)', marginTop: 12, fontSize: 15 },

    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    reactionPicker: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 30,
        padding: 6,
        marginTop: 8,
        position: 'absolute',
        bottom: 50,
        left: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 100,
        gap: 10
    },
    reactionOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6
    },
    reactionOptionActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    reactionEmoji: { fontSize: 20 },
    reactionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },

    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4
    },
    commentReactions: {
        flexDirection: 'row',
        gap: 6
    },
    smallReaction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2
    },
    smallReactionActive: {
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderColor: 'rgba(16,185,129,0.2)',
        borderWidth: 1
    },
    smallEmoji: { fontSize: 12 },
    reactionCountText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700'
    }
});

export default CommunityScreen;
