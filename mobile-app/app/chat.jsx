import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../src/stores/chatStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../src/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-audio';
import { Audio as AVAudio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import styles from './styles/chatStyle';

const ChatScreen = () => {
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

    // Audio recording state
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState(null);
    const soundRef = useRef(null);

    useEffect(() => {
        const initChat = async () => {
            // Check if we already have this conversation active
            if (currentConversation && currentConversation.startingTopic === topic && messages.length > 0) {
                // Already loaded from persist
                return;
            }

            clearMessages();
            const res = await createConversation(topic || "General practice");
            if (!res.success) {
                console.error("Failed to start conversation:", res.error);
            }
        };

        if (topic) {
            initChat();
        }

        // Cleanup audio on unmount
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, [topic]);

    useEffect(() => {
        if (scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isLoading]);

    const startRecording = async () => {
        try {
            console.log('Requesting permissions..');
            const permission = await Audio.requestPermissionsAsync();

            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                console.log('Starting recording..');
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
                setIsRecording(true);
                console.log('Recording started');
            } else {
                console.error('Permission not granted');
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const playSound = async (url, messageId) => {
        try {
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
                if (playingMessageId === messageId) {
                    setPlayingMessageId(null);
                    return;
                }
            }

            setPlayingMessageId(messageId);
            
            let audioSource = { uri: url };

            // Special handling for web + ngrok to skip browser warning
            if (Platform.OS === 'web' && url.includes('ngrok-free.dev')) {
                try {
                    const response = await fetch(url, {
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    });
                    const blob = await response.blob();
                    audioSource = { uri: URL.createObjectURL(blob) };
                } catch (fetchError) {
                    console.error('Failed to fetch audio for web:', fetchError);
                }
            }

            await AVAudio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldRouteThroughEarpieceAndroid: false
            });

            const { sound } = await AVAudio.Sound.createAsync(
                audioSource,
                { shouldPlay: true }
            );
            
            soundRef.current = sound;

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setPlayingMessageId(null);
                    // Revoke object URL if it was created
                    if (Platform.OS === 'web' && audioSource.uri.startsWith('blob:')) {
                        URL.revokeObjectURL(audioSource.uri);
                    }
                }
            });

        } catch (error) {
            console.error('Failed to play sound', error);
            setPlayingMessageId(null);
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording..');
        setIsRecording(false);
        setRecording(null);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log('Recording stopped and stored at', uri);

            let base64Audio = '';
            if (Platform.OS === 'web') {
                // For web, use fetch and FileReader to get base64 from blob URI
                const response = await fetch(uri);
                const blob = await response.blob();
                base64Audio = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result.split(',')[1];
                        resolve(base64String);
                    };
                    reader.readAsDataURL(blob);
                });
            } else {
                // For native, use FileSystem
                base64Audio = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
            }

            handleSend(null, base64Audio);
        } catch (error) {
            console.error('Failed to stop recording', error);
        }
    };

    const handleSend = async (text = null, audioBase64 = null) => {
        const messageText = text || input;
        if (!messageText.trim() && !audioBase64) return;
        if (isLoading || !currentConversation) return;

        if (!audioBase64) setInput('');

        const res = await talkWithAi(currentConversation.id, messageText, audioBase64);
        if (res.success) {
            handleGetSuggestions();
        }
    };

    const handleGetSuggestions = async () => {
        if (!currentConversation || isGeneratingSuggestions) return;
        setIsGeneratingSuggestions(true);
        const res = await getTopics(currentConversation.id);
        if (res.success && res.topic) {
            setSuggestions(res.topic.split("\n").filter(s => s.trim() !== "").slice(0, 3));
        }
        setIsGeneratingSuggestions(false);
    };

    const handleUseSuggestion = (suggestion) => {
        setInput(suggestion);
    };

    const renderMessages = () => {
        const uiMessages = [];

        // Initial greeting if no messages yet
        if (messages.length === 0) {
            uiMessages.push({
                id: 'init',
                text: topic ? `Let's talk about ${topic}. I'm ready when you are!` : "Hi! I'm your AI tutor. What would you like to talk about today?",
                sender: 'ai'
            });
        }

        messages.forEach((msg) => {
            uiMessages.push({
                id: `${msg.id}-student`,
                text: msg.studentText || (msg.studentAudioUrl ? "🎤 [Audio Message]" : ""),
                sender: 'user',
                time: msg.createdAt,
                audioUrl: msg.studentAudioUrl
            });
            uiMessages.push({
                id: `${msg.id}-ai`,
                text: msg.aiText,
                sender: 'ai',
                time: msg.createdAt,
                audioUrl: msg.aiAudioUrl
            });
        });

        return uiMessages.map((msg) => (
            <View key={msg.id} style={[styles.messageRow, msg.sender === 'user' ? styles.userRow : styles.aiRow]}>
                {msg.sender === 'ai' && (
                    <View style={styles.aiAvatar}>
                        <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                    </View>
                )}
                <View style={[styles.messageGlassBubble, msg.sender === 'user' ? styles.userGlassBubble : styles.aiGlassBubble]}>
                    <Text style={[styles.messageText, msg.sender === 'user' && styles.userMessageText]}>
                        {msg.text}
                    </Text>
                    {msg.audioUrl && (
                        <View style={styles.messageFooter}>
                            <TouchableOpacity 
                                onPress={() => playSound(msg.audioUrl, msg.id)}
                                style={styles.speakerButton}
                            >
                                <Ionicons 
                                    name={playingMessageId === msg.id ? "stop-circle" : "volume-medium"} 
                                    size={20} 
                                    color={msg.sender === 'user' ? COLORS.primary : "#fff"} 
                                />
                                <Text style={[styles.audioLabel, msg.sender === 'user' && styles.userAudioLabel]}>
                                    {playingMessageId === msg.id ? "Playing..." : "Listen"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.secondary || '#111827', '#000']}
                style={styles.background}
            />
            <StatusBar barStyle="light-content" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>{topic || 'Practice'}</Text>
                        <View style={styles.statusIndicator}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.statusText}>AI Tutor Online</Text>
                        </View>
                    </View>
                    {/* <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
                    </TouchableOpacity> */}
                </View>

                <ScrollView
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContent}
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                >
                    {renderMessages()}

                    {isLoading && (
                        <View style={styles.typingRow}>
                            <View style={styles.aiAvatar}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            </View>
                            <View style={[styles.messageGlassBubble, styles.aiGlassBubble, { width: 60 }]}>
                                <Text style={styles.typingDot}>...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                    keyboardVerticalOffset={0}
                >
                    <View style={styles.footer}>
                        {suggestions.length > 0 && !isLoading && (
                            <View style={styles.suggestionsWrapper}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

                        <View style={styles.inputContainer}>
                            <TouchableOpacity
                                style={[styles.iconButton, isRecording && styles.recordingButton]}
                                onPressIn={startRecording}
                                onPressOut={stopRecording}
                            >
                                <Ionicons
                                    name={isRecording ? "mic" : "mic-outline"}
                                    size={24}
                                    color={isRecording ? "#EF4444" : COLORS.primary}
                                />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                value={input}
                                onChangeText={setInput}
                                placeholder={isRecording ? "Recording..." : "Message AI Tutor..."}
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                editable={!isLoading && !isRecording}
                                multiline
                                maxHeight={100}
                            />
                            <TouchableOpacity
                                onPress={() => handleSend()}
                                disabled={isLoading || isRecording || !input.trim()}
                                style={[styles.sendButton, (isLoading || isRecording || !input.trim()) && styles.disabledButton]}
                            >
                                <LinearGradient
                                    colors={isLoading || isRecording || !input.trim() ? ['#333', '#222'] : [COLORS.primary, '#F59E0B']}
                                    style={styles.sendGradient}
                                >
                                    <Ionicons name="arrow-up" size={24} color={COLORS.secondary} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

export default ChatScreen;
