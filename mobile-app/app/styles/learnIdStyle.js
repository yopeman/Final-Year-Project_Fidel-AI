import { StyleSheet } from 'react-native';
// ── Design tokens ─────────────────────────────────────────────────────────────
export const DARK_BG = '#080C14';
export const DARK_CARD = 'rgba(255,255,255,0.04)';
export const DARK_BORDER = 'rgba(255,255,255,0.07)';
export const ACCENT = '#10B981';   // emerald — matches app theme
export const ACCENT2 = '#6366F1';   // indigo
export const GOLD = '#F59E0B';
export const READ_CARD = '#111827';
export const READ_BORDER = '#1F2937';
export const READ_TEXT = '#E2E8F0';
export const READ_MUTED = '#94A3B8';
export const AI_CARD = '#0D1117';
export const AI_BORDER = '#21262D';
export const AI_BUBBLE_AI = '#1D2D44';
export const AI_BUBBLE_U = '#4C1D95';
export const AI_TEXT = '#F0F6FC';
export const AI_MUTED = '#8B949E';
export default StyleSheet.create({
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
