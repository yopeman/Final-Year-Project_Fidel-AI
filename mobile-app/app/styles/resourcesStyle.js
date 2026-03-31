import { StyleSheet } from 'react-native';
// ─── Design tokens (consistent with app theme) ────────────────────────────────
export const DARK_BG = '#080C14';
export const DARK_CARD = 'rgba(255,255,255,0.04)';
export const DARK_BORDER = 'rgba(255,255,255,0.07)';
export const ACCENT = '#10B981';   // emerald green
export const GOLD = '#F59E0B';   // amber
export const INDIGO = '#6366F1';
export default StyleSheet.create({
    root: { flex: 1, backgroundColor: DARK_BG },
    scrollView: { flex: 1 },

    // ── Hero Banner ───────────────────────────────────────────────────────────
    heroBanner: {
        paddingTop: 52, paddingHorizontal: 20,
        paddingBottom: 24, overflow: 'hidden',
    },
    glowBlob: {
        position: 'absolute', top: -60, right: -60,
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(16,185,129,0.07)',
    },
    glowBlob2: {
        position: 'absolute', bottom: -40, left: -40,
        width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(245,158,11,0.04)',
    },
    heroEyebrow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    premiumBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(245,158,11,0.12)',
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
    },
    premiumText: {
        color: GOLD, fontWeight: '800', fontSize: 10, letterSpacing: 1.5,
    },
    heroTitle: {
        fontSize: 38, fontWeight: '900', color: '#fff',
        letterSpacing: -1.5, marginBottom: 8, lineHeight: 44,
    },
    heroSub: {
        color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 21, marginBottom: 20,
    },
    heroStatsRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    },
    heroStat: { flex: 1, alignItems: 'center' },
    heroStatNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
    heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '600', letterSpacing: 0.5 },
    heroStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.08)' },

    // ── Section ───────────────────────────────────────────────────────────────
    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14,
    },
    materialsSectionHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14,
    },
    sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionHeaderIcon: {
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
    sectionSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 1 },
    sectionCount: {
        backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 10, paddingVertical: 3,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    sectionCountText: { color: ACCENT, fontWeight: '700', fontSize: 12 },
    clearBtn: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
    },

    // ── Course Card ───────────────────────────────────────────────────────────
    courseCardWrapper: { marginBottom: 10 },
    courseCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        borderRadius: 16, padding: 16,
        borderWidth: 1,
    },
    courseIconCircle: {
        width: 50, height: 50, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },
    courseCardBody: { flex: 1 },
    courseName: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
    courseDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 8 },
    courseFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    matCountBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
        borderWidth: 1,
    },
    matCountText: { fontSize: 11, fontWeight: '700' },
    selectedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    },
    selectedText: { fontSize: 11, fontWeight: '700' },

    // ── Material Card ─────────────────────────────────────────────────────────
    matCard: {
        backgroundColor: DARK_CARD, borderRadius: 14,
        borderLeftWidth: 4, borderWidth: 1, borderColor: DARK_BORDER,
        paddingHorizontal: 14, paddingTop: 14, paddingBottom: 14,
    },
    matHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    matIndexBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    matIndexText: { fontSize: 12, fontWeight: '800' },
    matHeaderText: { flex: 1 },
    matName: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 },
    matMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    matMetaText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
    matDot: { color: '#374151', fontSize: 11 },
    matDescWrap: {
        marginTop: 10, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    },
    matDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 20, marginBottom: 12 },
    fileList: { marginTop: 8 },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 2,
    },
    fileIconWrapper: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 10
    },
    fileInfo: { flex: 1 },
    fileName: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 2 },
    fileSize: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },

    // ── States ────────────────────────────────────────────────────────────────
    loadingBox: { paddingTop: 40, alignItems: 'center', gap: 12 },
    loadingSpinner: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(245,158,11,0.08)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)', marginBottom: 4,
    },
    loadingText: { color: '#6B7280', fontSize: 13 },
    emptyState: { paddingTop: 40, alignItems: 'center', gap: 8, paddingBottom: 20 },
    emptyIcon: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: 'rgba(16,185,129,0.08)', alignItems: 'center', justifyContent: 'center',
        marginBottom: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)',
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#9CA3AF' },
    emptyText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },

    // Tip
    tipCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginTop: 8, marginBottom: 20,
        backgroundColor: 'rgba(99,102,241,0.06)',
        borderRadius: 14, padding: 14,
        borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)',
    },
    tipText: { flex: 1, fontSize: 13, color: '#9CA3AF', lineHeight: 18 },
});
