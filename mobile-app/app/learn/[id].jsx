import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, SafeAreaView, TextInput, Image, Linking,
    Modal, Platform, Animated, StatusBar
} from 'react-native';
import { WebView } from 'react-native-webview';
import Markdown from 'react-native-markdown-display';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useChatStore } from '../../src/stores/chatStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../src/constants/index';
import styles, { DARK_BG, DARK_CARD, DARK_BORDER, ACCENT, ACCENT2, GOLD, READ_CARD, READ_BORDER, READ_TEXT, READ_MUTED, AI_CARD, AI_BORDER, AI_BUBBLE_AI, AI_BUBBLE_U, AI_TEXT, AI_MUTED } from '../styles/learnIdStyle';

// ── VocabCard ─────────────────────────────────────────────────────────────────
function VocabCard({ item, index }) {
    const [expanded, setExpanded] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        Animated.spring(anim, { toValue: expanded ? 0 : 1, useNativeDriver: false, speed: 14, bounciness: 6 }).start();
        setExpanded(v => !v);
    };

    const maxH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] });
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    const palette = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4'];
    const accent = palette[index % palette.length];

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={toggle}
            style={[styles.vocabCard, { borderLeftColor: accent }]}>
            <View style={styles.vocabCardHeader}>
                <View style={styles.vocabWordRow}>
                    <View style={[styles.indexBadge, { backgroundColor: accent + '22' }]}>
                        <Text style={[styles.indexBadgeText, { color: accent }]}>{index + 1}</Text>
                    </View>
                    <Text style={styles.vocabWord}>{item.word || item.term}</Text>
                </View>
                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
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

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function LessonScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { currentLesson, getLesson, completeLesson, isLoading } = useLearningStore();
    const { askAiInLesson } = useChatStore();

    const [activeTab, setActiveTab] = useState('vocab');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [readingMode, setReadingMode] = useState('comfortable');
    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);

    useEffect(() => { if (id) getLesson(id); }, [id]);

    useEffect(() => {
        if (currentLesson?.interactions) {
            const history = currentLesson.interactions
                .map(i => ([
                    { id: `${i.id}-q`, text: i.studentQuestion, sender: 'user', createdAt: i.createdAt },
                    { id: `${i.id}-a`, text: i.aiAnswer, sender: 'ai', createdAt: i.createdAt },
                ]))
                .flat()
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setChatMessages(history);
        }
    }, [currentLesson]);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
        if (url.includes('watch?v=')) return `https://www.youtube.com/embed/${url.split('watch?v=')[1].split('&')[0]}`;
        if (url.includes('youtube.com/embed/')) return url;
        return url;
    };

    const handleComplete = async () => {
        const result = await completeLesson(id);
        if (result.success) router.replace('/(tabs)/Modules');
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isAiTyping) return;
        const text = inputMessage;
        setInputMessage('');
        setIsAiTyping(true);
        const res = await askAiInLesson(id, text);
        if (res.success) {
            const m = res.message;
            setChatMessages(prev => [
                ...prev,
                { id: `${m.id}-q`, text: m.studentQuestion, sender: 'user' },
                { id: `${m.id}-a`, text: m.aiAnswer, sender: 'ai' },
            ]);
        }
        setIsAiTyping(false);
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading || !currentLesson) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" />
                <View style={styles.loadingSpinner}>
                    <Ionicons name="sparkles" size={32} color={ACCENT} />
                </View>
                <Text style={styles.loadingText}>Loading lesson…</Text>
            </View>
        );
    }

    // ── Tab: Vocabulary ──────────────────────────────────────────────────────
    const renderVocab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.vocabHeaderCard}>
                <View style={styles.vocabHeaderLeft}>
                    <View style={styles.vocabHeaderIcon}>
                        <Ionicons name="bookmark" size={18} color={ACCENT} />
                    </View>
                    <Text style={styles.vocabHeaderTitle}>Key Vocabulary</Text>
                </View>
                <View style={styles.vocabCountBadge}>
                    <Text style={styles.vocabCountText}>{currentLesson.vocabulary?.length || 0} words</Text>
                </View>
            </View>

            {currentLesson.vocabulary?.length > 0 ? (
                currentLesson.vocabulary.map((item, index) => (
                    <VocabCard key={index} item={item} index={index} />
                ))
            ) : (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}><Ionicons name="book-outline" size={36} color={ACCENT} /></View>
                    <Text style={styles.emptyTitle}>No vocabulary yet</Text>
                    <Text style={styles.emptyText}>This lesson doesn't have vocabulary words.</Text>
                </View>
            )}
            <View style={{ height: 30 }} />
        </ScrollView>
    );

    // ── Tab: Read / Article ──────────────────────────────────────────────────
    const fontSizeMap = { compact: 14, comfortable: 16, large: 19 };
    const lineHeightMap = { compact: 22, comfortable: 28, large: 34 };

    const preprocessMarkdown = (text) => text
        .replace(/\*\*(.*?)\*\*/g, '**$1**')
        .replace(/\*([^*]+)\*/g, '**$1**')
        .replace(/^\* (.*)/gm, '- $1')
        .replace(/^• (.*)/gm, '- $1')
        .replace(/^#(\w)/gm, '# $1')
        .replace(/^##(\w)/gm, '## $1')
        .replace(/^###(\w)/gm, '### $1')
        .replace(/\*{3,}/g, '**')
        .replace(/^(#{1,6} .*?):\*+$/gm, '$1:')
        .replace(/^(#{1,6} .*?)\*+$/gm, '$1');

    const getMarkdownStyles = () => {
        const fs = fontSizeMap[readingMode];
        const lh = lineHeightMap[readingMode];
        return {
            body: { color: READ_TEXT, fontSize: fs, lineHeight: lh },
            heading1: { fontSize: fs + 12, fontWeight: '800', color: '#F8FAFC', marginTop: 24, marginBottom: 12, borderBottomWidth: 2, borderBottomColor: GOLD, paddingBottom: 8 },
            heading2: { fontSize: fs + 8, fontWeight: '700', color: '#F1F5F9', marginTop: 20, marginBottom: 8 },
            heading3: { fontSize: fs + 4, fontWeight: '700', color: '#CBD5E1', marginTop: 16, marginBottom: 6 },
            heading4: { fontSize: fs + 2, fontWeight: '600', color: '#CBD5E1', marginTop: 14, marginBottom: 4 },
            heading5: { fontSize: fs, fontWeight: '600', color: '#CBD5E1', marginTop: 12, marginBottom: 4 },
            heading6: { fontSize: fs - 2, fontWeight: '600', color: '#CBD5E1', marginTop: 10, marginBottom: 4 },
            paragraph: { marginBottom: 14, lineHeight: lh, color: READ_TEXT, fontSize: fs },
            strong: { fontWeight: '800', color: '#F8FAFC' },
            em: { fontStyle: 'italic', color: READ_MUTED },
            bullet_list: { marginBottom: 10 },
            ordered_list: { marginBottom: 10 },
            list_item: { flexDirection: 'row', marginBottom: 6 },
            bullet_list_icon: { marginRight: 8, color: ACCENT, fontSize: fs + 2, lineHeight: lh },
            ordered_list_icon: { marginRight: 8, color: ACCENT, fontWeight: '700', lineHeight: lh },
            link: { color: '#60A5FA', textDecorationLine: 'underline' },
            code_inline: { backgroundColor: '#1C2A3A', color: '#FCD34D', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: fs - 2 },
            code_block: { backgroundColor: '#0D1117', color: '#86EFAC', fontSize: fs - 2, padding: 14, borderRadius: 10, marginVertical: 10, borderWidth: 1, borderColor: READ_BORDER },
            fence: { backgroundColor: '#0D1117', padding: 14, borderRadius: 10, marginVertical: 10, borderWidth: 1, borderColor: READ_BORDER },
            blockquote: { backgroundColor: '#1E293B', borderLeftWidth: 4, borderLeftColor: GOLD, paddingVertical: 12, paddingHorizontal: 14, marginVertical: 12, borderRadius: 6 },
            table: { borderWidth: 1, borderColor: READ_BORDER, borderRadius: 8, overflow: 'hidden', marginVertical: 12 },
            thead: { backgroundColor: '#1E3A5F' },
            th: { padding: 10, fontWeight: '700', color: '#F8FAFC', fontSize: fs - 2 },
            td: { padding: 10, color: READ_TEXT, fontSize: fs - 2 },
            tr: { borderBottomWidth: 1, borderBottomColor: READ_BORDER },
            hr: { backgroundColor: READ_BORDER, height: 1, marginVertical: 18 },
        };
    };

    const renderArticle = () => {
        const processedContent = preprocessMarkdown(currentLesson.content || '');
        return (
            <ScrollView style={[styles.tabContent, { backgroundColor: '#0F172A' }]} showsVerticalScrollIndicator={false}>
                {/* Reading controls */}
                <View style={styles.readControls}>
                    <View style={styles.readControlLeft}>
                        <Ionicons name="book-outline" size={15} color={GOLD} />
                        <Text style={styles.readControlLabel}>Reading Mode</Text>
                    </View>
                    <View style={styles.readSizeButtons}>
                        {[['S', 'compact'], ['M', 'comfortable'], ['L', 'large']].map(([label, mode]) => (
                            <TouchableOpacity key={mode}
                                style={[styles.readSizeBtn, readingMode === mode && styles.readSizeBtnActive]}
                                onPress={() => setReadingMode(mode)}>
                                <Text style={[styles.readSizeBtnText, readingMode === mode && styles.readSizeBtnTextActive]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Article card */}
                <View style={styles.articleCard}>
                    <View style={styles.articleTitleRow}>
                        <View style={styles.articleTitleAccent} />
                        <Text style={styles.articleLessonTitle}>{currentLesson.title}</Text>
                    </View>
                    {processedContent ? (
                        <Markdown
                            style={getMarkdownStyles()}
                            onLinkPress={(url) => { Linking.openURL(url).catch(console.error); return true; }}
                            rules={{
                                list_item: (node, children, parent, s) => (
                                    <View key={node.key} style={s.list_item}>
                                        <Text style={s.bullet_list_icon}>
                                            {node.markupType === 'ordered' ? `${node.index + 1}.` : '•'}
                                        </Text>
                                        <View style={{ flex: 1 }}>{children}</View>
                                    </View>
                                ),
                                strong: (node, children, parent, s) => (
                                    <Text key={node.key} style={s.strong}>{children}</Text>
                                ),
                            }}
                        >
                            {processedContent}
                        </Markdown>
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}><Ionicons name="document-outline" size={36} color={GOLD} /></View>
                            <Text style={styles.emptyTitle}>No content yet</Text>
                        </View>
                    )}
                </View>

                {/* Related articles */}
                {currentLesson.articles?.length > 0 && (
                    <View style={styles.relatedSection}>
                        <View style={styles.relatedHeader}>
                            <Ionicons name="link" size={16} color={GOLD} />
                            <Text style={styles.relatedTitle}>Related Articles</Text>
                        </View>
                        {currentLesson.articles.map((article, i) => (
                            <TouchableOpacity key={article.id || i} style={styles.articleLinkCard}
                                onPress={() => Linking.openURL(article.url)} activeOpacity={0.75}>
                                <View style={styles.articleLinkIcon}>
                                    <Ionicons name="open-outline" size={16} color={GOLD} />
                                </View>
                                <Text style={styles.articleLinkText} numberOfLines={2}>{article.title}</Text>
                                <Ionicons name="chevron-forward" size={16} color={READ_MUTED} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        );
    };

    // ── Tab: Video ────────────────────────────────────────────────────────────
    const renderVideo = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>Related Videos</Text>
            {currentLesson.videos?.length > 0 ? (
                currentLesson.videos.map((video, index) => (
                    <TouchableOpacity key={video.id || index} style={styles.videoCard}
                        onPress={() => setSelectedVideo(video)} activeOpacity={0.9}>
                        <View style={styles.thumbnailContainer}>
                            {video.thumbnailUrl ? (
                                <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumbnail} />
                            ) : (
                                <View style={styles.videoPlaceholderSmall}>
                                    <Ionicons name="play-circle" size={50} color={ACCENT} />
                                </View>
                            )}
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.videoOverlay}>
                                <View style={styles.playButton}>
                                    <Ionicons name="play" size={24} color="#fff" />
                                </View>
                            </LinearGradient>
                        </View>
                        <View style={styles.videoInfo}>
                            <Text style={styles.videoTitle}>{video.title}</Text>
                            <Text style={styles.videoDescription} numberOfLines={2}>{video.description}</Text>
                            <View style={styles.watchBadge}>
                                <Ionicons name="play" size={12} color={DARK_BG} />
                                <Text style={styles.watchBadgeText}>Watch Now</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}><Ionicons name="videocam-outline" size={36} color={ACCENT2} /></View>
                    <Text style={styles.emptyTitle}>No videos yet</Text>
                    <Text style={styles.emptyText}>No videos available for this lesson.</Text>
                </View>
            )}

            <Modal visible={!!selectedVideo} animationType="slide" transparent={false}
                onRequestClose={() => setSelectedVideo(null)}>
                <SafeAreaView style={styles.modalContainer}>
                    <LinearGradient colors={['#0A2540', '#080C14']} style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setSelectedVideo(null)} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle} numberOfLines={1}>{selectedVideo?.title}</Text>
                    </LinearGradient>
                    {Platform.OS === 'web' ? (
                        <iframe src={getEmbedUrl(selectedVideo?.url || selectedVideo?.videoUrl)}
                            width="100%" height="100%" frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen style={{ border: 'none' }} />
                    ) : (
                        <WebView style={styles.webview} javaScriptEnabled domStorageEnabled
                            source={{ uri: getEmbedUrl(selectedVideo?.url || selectedVideo?.videoUrl) }} />
                    )}
                </SafeAreaView>
            </Modal>
            <View style={{ height: 30 }} />
        </ScrollView>
    );

    // ── Tab: AI Chat ──────────────────────────────────────────────────────────
    const renderAI = () => (
        <View style={[styles.chatContainer]}>
            {/* Chat header */}
            <LinearGradient colors={['#0A2540', '#0D1117']} style={styles.chatHeader}>
                <View style={styles.aiBotAvatar}>
                    <Ionicons name="sparkles" size={20} color={GOLD} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.chatHeaderTitle}>Fidel AI Tutor</Text>
                    <Text style={styles.chatHeaderSub}>Ask anything about this lesson</Text>
                </View>
                <View style={styles.onlineDot} />
            </LinearGradient>

            <ScrollView style={styles.chatList} contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}>
                {/* Welcome bubble */}
                <View style={styles.aiRow}>
                    <View style={styles.aiAvatarSmall}>
                        <Ionicons name="sparkles" size={12} color={GOLD} />
                    </View>
                    <View style={styles.aiMessage}>
                        <Text style={styles.messageText}>Hi! I'm your AI tutor. Ask me anything about this lesson. 🎓</Text>
                    </View>
                </View>

                {chatMessages.map(msg =>
                    msg.sender === 'user' ? (
                        <View key={msg.id} style={styles.userRow}>
                            <View style={styles.userMessage}>
                                <Text style={styles.userMessageText}>{msg.text}</Text>
                            </View>
                        </View>
                    ) : (
                        <View key={msg.id} style={styles.aiRow}>
                            <View style={styles.aiAvatarSmall}>
                                <Ionicons name="sparkles" size={12} color={GOLD} />
                            </View>
                            <View style={styles.aiMessage}>
                                <Text style={styles.messageText}>{msg.text}</Text>
                            </View>
                        </View>
                    )
                )}

                {isAiTyping && (
                    <View style={styles.aiRow}>
                        <View style={styles.aiAvatarSmall}>
                            <Ionicons name="sparkles" size={12} color={GOLD} />
                        </View>
                        <View style={[styles.aiMessage, { paddingVertical: 10 }]}>
                            <Text style={{ color: GOLD, fontSize: 18, letterSpacing: 4 }}>● ● ●</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputArea}>
                <TextInput style={styles.chatInput}
                    placeholder="Ask a question…" placeholderTextColor={AI_MUTED}
                    value={inputMessage} onChangeText={setInputMessage} multiline />
                <TouchableOpacity
                    style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
                    onPress={handleSendMessage} disabled={!inputMessage.trim() || isAiTyping}>
                    <Ionicons name="send" size={18}
                        color={inputMessage.trim() ? DARK_BG : AI_MUTED} />
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
        { key: 'ai', label: 'Ask AI', icon: 'sparkles' },
    ];

    const tabAccent = { vocab: ACCENT, article: GOLD, video: ACCENT2, ai: GOLD };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ── Dark Gradient Header ── */}
            <LinearGradient colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.heroBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.glowBlob} />
                <View style={styles.heroRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                        <Text style={styles.heroTitle} numberOfLines={1}>{currentLesson.title}</Text>
                        <View style={styles.heroMeta}>
                            <View style={styles.lessonStatusDot} />
                            <Text style={styles.heroSub}>
                                {currentLesson.isCompleted ? 'Completed' : 'In Progress'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.lessonBadge}>
                        <Ionicons name="school-outline" size={14} color={ACCENT} />
                        <Text style={styles.lessonBadgeText}>Lesson</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ── Tab Bar ── */}
            <View style={styles.tabBar}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.key;
                    const color = tabAccent[tab.key];
                    return (
                        <TouchableOpacity key={tab.key} style={styles.tabItem}
                            onPress={() => setActiveTab(tab.key)}>
                            <View style={[styles.tabIconWrap,
                            isActive && { backgroundColor: color + '22', borderColor: color }]}>
                                <Ionicons name={tab.icon} size={17}
                                    color={isActive ? color : '#4B5563'} />
                            </View>
                            <Text style={[styles.tabText, isActive && { color, fontWeight: '700' }]}>
                                {tab.label}
                            </Text>
                            {isActive && <View style={[styles.tabActiveLine, { backgroundColor: color }]} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── Content ── */}
            <View style={styles.content}>{renderTabContent()}</View>

            {/* ── Footer ── */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                    <LinearGradient colors={[ACCENT, '#059669']}
                        style={styles.completeBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.completeButtonText}>Mark Complete</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}
