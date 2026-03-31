import { StyleSheet } from 'react-native';
import { COLORS } from '../../src/constants/theme';
export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },
    scrollView: { flex: 1 },

    // Hero
    heroBanner: {
        paddingTop: 18,
        paddingHorizontal: 20,
        paddingBottom: 28,
        overflow: 'hidden',
    },
    glowBlob: {
        position: 'absolute', top: -40, right: -40,
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(16,185,129,0.12)',
    },
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 28,
    },
    topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    menuBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    greeting: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
    userName: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
    subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    notifBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    notifDot: {
        position: 'absolute', top: 8, right: 8,
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#080C14',
    },
    avatarRing: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center', padding: 2,
    },
    avatarInner: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: '#111827',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },

    // Hero progress card
    heroProgressCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20, padding: 18, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    heroProgressLeft: { flex: 1 },
    heroProgressLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
    heroProgressValue: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
    heroStatRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    heroStatText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    dotSep: {
        width: 3, height: 3, borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4,
    },
    circleProgressWrapper: { marginLeft: 16 },

    // Hero bar
    heroBarBg: {
        height: 6, backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 3, overflow: 'hidden',
    },
    heroBarFill: {
        height: '100%', borderRadius: 3,
        backgroundColor: COLORS.primary,
    },

    // Body
    body: { paddingHorizontal: 20, paddingTop: 24 },
    section: { marginBottom: 28 },
    sectionHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

    // Up Next
    upNextSection: { marginBottom: 28 },
    upNextCard: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 18, padding: 16,
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    upNextIconWrapper: { marginRight: 14 },
    upNextIcon: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    upNextInfo: { flex: 1 },
    upNextModule: {
        fontSize: 11, fontWeight: '700', color: COLORS.primary,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
    },
    upNextLesson: { fontSize: 16, fontWeight: '600', color: '#fff' },
    upNextChevron: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: 'rgba(16,185,129,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },

    // Quick Actions
    actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    actionTile: {
        flex: 1, borderRadius: 18, padding: 14, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    actionIconCircle: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    actionLabel: { color: '#D1D5DB', fontSize: 12, fontWeight: '600', textAlign: 'center' },

    // Premium
    premiumRow: { flexDirection: 'row', gap: 10 },
    premiumTile: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 18, padding: 14, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        position: 'relative',
    },
    premiumTileLocked: { opacity: 0.6 },
    premiumTileIcon: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    premiumTileLabel: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },
    lockOverlay: {
        position: 'absolute', top: 8, right: 8,
        backgroundColor: 'rgba(255,255,255,0.06)',
        width: 20, height: 20, borderRadius: 6,
        alignItems: 'center', justifyContent: 'center',
    },
    activeDot: {
        position: 'absolute', top: 10, right: 10,
        width: 6, height: 6, borderRadius: 3,
    },
    activePill: {
        backgroundColor: 'rgba(16,185,129,0.15)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    },
    activePillText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
    lockedPill: {
        backgroundColor: 'rgba(107,114,128,0.15)',
        borderWidth: 1, borderColor: 'rgba(107,114,128,0.3)',
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    },
    lockedPillText: { color: '#6B7280', fontSize: 11, fontWeight: '700' },

    // Batches
    batchScroll: { marginHorizontal: -20, paddingLeft: 20 },
    batchCard: {
        width: 148, marginRight: 12,
        borderRadius: 18, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
    },
    batchGradient: { padding: 16 },
    batchIconWrap: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(245,158,11,0.15)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    batchName: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 10 },
    batchLevelPill: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(245,158,11,0.1)',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    },
    batchLevelText: { color: '#F59E0B', fontSize: 11, fontWeight: '700' },
});
