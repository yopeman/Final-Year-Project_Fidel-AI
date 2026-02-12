import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const topics = [
    { id: '1', emoji: '☕', title: 'Coffee Shop Order', color: '#FFF3E0' },
    { id: '2', emoji: '✈️', title: 'Airport Check-in', color: '#E3F2FD' },
    { id: '3', emoji: '💼', title: 'Job Interview', color: '#F3E5F5' },
    { id: '4', emoji: '🍔', title: 'Restaurant', color: '#FFEBEE' },
    { id: '5', emoji: '👋', title: 'Introductions', color: '#E8F5E9' },
    { id: '6', emoji: '🤔', title: 'Free Talk', color: '#F5F5F5' },
];

export default function AIConversationScreen() {
    const router = useRouter();

    const startConversation = (topic) => {
        router.push({
            pathname: '/chat',
            params: { topic: topic.title }
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Talk with AI</Text>
                <Text style={styles.headerSubtitle}>Improve your speaking skills</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroCard}>
                    <Ionicons name="mic-circle" size={64} color="#FFD700" />
                    <Text style={styles.heroText}>
                        Practice real-world conversations in a stress-free environment.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Choose a Topic</Text>

                <View style={styles.grid}>
                    {topics.map((topic) => (
                        <TouchableOpacity
                            key={topic.id}
                            style={[styles.topicCard, { backgroundColor: topic.color }]}
                            onPress={() => startConversation(topic)}
                        >
                            <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                            <Text style={styles.topicTitle}>{topic.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => startConversation({ title: 'Free Talk' })}
            >
                <Ionicons name="mic" size={30} color="#000" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#000',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    headerSubtitle: {
        color: '#ccc',
        fontSize: 16,
        marginTop: 5,
    },
    scrollContent: {
        padding: 20,
    },
    heroCard: {
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#eee',
    },
    heroText: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    topicCard: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 20,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topicEmoji: {
        fontSize: 40,
        marginBottom: 10,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFD700',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
});
