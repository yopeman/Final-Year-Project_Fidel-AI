import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, TextInput, Image, Linking, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useChatStore } from '../../src/stores/chatStore';
import { Ionicons } from '@expo/vector-icons';


export default function LessonScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { currentLesson, getLesson, completeLesson, isLoading } = useLearningStore();
    const [activeTab, setActiveTab] = useState('vocab');
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Helper to extract YouTube ID and return embed URL
    const getEmbedUrl = (url) => {
        if (!url) return null;
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

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

                        {currentLesson.articles?.length > 0 && (
                            <View style={styles.relatedArticles}>
                                <Text style={styles.sectionHeaderSmall}>Related Articles</Text>
                                {currentLesson.articles.map((article, index) => (
                                    <TouchableOpacity
                                        key={article.id || index}
                                        style={styles.articleLink}
                                        onPress={() => Linking.openURL(article.url)}
                                    >
                                        <Ionicons name="link" size={16} color="#FFD700" />
                                        <Text style={styles.articleLinkText}>{article.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                );
            case 'video':
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.sectionHeader}>Related Videos</Text>
                        {currentLesson.videos?.length > 0 ? (
                            currentLesson.videos.map((video, index) => (
                                <View key={video.id || index} style={styles.videoCard}>
                                    <TouchableOpacity
                                        style={styles.thumbnailContainer}
                                        onPress={() => setSelectedVideo(video)}
                                    >
                                        {video.thumbnailUrl ? (
                                            <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumbnail} />
                                        ) : (
                                            <View style={styles.videoPlaceholderSmall}>
                                                <Ionicons name="play-circle" size={40} color="#ccc" />
                                            </View>
                                        )}
                                        <View style={styles.playOverlay}>
                                            <Ionicons name="play" size={30} color="#fff" />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.videoInfo}>
                                        <Text style={styles.videoTitle}>{video.title}</Text>
                                        <Text style={styles.videoDescription} numberOfLines={2}>{video.description}</Text>
                                        <TouchableOpacity
                                            style={styles.watchButton}
                                            onPress={() => setSelectedVideo(video)}
                                        >
                                            <Text style={styles.watchButtonText}>Watch Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="videocam-outline" size={64} color="#ccc" />
                                <Text style={styles.emptyText}>No videos available for this lesson.</Text>
                            </View>
                        )}

                        {/* Video Modal */}
                        <Modal
                            visible={!!selectedVideo}
                            animationType="slide"
                            transparent={false}
                            onRequestClose={() => setSelectedVideo(null)}
                        >
                            <SafeAreaView style={styles.modalContainer}>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setSelectedVideo(null)} style={styles.closeButton}>
                                        <Ionicons name="close" size={28} color="#fff" />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle} numberOfLines={1}>{selectedVideo?.title}</Text>
                                </View>
                                <WebView
                                    style={styles.webview}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    source={{ uri: getEmbedUrl(selectedVideo?.url || selectedVideo?.videoUrl) }}
                                />
                            </SafeAreaView>
                        </Modal>
                    </ScrollView>
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
    videoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    videoThumbnail: {
        width: '100%',
        height: 180,
    },
    videoPlaceholderSmall: {
        width: '100%',
        height: 180,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoInfo: {
        padding: 12,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    videoDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    watchButton: {
        backgroundColor: '#000',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    watchButtonText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: '600',
    },
    relatedArticles: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sectionHeaderSmall: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    articleLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    articleLinkText: {
        fontSize: 14,
        color: '#333',
        textDecorationLine: 'underline',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    thumbnailContainer: {
        position: 'relative',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#000',
    },
    closeButton: {
        marginRight: 15,
    },
    modalTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    webview: {
        flex: 1,
    },
    emptyText: {
        color: '#888',
        marginTop: 10,
        fontSize: 16,
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
