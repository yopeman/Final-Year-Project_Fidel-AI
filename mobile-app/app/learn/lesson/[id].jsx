import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import Input from '../../../src/components/Input';
import { useLearningStore } from '../../../src/stores/learningStore';
import { useChatStore } from '../../../src/stores/chatStore';
import { COLORS, FONTS, SPACING } from '../../../src/constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from '../../styles/lessonStyle';

const Tab = createMaterialTopTabNavigator();

// Vocabulary Tab
function VocabularyTab({ lesson }) {
    return (
        <ScrollView contentContainerStyle={styles.tabContent}>
            {(lesson?.vocabulary || []).length > 0 ? (
                lesson.vocabulary.map((item, index) => (
                    <Card key={index} style={styles.vocabCard}>
                        <Text style={styles.vocabWord}>{item.word}</Text>
                        <Text style={styles.vocabDefinition}>{item.definition}</Text>
                        {item.example && (
                            <Text style={styles.vocabExample}>"{item.example}"</Text>
                        )}
                    </Card>
                ))
            ) : (
                <Text style={styles.placeholderText}>No vocabulary items yet</Text>
            )}
        </ScrollView>
    );
}

// Articles Tab
function ArticlesTab({ lesson }) {
    return (
        <ScrollView contentContainerStyle={styles.tabContent}>
            {(lesson?.articles || []).length > 0 ? (
                lesson.articles.map((article, index) => (
                    <Card key={index} style={styles.articleCard}>
                        <Text style={styles.articleTitle}>{article.title}</Text>
                        <Text style={styles.articleContent}>{article.content}</Text>
                    </Card>
                ))
            ) : (
                <Text style={styles.placeholderText}>No articles yet</Text>
            )}
        </ScrollView>
    );
}

// Videos Tab
function VideosTab({ lesson }) {
    return (
        <ScrollView contentContainerStyle={styles.tabContent}>
            {(lesson?.videos || []).length > 0 ? (
                lesson.videos.map((video, index) => (
                    <Card key={index} style={styles.videoCard}>
                        <Text style={styles.videoTitle}>{video.title}</Text>
                        <View style={styles.videoPlaceholder}>
                            <Text style={styles.videoIcon}>🎥</Text>
                            <Text style={styles.videoText}>Video Player</Text>
                        </View>
                        {video.description && (
                            <Text style={styles.videoDescription}>{video.description}</Text>
                        )}
                    </Card>
                ))
            ) : (
                <Text style={styles.placeholderText}>No videos yet</Text>
            )}
        </ScrollView>
    );
}

// Ask AI Tab
function AskAITab({ lessonId }) {
    const [message, setMessage] = useState('');
    const { messages, askAiInLesson, isLoading } = useChatStore();

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = message;
        setMessage('');

        await askAiInLesson(lessonId, userMessage);
    };

    return (
        <View style={styles.chatContainer}>
            <ScrollView
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.length === 0 ? (
                    <View style={styles.chatEmpty}>
                        <Text style={styles.chatEmptyIcon}>🤖</Text>
                        <Text style={styles.chatEmptyText}>
                            Ask me anything about this lesson!
                        </Text>
                    </View>
                ) : (
                    messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageBubble,
                                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                            ]}
                        >
                            <Text style={styles.messageText}>{msg.content}</Text>
                        </View>
                    ))
                )}
            </ScrollView>

            <View style={styles.chatInputContainer}>
                <Input
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Ask a question..."
                    style={styles.chatInput}
                />
                <Button
                    title="Send"
                    onPress={handleSendMessage}
                    loading={isLoading}
                    size="small"
                    style={styles.sendButton}
                />
            </View>
        </View>
    );
}

export default function LessonScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const lessonId = id;

    const { currentLesson, getLesson, completeLesson, isLoading } = useLearningStore();

    useEffect(() => {
        if (lessonId) {
            getLesson(lessonId);
        }
    }, [lessonId]);

    const handleCompleteLesson = async () => {
        const result = await completeLesson(lessonId);

        if (result.success) {
            Alert.alert(
                'Lesson Completed! 🎉',
                'Great job! Keep up the momentum.',
                [
                    {
                        text: 'Continue',
                        onPress: () => router.back(),
                    },
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.lessonHeader}>
                <Text style={styles.lessonTitle}>{currentLesson?.title || 'Lesson'}</Text>
                {currentLesson?.description && (
                    <Text style={styles.lessonDescription}>{currentLesson.description}</Text>
                )}
            </View>

            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textSecondary,
                    tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
                    tabBarLabelStyle: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
                    tabBarStyle: { backgroundColor: COLORS.surface },
                }}
            >
                <Tab.Screen
                    name="Vocabulary"
                    children={() => <VocabularyTab lesson={currentLesson} />}
                    options={{ tabBarLabel: '📘 Vocabulary' }}
                />
                <Tab.Screen
                    name="Articles"
                    children={() => <ArticlesTab lesson={currentLesson} />}
                    options={{ tabBarLabel: '📄 Articles' }}
                />
                <Tab.Screen
                    name="Videos"
                    children={() => <VideosTab lesson={currentLesson} />}
                    options={{ tabBarLabel: '🎥 Videos' }}
                />
                <Tab.Screen
                    name="AskAI"
                    children={() => <AskAITab lessonId={lessonId} />}
                    options={{ tabBarLabel: '🤖 Ask AI' }}
                />
            </Tab.Navigator>

            <View style={styles.bottomBar}>
                <Button
                    title="Mark as Complete"
                    onPress={handleCompleteLesson}
                    loading={isLoading}
                    style={styles.completeButton}
                />
            </View>
        </SafeAreaView>
    );
}

