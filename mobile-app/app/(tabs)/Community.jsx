import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
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
import styles from '../styles/communityStyle';

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
            console.log("File pick error:", error);
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

export default CommunityScreen;
