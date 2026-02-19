import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../src/stores/chatStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/constants';
import { LinearGradient } from 'expo-linear-gradient';

const topics = [
    { id: '1', emoji: '☕', title: 'Coffee Shop Order', color: 'rgba(52, 211, 153, 0.1)' },
    { id: '2', emoji: '✈️', title: 'Airport Check-in', color: 'rgba(52, 211, 153, 0.1)' },
    { id: '3', emoji: '💼', title: 'Job Interview', color: 'rgba(52, 211, 153, 0.1)' },
    { id: '4', emoji: '🍔', title: 'Restaurant', color: 'rgba(52, 211, 153, 0.1)' },
    { id: '5', emoji: '👋', title: 'Introductions', color: 'rgba(52, 211, 153, 0.1)' },
    { id: '6', emoji: '🤔', title: 'Free Talk', color: 'rgba(52, 211, 153, 0.1)' },
];

export default function AIConversationScreen() {
    const router = useRouter();
    const { conversations, setCurrentConversation } = useChatStore();

    const startConversation = (topic) => {
        router.push({
            pathname: '/chat',
            params: { topic: topic.title }
        });
    };

    const resumeConversation = (conv) => {
        setCurrentConversation(conv);
        router.push({
            pathname: '/chat',
            params: { topic: conv.startingTopic }
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.secondary || '#111827', '#000']}
                style={styles.background}
            />
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Talk with AI</Text>
                <Text style={styles.headerSubtitle}>Improve your speaking skills</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={['rgba(52, 211, 153, 0.15)', 'transparent']}
                    style={styles.heroCard}
                >
                    <Ionicons name="mic-circle" size={80} color={COLORS.primary} />
                    <Text style={styles.heroText}>
                        Practice real-world conversations in a stress-free environment. Use voice or text to improve naturally.
                    </Text>
                </LinearGradient>

                {conversations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Practice</Text>
                        {conversations.slice(0, 3).map((conv) => (
                            <TouchableOpacity
                                key={conv.id}
                                style={styles.historyCard}
                                onPress={() => resumeConversation(conv)}
                            >
                                <View style={styles.historyIcon}>
                                    <Ionicons name="chatbubbles-outline" size={24} color={COLORS.primary} />
                                </View>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyTitle}>{conv.startingTopic}</Text>
                                    <Text style={styles.historyDate}>
                                        {new Date(conv.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#4B5563" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.sectionTitle}>Choose a Topic</Text>
                <View style={styles.grid}>
                    {topics.map((topic) => (
                        <TouchableOpacity
                            key={topic.id}
                            style={[styles.topicCard, { backgroundColor: topic.color }]}
                            onPress={() => startConversation(topic)}
                        >
                            <View style={styles.emojiContainer}>
                                <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                            </View>
                            <Text style={styles.topicTitle}>{topic.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => startConversation({ title: 'Free Talk' })}
            >
                <LinearGradient
                    colors={[COLORS.primary, '#F59E0B']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="mic" size={30} color={COLORS.secondary} />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    headerSubtitle: {
        color: '#9CA3AF',
        fontSize: 16,
        marginTop: 5,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    heroCard: {
        alignItems: 'center',
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.2)',
    },
    heroText: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
        color: '#D1D5DB',
        lineHeight: 24,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#fff',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    topicCard: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: BORDER_RADIUS.xl,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.1)',
    },
    emojiContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    topicEmoji: {
        fontSize: 32,
    },
    topicTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        color: '#fff',
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    historyIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    historyInfo: {
        flex: 1,
    },
    historyTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    historyDate: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 66,
        height: 66,
        borderRadius: 33,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 33,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
