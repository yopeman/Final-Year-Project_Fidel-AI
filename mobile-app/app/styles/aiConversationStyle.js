import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
const { width } = Dimensions.get('window');
const CARD_W = (width - SPACING.lg * 2 - 14) / 2;
export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },

    // Hero Banner
    heroBanner: {
        paddingTop: 32,
        paddingHorizontal: 20,
        paddingBottom: 28,
        overflow: 'hidden',
    },
    glowBlob: {
        position: 'absolute', top: -40, right: -40,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(16,185,129,0.1)',
    },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 6 },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
    statusText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
    historyBtn: {
        width: 42, height: 42, borderRadius: 14,
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },

    // Scroll
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: 40, paddingTop: 24 },

    // Hero
    heroWrapper: { marginBottom: 30 },
    heroCard: {
        borderRadius: 28, padding: 15, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    aiAvatarLarge: {
        width: 90, height: 90, alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
    },
    pulseRing: {
        position: 'absolute',
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 2, borderColor: COLORS.primary,
    },
    avatarInner: {
        width: 72, height: 72, borderRadius: 36,
        alignItems: 'center', justifyContent: 'center',
    },
    heroHeading: {
        fontSize: 22, fontWeight: 'bold', color: '#fff',
        textAlign: 'center', marginBottom: 10,
    },
    heroSubtext: {
        fontSize: 14, color: '#9CA3AF', textAlign: 'center',
        lineHeight: 22, marginBottom: 24, paddingHorizontal: 10,
    },
    heroButton: { borderRadius: 50, overflow: 'hidden', width: '80%' },
    heroButtonGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, gap: 8,
    },
    heroButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Section
    section: { marginBottom: 28 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 14,
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
    },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 0
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
    sectionCount: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

    // History
    historyCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: 14, borderRadius: 16, marginBottom: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    historyIconBg: {
        width: 44, height: 44, borderRadius: 13,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    historyInfo: { flex: 1 },
    historyTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
    historyDate: { color: '#6B7280', fontSize: 12, marginTop: 2 },
    resumeChip: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: 'rgba(16,185,129,0.1)',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    resumeText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },

    // Topic Grid
    grid: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', gap: 14,
    },
    topicCard: {
        width: CARD_W, height: CARD_W,
        borderRadius: 22, overflow: 'hidden',
    },
    topicGradient: {
        flex: 1, padding: 18,
        justifyContent: 'flex-end',
    },
    topicEmoji: { fontSize: 34, marginBottom: 8 },
    topicTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    topicDesc: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },

    // Custom topic
    customTopicCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
        borderRadius: 20, padding: 18, marginBottom: 30,
    },
    customTopicLabelRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12,
    },
    customTopicLabel: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    customInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    customInput: {
        flex: 1, color: '#fff', fontSize: 15,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    goButton: { width: 48, height: 48, borderRadius: 14, overflow: 'hidden' },
    goButtonDisabled: { opacity: 0.5 },
    goButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // Tip
    tipCard: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(245,158,11,0.08)',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
        padding: 14, borderRadius: 14,
    },
    tipText: { color: '#D1D5DB', fontSize: 13, flex: 1, lineHeight: 18 },
});
