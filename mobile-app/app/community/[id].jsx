import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Platform, Animated, Easing
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCommunityStore } from '../../src/stores/communityStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles, { card } from '../styles/communityIdStyle';

// ─────────────────────────────────────────────
// Reaction emojis
// ─────────────────────────────────────────────
const REACTIONS = [
    { type: 'LIKE', emoji: '👍' },
    { type: 'LOVE', emoji: '❤️' },
    { type: 'FUNNY', emoji: '😂' },
    { type: 'INSIGHTFUL', emoji: '💡' },
];

// ─────────────────────────────────────────────
// Single Post Card
// ─────────────────────────────────────────────
function PostCard({ item, onReact, onComment }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [sending, setSending] = useState(false);
    const [showEmojiBar, setShowEmojiBar] = useState(false);
    const emojiAnim = useRef(new Animated.Value(0)).current;
    const { comments, getComments, addComment } = useCommunityStore();
    const postComments = comments[item.id] || item.comments || [];

    const toggleComments = () => {
        if (!showComments) getComments(item.id);
        setShowComments(!showComments);
    };

    const toggleEmoji = () => {
        const toValue = showEmojiBar ? 0 : 1;
        setShowEmojiBar(!showEmojiBar);
        Animated.spring(emojiAnim, { toValue, useNativeDriver: true, damping: 14 }).start();
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        setSending(true);
        await addComment(item.id, commentText.trim());
        setSending(false);
        setCommentText('');
    };

    const likeCount = item.reactions?.filter(r => r.reactionType === 'LIKE' || !r.reactionType).length || 0;
    const commentCount = postComments.length;

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
                    <Text style={card.authorName}>{item.author?.firstName} {item.author?.lastName}</Text>
                    <Text style={card.date}>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                </View>
            </View>

            {/* Content */}
            <Text style={card.content}>{item.content}</Text>

            {/* Reaction bar popup */}
            {showEmojiBar && (
                <Animated.View style={[card.emojiBar, { transform: [{ scale: emojiScale }], opacity: emojiOpacity }]}>
                    {REACTIONS.map(r => (
                        <TouchableOpacity
                            key={r.type}
                            style={card.emojiBtn}
                            onPress={() => { onReact(item.id, r.type); toggleEmoji(); }}
                        >
                            <Text style={card.emoji}>{r.emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}

            {/* Actions */}
            <View style={card.footer}>
                <TouchableOpacity style={card.action} onPress={toggleEmoji}>
                    <Ionicons name="heart-outline" size={19} color={showEmojiBar ? '#F43F5E' : '#9CA3AF'} />
                    <Text style={card.actionNum}>{likeCount > 0 ? likeCount : ''}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={card.action} onPress={toggleComments}>
                    <Ionicons name="chatbubble-outline" size={18} color={showComments ? COLORS.primary : '#9CA3AF'} />
                    <Text style={card.actionNum}>{commentCount > 0 ? commentCount : ''}</Text>
                </TouchableOpacity>
            </View>

            {/* Comments section */}
            {showComments && (
                <View style={card.commentSection}>
                    {postComments.map((c, i) => (
                        <View key={c.id || i} style={card.commentBubble}>
                            <View style={card.commentAvatar}>
                                <Text style={card.commentAvatarText}>{c.author?.firstName?.[0]?.toUpperCase() || '?'}</Text>
                            </View>
                            <View style={card.commentContent}>
                                <Text style={card.commentAuthor}>{c.author?.firstName} {c.author?.lastName}</Text>
                                <Text style={card.commentText}>{c.content}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={card.commentInput}>
                        <TextInput
                            style={card.input}
                            placeholder="Write a comment..."
                            placeholderTextColor="#4B5563"
                            value={commentText}
                            onChangeText={setCommentText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[card.sendBtn, !commentText.trim() && card.sendBtnDisabled]}
                            onPress={handleComment}
                            disabled={!commentText.trim() || sending}
                        >
                            {sending
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Ionicons name="send" size={16} color="#fff" />}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// ─────────────────────────────────────────────
// Community Screen
// ─────────────────────────────────────────────
export default function CommunityScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { posts, getPosts, createPost, postReaction, isLoading, error } = useCommunityStore();
    const { checkEnrollmentStatus } = useBatchStore();
    const [isEnrolled, setIsEnrolled] = useState(null); // null = loading, false = locked, true = access
    const [newPostContent, setNewPostContent] = useState('');
    const [sending, setSending] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (id) {
            checkAccess();
        }
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

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        setSending(true);
        await createPost(id, newPostContent.trim());
        setSending(false);
        setNewPostContent('');
    };

    const handleReact = (postId, reactionType) => {
        postReaction(postId, reactionType);
    };

    const ListHeader = () => (
        <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Batch Discussion</Text>
            <Text style={styles.listSub}>{posts.length} posts · Share ideas with your class</Text>
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
                    <Text style={styles.emptyDesc}>
                        Join this batch to access the community discussion.
                    </Text>
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
                        <PostCard item={item} onReact={handleReact} onComment={() => inputRef.current?.focus()} />
                    )}
                />
            )}

            {/* Compose bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={80}
            >
                <View style={styles.composeBar}>
                    <View style={styles.composeInner}>
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
                            style={[styles.postBtn, !newPostContent.trim() && styles.postBtnDisabled]}
                            onPress={handleCreatePost}
                            disabled={!newPostContent.trim() || sending}
                        >
                            {sending
                                ? <ActivityIndicator size="small" color="#1A1A2E" />
                                : <Ionicons name="send" size={18} color="#1A1A2E" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
