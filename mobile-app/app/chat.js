import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../src/stores/chatStore';

export default function ChatScreen() {
    const { topic } = useLocalSearchParams();
    const router = useRouter();
    const scrollViewRef = useRef();
    const [input, setInput] = useState('');

    const {
        currentConversation,
        messages,
        isLoading,
        createConversation,
        talkWithAi,
        getTopics,
        clearMessages
    } = useChatStore();

    const [suggestions, setSuggestions] = useState([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

    useEffect(() => {
        const initChat = async () => {
            clearMessages();
            // Create a new conversation if one doesn't exist for the topic
            const res = await createConversation(topic || "General practice");
            if (!res.success) {
                console.error("Failed to start conversation:", res.error);
            }
        };

        initChat();
    }, [topic]);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !currentConversation) return;

        const messageText = input;
        setInput('');

        const res = await talkWithAi(currentConversation.id, messageText);
        if (res.success) {
            // Fetch new suggestions after each message
            handleGetSuggestions();
        } else {
            console.error("Send failed:", res.error);
        }
    };

    const handleGetSuggestions = async () => {
        if (!currentConversation || isGeneratingSuggestions) return;
        setIsGeneratingSuggestions(true);
        const res = await getTopics(currentConversation.id);
        if (res.success && res.topic) {
            // Split string if it comes back as a list or just take as is
            setSuggestions(res.topic.split("\n").filter(s => s.trim() !== ""));
        }
        setIsGeneratingSuggestions(false);
    };

    const handleUseSuggestion = (suggestion) => {
        setInput(suggestion);
        // We could also auto-send here if desired
    };

    // Map interactions to UI bubbles
    const renderMessages = () => {
        const uiMessages = [];

        // Initial greeting
        uiMessages.push({
            id: 'init',
            text: topic ? `Let's talk about ${topic}. I'm ready when you are!` : "Hi! I'm your AI tutor. What would you like to talk about today?",
            sender: 'ai'
        });

        messages.forEach((msg) => {
            // Add student message
            uiMessages.push({
                id: `${msg.id}-student`,
                text: msg.studentText,
                sender: 'user'
            });
            // Add AI response
            uiMessages.push({
                id: `${msg.id}-ai`,
                text: msg.aiText,
                sender: 'ai'
            });
        });

        return uiMessages.map((msg) => (
            <View key={msg.id} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, msg.sender === 'user' && styles.userMessageText]}>
                    {msg.text}
                </Text>
            </View>
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{topic || 'Free Talk'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                ref={scrollViewRef}
            >
                {renderMessages()}

                {suggestions.length > 0 && !isLoading && (
                    <View style={styles.suggestionsWrapper}>
                        <Text style={styles.suggestionsLabel}>Try saying:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
                            {suggestions.map((s, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.suggestionBubble}
                                    onPress={() => handleUseSuggestion(s.replace(/^[0-9.-]+\s*/, ""))}
                                >
                                    <Text style={styles.suggestionText}>{s.replace(/^[0-9.-]+\s*/, "")}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {isLoading && (
                    <View style={styles.typingContainer}>
                        <ActivityIndicator size="small" color="#888" />
                        <Text style={styles.typingText}>AI is thinking...</Text>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.audioButton}>
                        <Ionicons name="mic" size={20} color="#666" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type in English..."
                        placeholderTextColor="#999"
                        editable={!isLoading && !!currentConversation}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[styles.sendButton, (isLoading || !input.trim()) && styles.disabledButton]}
                        disabled={isLoading || !input.trim()}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    chatContent: {
        padding: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: '#eee',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#000',
        borderBottomRightRadius: 5,
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    userMessageText: {
        color: '#FFD700',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginBottom: 10,
    },
    typingText: {
        color: '#888',
        fontSize: 12,
        fontStyle: 'italic',
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
        color: '#333',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    audioButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },
    suggestionsWrapper: {
        marginTop: 10,
        marginBottom: 20,
    },
    suggestionsLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
        marginLeft: 5,
    },
    suggestionsContainer: {
        flexDirection: 'row',
    },
    suggestionBubble: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 18,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    suggestionText: {
        fontSize: 14,
        color: '#555',
    },
});
