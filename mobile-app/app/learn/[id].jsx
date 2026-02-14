import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useChatStore } from '../../src/stores/chatStore';
import { Ionicons } from '@expo/vector-icons';


export default function LessonScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { currentLesson, getLesson, completeLesson, isLoading } = useLearningStore();
    const [activeTab, setActiveTab] = useState('vocab');

    // AI Chat State
    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);

    useEffect(() => {
        if (id) {
            getLesson(id);
        }
    }, [id]);

    const handleComplete = async () => {
        const result = await completeLesson(id);
        if (result.success) {
            router.replace('/(tabs)/Modules');
        }
    };

    const { askAiInLesson } = useChatStore();

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isAiTyping) return;

        const messageText = inputMessage;
        setInputMessage('');
        setIsAiTyping(true);

        const res = await askAiInLesson(id, messageText);

        if (res.success) {
            const interaction = res.message;
            const newMessages = [
                { id: `${interaction.id}-q`, text: interaction.studentQuestion, sender: 'user' },
                { id: `${interaction.id}-a`, text: interaction.aiAnswer, sender: 'ai' }
            ];
            setChatMessages(prev => [...prev, ...newMessages]);
        } else {
            console.error("AI Lesson chat failed:", res.error);
            // Fallback msg or alert
        }
        setIsAiTyping(false);
    };

    if (isLoading || !currentLesson) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'vocab':
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.sectionHeader}>Key Vocabulary</Text>
                        {currentLesson.vocabulary?.map((item, index) => (
                            <View key={index} style={styles.vocabCard}>
                                <Text style={styles.vocabWord}>{item.word || item.term}</Text>
                                <Text style={styles.vocabDef}>{item.definition || item.meaning}</Text>
                                {item.example && <Text style={styles.vocabExample}>"{item.example}"</Text>}
                            </View>
                        )) || <Text>No vocabulary for this lesson.</Text>}
                    </ScrollView>
                );
            case 'article':
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
                        <Text style={styles.articleText}>
                            {currentLesson.content || "Lesson content goes here. This would be a rich text article explaining the concepts."}
                        </Text>
                    </ScrollView>
                );
            case 'video':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.videoPlaceholder}>
                            <Ionicons name="play-circle" size={64} color="#ccc" />
                            <Text style={styles.videoText}>Video Player would go here</Text>
                            {/* <WebView source={{ uri: currentLesson.videoUrl }} /> */}
                        </View>
                        <Text style={styles.videoTitle}>{currentLesson.title} - Video Lesson</Text>
                    </View>
                );
            case 'ai':
                return (
                    <View style={styles.chatContainer}>
                        <ScrollView style={styles.chatList}>
                            <View style={styles.aiMessage}>
                                <Text style={styles.messageText}>Hi! I'm your AI tutor. Ask me anything about this lesson.</Text>
                            </View>
                            {chatMessages.map(msg => (
                                <View key={msg.id} style={msg.sender === 'user' ? styles.userMessage : styles.aiMessage}>
                                    <Text style={[styles.messageText, msg.sender === 'user' && styles.userMessageText]}>
                                        {msg.text}
                                    </Text>
                                </View>
                            ))}
                            {isAiTyping && <Text style={styles.typingIndicator}>AI is typing...</Text>}
                        </ScrollView>
                        <View style={styles.inputArea}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ask a question..."
                                value={inputMessage}
                                onChangeText={setInputMessage}
                            />
                            <TouchableOpacity onPress={handleSendMessage}>
                                <Ionicons name="send" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{currentLesson.title}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'vocab' && styles.activeTab]}
                    onPress={() => setActiveTab('vocab')}
                >
                    <Ionicons name="book" size={20} color={activeTab === 'vocab' ? '#000' : '#888'} />
                    <Text style={[styles.tabText, activeTab === 'vocab' && styles.activeTabText]}>Vocab</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'article' && styles.activeTab]}
                    onPress={() => setActiveTab('article')}
                >
                    <Ionicons name="document-text" size={20} color={activeTab === 'article' ? '#000' : '#888'} />
                    <Text style={[styles.tabText, activeTab === 'article' && styles.activeTabText]}>Read</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'video' && styles.activeTab]}
                    onPress={() => setActiveTab('video')}
                >
                    <Ionicons name="videocam" size={20} color={activeTab === 'video' ? '#000' : '#888'} />
                    <Text style={[styles.tabText, activeTab === 'video' && styles.activeTabText]}>Watch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'ai' && styles.activeTab]}
                    onPress={() => setActiveTab('ai')}
                >
                    <Ionicons name="chatbubbles" size={20} color={activeTab === 'ai' ? '#000' : '#888'} />
                    <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>Ask AI</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {renderTabContent()}
            </View>

            {/* Footer Action */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                    <Text style={styles.completeButtonText}>Mark Complete</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        gap: 5,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#FFD700',
    },
    tabText: {
        fontSize: 12,
        color: '#888',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    tabContent: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    vocabCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#FFD700',
    },
    vocabWord: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    vocabDef: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    vocabExample: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#888',
    },
    lessonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    articleText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#444',
    },
    videoPlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginBottom: 15,
    },
    videoText: {
        color: '#888',
        marginTop: 10,
    },
    videoTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    chatContainer: {
        flex: 1,
    },
    chatList: {
        flex: 1,
        padding: 15,
    },
    aiMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        borderBottomLeftRadius: 5,
        marginBottom: 10,
        maxWidth: '80%',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 15,
        borderBottomRightRadius: 5,
        marginBottom: 10,
        maxWidth: '80%',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    userMessageText: {
        color: '#FFD700',
    },
    typingIndicator: {
        marginLeft: 15,
        color: '#888',
        fontStyle: 'italic',
        fontSize: 12,
        marginBottom: 10,
    },
    inputArea: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 20,
        marginRight: 10,
        fontSize: 16,
    },
    footer: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    completeButton: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
