import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCommunityStore } from '../../src/stores/communityStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../src/components/Card';
import Avatar from '../../src/components/Avatar'; // Assuming Avatar component or use View

export default function CommunityScreen() {
    const { id } = useLocalSearchParams(); // Batch ID
    const router = useRouter();
    const { posts, getPosts, createPost, isLoading, error } = useCommunityStore();
    const [newPostContent, setNewPostContent] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (id) {
            getPosts(id);
        }
    }, [id]);

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        setSending(true);
        await createPost(id, newPostContent);
        setSending(false);
        setNewPostContent('');
    };

    const renderPost = ({ item }) => (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.author?.firstName?.[0]}</Text>
                </View>
                <View style={styles.postMeta}>
                    <Text style={styles.authorName}>{item.author?.firstName} {item.author?.lastName}</Text>
                    <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
            </View>
            <Text style={styles.postContent}>{item.content}</Text>

            <View style={styles.postFooter}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.actionText}>{item.reactions?.length || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Community Discussion</Text>
            </View>

            {isLoading && posts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No discussions yet. Start one!</Text>
                        </View>
                    }
                />
            )}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Share something with the class..."
                        value={newPostContent}
                        onChangeText={setNewPostContent}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !newPostContent.trim() && styles.disabledSend]}
                        onPress={handleCreatePost}
                        disabled={!newPostContent.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.sm,
        marginRight: SPACING.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.md,
        paddingBottom: 20,
    },
    postContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    avatarText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    postMeta: {
        flex: 1,
    },
    authorName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    postDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    postContent: {
        fontSize: 15,
        color: COLORS.textPrimary,
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    postFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.lg,
    },
    actionText: {
        marginLeft: 4,
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: 10,
        maxHeight: 100,
        marginRight: SPACING.sm,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledSend: {
        backgroundColor: COLORS.textSecondary,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});
