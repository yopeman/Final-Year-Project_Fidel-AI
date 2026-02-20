import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, ScrollView, RefreshControl, StatusBar,
    Dimensions, Image, KeyboardAvoidingView, Platform,
    ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useCommunityStore } from '../../src/stores/communityStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import PremiumMenu from '../../src/components/PremiumMenu';

const { width } = Dimensions.get('window');

const CommunityScreen = () => {
    const { user } = useAuthStore();
    const { currentBatch, enrollments, premiumUnlocked } = useBatchStore();
    const {
        posts, isLoading, getPosts, createPost, toggleReaction, addComment,
        selectedFiles, addFiles, removeFile, clearFiles
    } = useCommunityStore();

    const { hasFeature } = useAuthStore();
    const [menuVisible, setMenuVisible] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [activePostId, setActivePostId] = useState(null); // For comments
    const [commentText, setCommentText] = useState('');

    const isPremium = hasFeature('community') || premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');
    const batchId = currentBatch?.id || enrollments.find(e => e.status === 'ENROLLED')?.batch?.id;

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
            Alert.alert("Success", res.warning || "Your post has been shared!");
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
            setCommentText('');
            setActivePostId(null);
        }
    };

    const renderPost = ({ item }) => {
        const hasReacted = item.reactions?.some(r => r.userId === user?.id);
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
                    <TouchableOpacity style={styles.moreBtn}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.postContent}>{item.content}</Text>

                {item.attachments?.length > 0 && (
                    <View style={styles.attachmentsRow}>
                        {item.attachments.map(att => (
                            <View key={att.id} style={styles.attachmentBadge}>
                                <Ionicons name="document-attach" size={14} color={COLORS.primary} />
                                <Text style={styles.attachmentName} numberOfLines={1}>{att.fileName}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.divider} />

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => toggleReaction(item.id, 'LIKE', user?.id)}
                    >
                        <Ionicons
                            name={hasReacted ? "heart" : "heart-outline"}
                            size={22}
                            color={hasReacted ? "#EF4444" : "rgba(255,255,255,0.5)"}
                        />
                        <Text style={[styles.actionText, hasReacted && { color: "#EF4444" }]}>
                            {reactionsCount > 0 ? reactionsCount : 'Like'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => setActivePostId(activePostId === item.id ? null : item.id)}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.actionText}>{commentsCount > 0 ? commentsCount : 'Comment'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <Ionicons name="share-social-outline" size={20} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                </View>

                {activePostId === item.id && (
                    <View style={styles.commentSection}>
                        {item.comments?.map(comment => (
                            <View key={comment.id} style={styles.commentItem}>
                                <View style={styles.commentAvatar}>
                                    <Text style={styles.commentAvatarText}>{comment.author?.firstName?.[0]}</Text>
                                </View>
                                <View style={styles.commentBubble}>
                                    <Text style={styles.commentAuthor}>{comment.author?.firstName}</Text>
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

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
                    <TouchableOpacity style={styles.notifBtn}>
                        <Ionicons name="notifications-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.composerCard}>
                <View style={styles.composerHeader}>
                    <View style={styles.composerAvatar}>
                        <Text style={styles.avatarText}>{user?.firstName?.[0] || 'U'}</Text>
                    </View>
                    <TextInput
                        style={styles.composerInput}
                        placeholder="What's on your mind?"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        multiline
                        value={newPost}
                        onChangeText={setNewPost}
                    />
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

                <View style={styles.composerActions}>
                    <TouchableOpacity style={styles.composerTool} onPress={() => handleFilePick('photo')}>
                        <Ionicons name="image-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.toolText}>Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.composerTool} onPress={() => handleFilePick('all')}>
                        <Ionicons name="attach-outline" size={20} color="#3B82F6" />
                        <Text style={styles.toolText}>File</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.postBtn,
                            (!newPost.trim() && selectedFiles.length === 0) && styles.postBtnDisabled
                        ]}
                        disabled={!newPost.trim() && selectedFiles.length === 0}
                        onPress={handleCreatePost}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.postBtnText}>Post</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
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
        </View>
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
        backgroundColor: '#0F172A',
        margin: 16, borderRadius: 20,
        padding: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    composerHeader: { flexDirection: 'row', gap: 12 },
    composerAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center'
    },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    composerInput: {
        flex: 1, color: '#fff', fontSize: 16,
        paddingTop: 8, height: 80, textAlignVertical: 'top'
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
});

export default CommunityScreen;
