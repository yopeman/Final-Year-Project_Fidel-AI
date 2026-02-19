import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, SafeAreaView, TextInput, Image, Linking,
    Modal, Platform, Animated
} from 'react-native';
import { WebView } from 'react-native-webview';
import Markdown from 'react-native-markdown-display';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useChatStore } from '../../src/stores/chatStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/index';

// ── Vocab Card (expandable) ──────────────────────────────────────────────────
function VocabCard({ item, index }) {
    const [expanded, setExpanded] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        Animated.spring(anim, {
            toValue: expanded ? 0 : 1,
            useNativeDriver: false,
            speed: 14,
            bounciness: 6,
        }).start();
        setExpanded(v => !v);
    };

    const maxH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] });
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    const colors = [
        '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4',
    ];
    const accent = colors[index % colors.length];

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={toggle} style={[styles.vocabCard, { borderLeftColor: accent }]}>
            <View style={styles.vocabCardHeader}>
                <View style={styles.vocabWordRow}>
                    <View style={[styles.indexBadge, { backgroundColor: accent + '22' }]}>
                        <Text style={[styles.indexBadgeText, { color: accent }]}>{index + 1}</Text>
                    </View>
                    <Text style={styles.vocabWord}>{item.word || item.term}</Text>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.textSecondary}
                />
            </View>

            <Text style={styles.vocabDef} numberOfLines={expanded ? undefined : 2}>
                {item.definition || item.meaning}
            </Text>

            <Animated.View style={{ maxHeight: maxH, opacity, overflow: 'hidden' }}>
                {item.example ? (
                    <View style={[styles.exampleBox, { borderColor: accent + '44', backgroundColor: accent + '11' }]}>
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color={accent} style={{ marginRight: 6 }} />
                        <Text style={[styles.vocabExample, { color: accent }]}>"{item.example}"</Text>
                    </View>
                ) : null}
                {item.partOfSpeech ? (
                    <View style={[styles.posBadge, { backgroundColor: accent + '22' }]}>
                        <Text style={[styles.posText, { color: accent }]}>{item.partOfSpeech}</Text>
                    </View>
                ) : null}
            </Animated.View>
        </TouchableOpacity>
    );
}

// ── Design tokens for dark Read & AI tabs ────────────────────────────────────
const READ_BG = '#0F172A';   // deep navy
const READ_CARD = '#1E293B';   // slate card
const READ_BORDER = '#334155';   // slate border
const READ_TEXT = '#E2E8F0';   // soft white
const READ_MUTED = '#94A3B8';   // muted slate
const READ_ACCENT = '#F59E0B';   // gold accent (= COLORS.primary)

const AI_BG = '#0D1117';   // richest dark
const AI_CARD = '#161B22';   // github-dark card
const AI_BUBBLE_AI = '#1D2D44';   // deep blue-indigo for AI
const AI_BUBBLE_U = '#7C3AED';   // vivid violet for user
const AI_BORDER = '#30363D';
const AI_TEXT = '#F0F6FC';
const AI_MUTED = '#8B949E';
const AI_GOLD = '#F59E0B';

// ── Markdown custom styles (dark theme) ──────────────────────────────────────
const markdownStyles = {
    body: { color: READ_TEXT, fontSize: 16, lineHeight: 28 },
    heading1: {
        fontSize: 26, fontWeight: '800', color: '#F8FAFC',
        marginTop: 24, marginBottom: 12, borderBottomWidth: 2,
        borderBottomColor: READ_ACCENT, paddingBottom: 6,
    },
    heading2: {
        fontSize: 21, fontWeight: '700', color: '#F1F5F9',
        marginTop: 20, marginBottom: 8,
    },
    heading3: {
        fontSize: 18, fontWeight: '700', color: '#CBD5E1',
        marginTop: 16, marginBottom: 6,
    },
    paragraph: { marginBottom: 14, lineHeight: 28, color: READ_TEXT },
    strong: { fontWeight: '800', color: '#F8FAFC' },
    em: { fontStyle: 'italic', color: READ_MUTED },
    code_inline: {
        backgroundColor: '#1C2A3A', color: '#FCD34D',
        paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 4, fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    fence: {
        backgroundColor: '#0D1117', borderRadius: 10,
        padding: 14, marginVertical: 10,
        borderWidth: 1, borderColor: READ_BORDER,
    },
    code_block: {
        color: '#86EFAC', fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    blockquote: {
        backgroundColor: '#1E293B', borderLeftWidth: 4,
        borderLeftColor: READ_ACCENT, paddingVertical: 12,
        paddingHorizontal: 14, marginVertical: 12, borderRadius: 6,
    },
    blockquote_body: { color: '#FCD34D', fontStyle: 'italic' },
    bullet_list: { marginBottom: 10 },
    ordered_list: { marginBottom: 10 },
    list_item: { flexDirection: 'row', marginBottom: 6 },
    bullet_list_icon: { marginRight: 8, color: READ_ACCENT, fontSize: 18, lineHeight: 28 },
    ordered_list_icon: { marginRight: 8, color: READ_ACCENT, fontWeight: '700', lineHeight: 28 },
    hr: { backgroundColor: READ_BORDER, height: 1, marginVertical: 18 },
    link: { color: '#60A5FA', textDecorationLine: 'underline' },
    image: { borderRadius: 10, marginVertical: 10 },
    table: { borderWidth: 1, borderColor: READ_BORDER, borderRadius: 8, overflow: 'hidden', marginVertical: 12 },
    thead: { backgroundColor: '#1E3A5F' },
    th: { padding: 10, fontWeight: '700', color: '#F8FAFC', fontSize: 14 },
    td: { padding: 10, color: READ_TEXT, fontSize: 14 },
    tr: { borderBottomWidth: 1, borderBottomColor: READ_BORDER },
};

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function LessonScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { currentLesson, getLesson, completeLesson, isLoading } = useLearningStore();
    const [activeTab, setActiveTab] = useState('vocab');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [readingMode, setReadingMode] = useState('comfortable'); // 'compact' | 'comfortable' | 'large'

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

    // AI Chat
    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);

    useEffect(() => { if (id) getLesson(id); }, [id]);

    useEffect(() => {
        if (currentLesson?.interactions) {
            const history = currentLesson.interactions.map(i => ([
                { id: `${i.id}-q`, text: i.studentQuestion, sender: 'user', createdAt: i.createdAt },
                { id: `${i.id}-a`, text: i.aiAnswer, sender: 'ai', createdAt: i.createdAt }
            ])).flat().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setChatMessages(history);
        }
    }, [currentLesson]);

    const handleComplete = async () => {
        const result = await completeLesson(id);
        if (result.success) router.replace('/(tabs)/Modules');
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
            setChatMessages(prev => [
                ...prev,
                { id: `${interaction.id}-q`, text: interaction.studentQuestion, sender: 'user' },
                { id: `${interaction.id}-a`, text: interaction.aiAnswer, sender: 'ai' },
            ]);
        }
        setIsAiTyping(false);
    };

    if (isLoading || !currentLesson) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading lesson…</Text>
            </View>
        );
    }

    // ── Tab: Vocabulary ──────────────────────────────────────────────────────
    const renderVocab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Header card */}
            <View style={styles.vocabHeaderCard}>
                <View style={styles.vocabHeaderLeft}>
                    <Ionicons name="bookmark" size={22} color={COLORS.primary} />
                    <Text style={styles.vocabHeaderTitle}>Key Vocabulary</Text>
                </View>
                <View style={styles.vocabCountBadge}>
                    <Text style={styles.vocabCountText}>
                        {currentLesson.vocabulary?.length || 0} words
                    </Text>
                </View>
            </View>

            {currentLesson.vocabulary?.length > 0 ? (
                currentLesson.vocabulary.map((item, index) => (
                    <VocabCard key={index} item={item} index={index} />
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="book-outline" size={60} color={COLORS.border} />
                    <Text style={styles.emptyTitle}>No vocabulary yet</Text>
                    <Text style={styles.emptyText}>This lesson doesn't have vocabulary words.</Text>
                </View>
            )}

            <View style={{ height: 30 }} />
        </ScrollView>
    );
    // ── Tab: Article / Read ──────────────────────────────────────────────────
    const fontSizeMap = {
        compact: 14,
        comfortable: 16,
        large: 19,
    };

    const lineHeightMap = {
        compact: 22,
        comfortable: 28,
        large: 34,
    };

    const renderArticle = () => {
        const content = currentLesson.content || '';

        return (
            <ScrollView
                style={[styles.tabContent, styles.readTabBg]}
                showsVerticalScrollIndicator={false}
            >
                {/* Reading Controls */}
                <View style={styles.readControls}>
                    <View style={styles.readControlLeft}>
                        <Ionicons name="book-outline" size={15} color={READ_ACCENT} />
                        <Text style={styles.readControlLabel}>Reading Mode</Text>
                    </View>

                    <View style={styles.readSizeButtons}>
                        {[['S', 'compact'], ['M', 'comfortable'], ['L', 'large']].map(([label, mode]) => (
                            <TouchableOpacity
                                key={mode}
                                style={[
                                    styles.readSizeBtn,
                                    readingMode === mode && styles.readSizeBtnActive
                                ]}
                                onPress={() => setReadingMode(mode)}
                            >
                                <Text
                                    style={[
                                        styles.readSizeBtnText,
                                        readingMode === mode && styles.readSizeBtnTextActive
                                    ]}
                                >
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Article Card */}
                <View style={styles.articleCard}>

                    {/* Title */}
                    <View style={styles.articleTitleRow}>
                        <View style={styles.articleTitleAccent} />
                        <Text style={styles.articleLessonTitle}>
                            {currentLesson.title}
                        </Text>
                    </View>

                    {/* Content */}
                    {content ? (
                        <Markdown
                            mergeStyle
                            style={{
                                ...markdownStyles,
                                body: {
                                    ...markdownStyles.body,
                                    fontSize: fontSizeMap[readingMode],
                                    lineHeight: lineHeightMap[readingMode],
                                },
                                paragraph: {
                                    ...markdownStyles.paragraph,
                                    fontSize: fontSizeMap[readingMode],
                                    lineHeight: lineHeightMap[readingMode],
                                },
                            }}
                            onLinkPress={(url) => Linking.openURL(url)}
                        >
                            {content}
                        </Markdown>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="document-outline"
                                size={50}
                                color={READ_BORDER}
                            />
                            <Text style={[styles.emptyTitle, { color: READ_MUTED }]}>
                                No content yet
                            </Text>
                            <Text style={[styles.emptyText, { color: READ_MUTED }]}>
                                Lesson content will appear here.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Related Articles */}
                {currentLesson.articles?.length > 0 && (
                    <View style={styles.relatedSection}>
                        <View style={styles.relatedHeader}>
                            <Ionicons name="link" size={16} color={READ_ACCENT} />
                            <Text style={styles.relatedTitle}>
                                Related Articles
                            </Text>
                        </View>

                        {currentLesson.articles.map((article, index) => (
                            <TouchableOpacity
                                key={article.id || index}
                                style={styles.articleLinkCard}
                                onPress={() => Linking.openURL(article.url)}
                                activeOpacity={0.75}
                            >
                                <View style={styles.articleLinkIcon}>
                                    <Ionicons
                                        name="open-outline"
                                        size={18}
                                        color={READ_ACCENT}
                                    />
                                </View>

                                <Text
                                    style={styles.articleLinkText}
                                    numberOfLines={2}
                                >
                                    {article.title}
                                </Text>

                                <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color={READ_MUTED}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        );
    };


    // ── Tab: Videos ─────────────────────────────────────────────────────────
    const renderVideo = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>Related Videos</Text>
            {currentLesson.videos?.length > 0 ? (
                currentLesson.videos.map((video, index) => (
                    <View key={video.id || index} style={styles.videoCard}>
                        <TouchableOpacity style={styles.thumbnailContainer} onPress={() => setSelectedVideo(video)}>
                            {video.thumbnailUrl ? (
                                <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumbnail} />
                            ) : (
                                <View style={styles.videoPlaceholderSmall}>
                                    <Ionicons name="play-circle" size={40} color="#ccc" />
                                </View>
                            )}
                            <View style={styles.playOverlay}>
                                <View style={styles.playButton}>
                                    <Ionicons name="play" size={28} color="#fff" />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.videoInfo}>
                            <Text style={styles.videoTitle}>{video.title}</Text>
                            <Text style={styles.videoDescription} numberOfLines={2}>{video.description}</Text>
                            <TouchableOpacity style={styles.watchButton} onPress={() => setSelectedVideo(video)}>
                                <Ionicons name="play" size={14} color={COLORS.secondary} style={{ marginRight: 6 }} />
                                <Text style={styles.watchButtonText}>Watch Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="videocam-outline" size={64} color={COLORS.border} />
                    <Text style={styles.emptyTitle}>No videos yet</Text>
                    <Text style={styles.emptyText}>No videos available for this lesson.</Text>
                </View>
            )}

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
                    {Platform.OS === 'web' ? (
                        <iframe
                            src={getEmbedUrl(selectedVideo?.url || selectedVideo?.videoUrl)}
                            width="100%" height="100%"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ border: 'none', borderRadius: 8 }}
                        />
                    ) : (
                        <WebView
                            style={styles.webview}
                            javaScriptEnabled domStorageEnabled
                            source={{ uri: getEmbedUrl(selectedVideo?.url || selectedVideo?.videoUrl) }}
                        />
                    )}
                </SafeAreaView>
            </Modal>
        </ScrollView>
    );

    // ── Tab: AI Chat ─────────────────────────────────────────────────────────
    const renderAI = () => (
        <View style={styles.chatContainer}>
            {/* Header banner */}
            <View style={styles.chatHeader}>
                <View style={styles.aiBotAvatar}>
                    <Ionicons name="sparkles" size={20} color={AI_GOLD} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.chatHeaderTitle}>Fidel AI Tutor</Text>
                    <Text style={styles.chatHeaderSub}>Ask anything about this lesson</Text>
                </View>
                <View style={styles.onlineDot} />
            </View>

            <ScrollView
                style={styles.chatList}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome bubble */}
                <View style={styles.aiRow}>
                    <View style={styles.aiAvatarSmall}>
                        <Ionicons name="sparkles" size={14} color={AI_GOLD} />
                    </View>
                    <View style={styles.aiMessage}>
                        <Text style={styles.messageText}>Hi! I'm your AI tutor. Ask me anything about this lesson. 🎓</Text>
                    </View>
                </View>

                {chatMessages.map(msg => (
                    msg.sender === 'user' ? (
                        <View key={msg.id} style={styles.userRow}>
                            <View style={styles.userMessage}>
                                <Text style={styles.userMessageText}>{msg.text}</Text>
                            </View>
                        </View>
                    ) : (
                        <View key={msg.id} style={styles.aiRow}>
                            <View style={styles.aiAvatarSmall}>
                                <Ionicons name="sparkles" size={14} color={AI_GOLD} />
                            </View>
                            <View style={styles.aiMessage}>
                                <Text style={styles.messageText}>{msg.text}</Text>
                            </View>
                        </View>
                    )
                ))}

                {isAiTyping && (
                    <View style={styles.aiRow}>
                        <View style={styles.aiAvatarSmall}>
                            <Ionicons name="sparkles" size={14} color={AI_GOLD} />
                        </View>
                        <View style={[styles.aiMessage, styles.typingBubble]}>
                            <Text style={styles.typingIndicator}>● ● ●</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input area */}
            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Ask a question…"
                    placeholderTextColor={AI_MUTED}
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
                    onPress={handleSendMessage}
                    disabled={!inputMessage.trim() || isAiTyping}
                >
                    <Ionicons name="send" size={18} color={inputMessage.trim() ? AI_BG : AI_MUTED} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'vocab': return renderVocab();
            case 'article': return renderArticle();
            case 'video': return renderVideo();
            case 'ai': return renderAI();
            default: return null;
        }
    };

    const tabs = [
        { key: 'vocab', label: 'Vocab', icon: 'bookmark' },
        { key: 'article', label: 'Read', icon: 'document-text' },
        { key: 'video', label: 'Watch', icon: 'videocam' },
        { key: 'ai', label: 'Ask AI', icon: 'chatbubbles' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{currentLesson.title}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, isActive && styles.activeTab]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                                <Ionicons
                                    name={tab.icon}
                                    size={18}
                                    color={isActive ? COLORS.secondary : COLORS.textSecondary}
                                />
                            </View>
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Content */}
            <View style={styles.content}>
                {renderTabContent()}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} style={{ marginRight: 8 }} />
                    <Text style={styles.completeButtonText}>Mark Complete</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingHorizontal: 16,
        paddingVertical: 14, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17, fontWeight: '700', color: COLORS.text,
        flex: 1, textAlign: 'center', marginHorizontal: 8,
    },

    // Tabs
    tabs: {
        flexDirection: 'row', backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
        paddingHorizontal: 4,
    },
    tab: {
        flex: 1, alignItems: 'center', paddingVertical: 10,
        gap: 4,
    },
    activeTab: {},
    tabIconWrap: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    tabIconWrapActive: {
        backgroundColor: COLORS.primary,
    },
    tabText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
    activeTabText: { color: COLORS.primary, fontWeight: '700' },

    // Content
    content: { flex: 1 },
    tabContent: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

    // ── Vocab ────────────────────────────────────────────────────────────────
    vocabHeaderCard: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', backgroundColor: '#fff',
        borderRadius: 14, padding: 14, marginBottom: 14,
        borderWidth: 1, borderColor: COLORS.border,
    },
    vocabHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    vocabHeaderTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    vocabCountBadge: {
        backgroundColor: COLORS.primary + '22', paddingHorizontal: 10,
        paddingVertical: 4, borderRadius: 20,
    },
    vocabCountText: { fontSize: 12, fontWeight: '600', color: COLORS.primaryDark },

    vocabCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16,
        marginBottom: 12, borderLeftWidth: 4,
        borderWidth: 1, borderColor: COLORS.border,
        // shadow
        shadowColor: '#000', shadowOpacity: 0.05,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    vocabCardHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 8,
    },
    vocabWordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    indexBadge: {
        width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    indexBadgeText: { fontSize: 12, fontWeight: '700' },
    vocabWord: { fontSize: 18, fontWeight: '800', color: COLORS.text, flex: 1 },
    vocabDef: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 4 },

    exampleBox: {
        flexDirection: 'row', alignItems: 'flex-start',
        borderWidth: 1, borderRadius: 8,
        padding: 10, marginTop: 8,
    },
    vocabExample: { fontSize: 13, fontStyle: 'italic', flex: 1, lineHeight: 20 },
    posBadge: {
        alignSelf: 'flex-start', paddingHorizontal: 10,
        paddingVertical: 3, borderRadius: 20, marginTop: 8,
    },
    posText: { fontSize: 12, fontWeight: '600' },

    // ── Article / Read ─────────────────────────────────────────────────────
    readTabBg: { backgroundColor: READ_BG },

    readControls: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: READ_CARD, borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 10,
        marginBottom: 14,
        borderWidth: 1, borderColor: READ_BORDER,
    },
    readControlLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    readControlLabel: { fontSize: 13, color: READ_MUTED, fontWeight: '500' },
    readSizeButtons: { flexDirection: 'row', gap: 6 },
    readSizeBtn: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: READ_BORDER,
    },
    readSizeBtnActive: { backgroundColor: READ_ACCENT, borderColor: READ_ACCENT },
    readSizeBtnText: { fontSize: 12, fontWeight: '800', color: READ_MUTED },
    readSizeBtnTextActive: { color: '#0F172A' },

    articleCard: {
        backgroundColor: READ_CARD, borderRadius: 18,
        padding: 20, marginBottom: 16,
        borderWidth: 1, borderColor: READ_BORDER,
        shadowColor: '#000', shadowOpacity: 0.3,
        shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    articleTitleRow: {
        flexDirection: 'row', alignItems: 'flex-start',
        marginBottom: 18, gap: 12,
    },
    articleTitleAccent: {
        width: 4, borderRadius: 4,
        backgroundColor: READ_ACCENT, alignSelf: 'stretch',
        minHeight: 36,
    },
    articleLessonTitle: {
        fontSize: 22, fontWeight: '800', color: '#F8FAFC', flex: 1, lineHeight: 30,
    },
    plainArticleText: { color: READ_TEXT },

    relatedSection: {
        backgroundColor: READ_CARD, borderRadius: 14,
        padding: 14, marginBottom: 16,
        borderWidth: 1, borderColor: READ_BORDER,
    },
    relatedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    relatedTitle: { fontSize: 15, fontWeight: '700', color: READ_TEXT },
    articleLinkCard: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, borderBottomWidth: 1,
        borderBottomColor: READ_BORDER, gap: 10,
    },
    articleLinkIcon: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: READ_ACCENT + '22',
        alignItems: 'center', justifyContent: 'center',
    },
    articleLinkText: { flex: 1, fontSize: 14, color: READ_TEXT, fontWeight: '500' },

    // ── Video ────────────────────────────────────────────────────────────────
    sectionHeader: { fontSize: 18, fontWeight: '800', marginBottom: 14, color: COLORS.text },
    videoCard: {
        backgroundColor: '#fff', borderRadius: 14, marginBottom: 16,
        overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
        shadowColor: '#000', shadowOpacity: 0.05,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    thumbnailContainer: { position: 'relative' },
    videoThumbnail: { width: '100%', height: 190 },
    videoPlaceholderSmall: {
        width: '100%', height: 190, backgroundColor: '#F3F4F6',
        alignItems: 'center', justifyContent: 'center',
    },
    playOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'center', alignItems: 'center',
    },
    playButton: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    },
    videoInfo: { padding: 14 },
    videoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    videoDescription: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, lineHeight: 20 },
    watchButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.secondary, paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20, alignSelf: 'flex-start',
    },
    watchButtonText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },

    // Video Modal
    modalContainer: { flex: 1, backgroundColor: '#000' },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center',
        padding: 15, backgroundColor: '#111',
    },
    closeButton: { marginRight: 15 },
    modalTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: 'bold' },
    webview: { flex: 1 },

    // ── Empty ────────────────────────────────────────────────────────────────
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textSecondary, marginTop: 14 },
    emptyText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },

    // ── AI Chat ────────────────────────────────────────────────────────────
    chatContainer: { flex: 1, backgroundColor: AI_BG },

    // header
    chatHeader: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: AI_CARD, paddingHorizontal: 16,
        paddingVertical: 12, gap: 12,
        borderBottomWidth: 1, borderBottomColor: AI_BORDER,
    },
    aiBotAvatar: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#1C2D44', alignItems: 'center',
        justifyContent: 'center', borderWidth: 2, borderColor: AI_GOLD,
    },
    chatHeaderTitle: { fontSize: 15, fontWeight: '700', color: AI_TEXT },
    chatHeaderSub: { fontSize: 12, color: AI_MUTED, marginTop: 1 },
    onlineDot: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#22C55E',
        borderWidth: 2, borderColor: AI_CARD,
    },

    chatList: { flex: 1, paddingHorizontal: 14, paddingTop: 14 },

    // message rows
    aiRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
    userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
    aiAvatarSmall: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#1C2D44', alignItems: 'center',
        justifyContent: 'center', borderWidth: 1, borderColor: AI_GOLD + '66',
    },

    // bubbles
    aiMessage: {
        backgroundColor: AI_BUBBLE_AI,
        paddingVertical: 12, paddingHorizontal: 16,
        borderRadius: 18, borderBottomLeftRadius: 4,
        maxWidth: '78%',
        borderWidth: 1, borderColor: '#2D3F5A',
        shadowColor: '#000', shadowOpacity: 0.25,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },
    userMessage: {
        backgroundColor: AI_BUBBLE_U,
        paddingVertical: 12, paddingHorizontal: 16,
        borderRadius: 18, borderBottomRightRadius: 4,
        maxWidth: '78%',
        shadowColor: '#7C3AED', shadowOpacity: 0.4,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },
    messageText: { fontSize: 15, color: AI_TEXT, lineHeight: 22 },
    userMessageText: { fontSize: 15, color: '#EDE9FE', lineHeight: 22 },

    typingBubble: { paddingVertical: 10 },
    typingIndicator: {
        color: AI_GOLD, fontSize: 18, letterSpacing: 4,
    },

    // input
    inputArea: {
        flexDirection: 'row', paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: AI_CARD,
        borderTopWidth: 1, borderTopColor: AI_BORDER,
        alignItems: 'flex-end', gap: 10,
    },
    input: {
        flex: 1, backgroundColor: '#21262D',
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 22, fontSize: 15,
        color: AI_TEXT, borderWidth: 1,
        borderColor: AI_BORDER, maxHeight: 100,
        lineHeight: 22,
    },
    sendButton: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: AI_GOLD,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: AI_GOLD, shadowOpacity: 0.5,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },
    sendButtonDisabled: { backgroundColor: '#374151', shadowOpacity: 0 },

    // Footer
    footer: {
        padding: 16, backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    completeButton: {
        backgroundColor: COLORS.secondary, paddingVertical: 15,
        borderRadius: 30, alignItems: 'center', flexDirection: 'row',
        justifyContent: 'center',
    },
    completeButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
});
