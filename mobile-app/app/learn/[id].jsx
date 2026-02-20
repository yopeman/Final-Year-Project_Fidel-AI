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

// ── Design tokens ─────────────────────────────────────────────────────────────
const DARK_BG = '#080C14';
const DARK_CARD = 'rgba(255,255,255,0.04)';
const DARK_BORDER = 'rgba(255,255,255,0.07)';
const ACCENT = '#10B981';   // emerald — matches app theme
const ACCENT2 = '#6366F1';   // indigo
const GOLD = '#F59E0B';

const READ_CARD = '#111827';
const READ_BORDER = '#1F2937';
const READ_TEXT = '#E2E8F0';
const READ_MUTED = '#94A3B8';

const AI_CARD = '#0D1117';
const AI_BORDER = '#21262D';
const AI_BUBBLE_AI = '#1D2D44';
const AI_BUBBLE_U = '#4C1D95';
const AI_TEXT = '#F0F6FC';
const AI_MUTED = '#8B949E';

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

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: DARK_BG },

    // Loading
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DARK_BG },
    loadingSpinner: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
    loadingText: { color: '#6B7280', fontSize: 14 },

    // Hero banner
    heroBanner: { paddingTop: 44, paddingHorizontal: 16, paddingBottom: 18, overflow: 'hidden' },
    glowBlob: { position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(16,185,129,0.08)' },
    heroRow: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
    heroTitle: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
    lessonStatusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ACCENT },
    heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
    lessonBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    lessonBadgeText: { fontSize: 11, color: ACCENT, fontWeight: '700' },

    // Tab bar
    tabBar: { flexDirection: 'row', backgroundColor: '#0D1117', borderBottomWidth: 1, borderBottomColor: DARK_BORDER },
    tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 3, position: 'relative' },
    tabIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
    tabText: { fontSize: 10, color: '#4B5563', fontWeight: '500' },
    tabActiveLine: { position: 'absolute', bottom: 0, height: 2, width: '60%', borderRadius: 2 },

    // Content
    content: { flex: 1 },
    tabContent: { flex: 1, paddingHorizontal: 16, paddingTop: 16, backgroundColor: DARK_BG },

    // ── Vocab ──────────────────────────────────────────────────────────────
    vocabHeaderCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: DARK_CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: DARK_BORDER },
    vocabHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    vocabHeaderIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center' },
    vocabHeaderTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
    vocabCountBadge: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
    vocabCountText: { fontSize: 12, fontWeight: '700', color: ACCENT },

    vocabCard: { backgroundColor: DARK_CARD, borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: DARK_BORDER },
    vocabCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    vocabWordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    indexBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    indexBadgeText: { fontSize: 12, fontWeight: '700' },
    vocabWord: { fontSize: 17, fontWeight: '800', color: '#fff', flex: 1 },
    vocabDef: { fontSize: 14, color: '#9CA3AF', lineHeight: 22, marginBottom: 4 },
    exampleBox: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 8 },
    vocabExample: { fontSize: 13, fontStyle: 'italic', flex: 1, lineHeight: 20 },
    posBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 8 },
    posText: { fontSize: 12, fontWeight: '600' },

    // ── Read ───────────────────────────────────────────────────────────────
    readControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: READ_CARD, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, borderWidth: 1, borderColor: READ_BORDER },
    readControlLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    readControlLabel: { fontSize: 13, color: READ_MUTED, fontWeight: '500' },
    readSizeButtons: { flexDirection: 'row', gap: 6 },
    readSizeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: READ_BORDER },
    readSizeBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
    readSizeBtnText: { fontSize: 12, fontWeight: '800', color: READ_MUTED },
    readSizeBtnTextActive: { color: '#0F172A' },

    articleCard: { backgroundColor: READ_CARD, borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: READ_BORDER },
    articleTitleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18, gap: 12 },
    articleTitleAccent: { width: 4, borderRadius: 4, backgroundColor: GOLD, alignSelf: 'stretch', minHeight: 36 },
    articleLessonTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', flex: 1, lineHeight: 30 },

    relatedSection: { backgroundColor: READ_CARD, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: READ_BORDER },
    relatedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    relatedTitle: { fontSize: 15, fontWeight: '700', color: READ_TEXT },
    articleLinkCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: READ_BORDER, gap: 10 },
    articleLinkIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: GOLD + '22', alignItems: 'center', justifyContent: 'center' },
    articleLinkText: { flex: 1, fontSize: 14, color: READ_TEXT, fontWeight: '500' },

    // ── Video ──────────────────────────────────────────────────────────────
    sectionHeader: { fontSize: 17, fontWeight: '800', marginBottom: 14, color: '#fff' },
    videoCard: { backgroundColor: DARK_CARD, borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: DARK_BORDER },
    thumbnailContainer: { position: 'relative' },
    videoThumbnail: { width: '100%', height: 190 },
    videoPlaceholderSmall: { width: '100%', height: 190, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
    videoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', justifyContent: 'center', alignItems: 'center' },
    playButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
    videoInfo: { padding: 14 },
    videoTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
    videoDescription: { fontSize: 13, color: '#6B7280', marginBottom: 10, lineHeight: 20 },
    watchBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: ACCENT, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, alignSelf: 'flex-start' },
    watchBadgeText: { color: DARK_BG, fontSize: 12, fontWeight: '700' },

    modalContainer: { flex: 1, backgroundColor: '#000' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    closeButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    modalTitle: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700' },
    webview: { flex: 1 },

    // ── Empty ──────────────────────────────────────────────────────────────
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
    emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(16,185,129,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)' },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#9CA3AF', marginBottom: 6 },
    emptyText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },

    // ── AI Chat ────────────────────────────────────────────────────────────
    chatContainer: { flex: 1, backgroundColor: AI_CARD },
    chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: AI_BORDER },
    aiBotAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1C2D44', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: GOLD },
    chatHeaderTitle: { fontSize: 15, fontWeight: '700', color: AI_TEXT },
    chatHeaderSub: { fontSize: 12, color: AI_MUTED, marginTop: 1 },
    onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#161B22' },

    chatList: { flex: 1, paddingHorizontal: 14, paddingTop: 14 },
    aiRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
    userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
    aiAvatarSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1C2D44', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: GOLD + '66' },
    aiMessage: { backgroundColor: AI_BUBBLE_AI, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18, borderBottomLeftRadius: 4, maxWidth: '78%', borderWidth: 1, borderColor: '#2D3F5A' },
    userMessage: { backgroundColor: AI_BUBBLE_U, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18, borderBottomRightRadius: 4, maxWidth: '78%' },
    messageText: { fontSize: 15, color: AI_TEXT, lineHeight: 22 },
    userMessageText: { fontSize: 15, color: '#EDE9FE', lineHeight: 22 },

    inputArea: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#161B22', borderTopWidth: 1, borderTopColor: AI_BORDER, alignItems: 'flex-end', gap: 10 },
    chatInput: { flex: 1, backgroundColor: '#21262D', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, fontSize: 15, color: AI_TEXT, borderWidth: 1, borderColor: AI_BORDER, maxHeight: 100 },
    sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
    sendButtonDisabled: { backgroundColor: '#374151' },

    // Footer
    footer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#0D1117', borderTopWidth: 1, borderTopColor: DARK_BORDER },
    completeButton: { borderRadius: 50, overflow: 'hidden' },
    completeBtnGrad: { paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    completeButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});