import { StyleSheet, Platform } from 'react-native';
import { SPACING, BORDER_RADIUS } from '../../src/constants/theme';
export default StyleSheet.create({
    container: { flex: 1 },
    fullCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
    loadingText: { color: '#9CA3AF', marginTop: 8 },
    scroll: { paddingBottom: 120 },

    // Hero
    hero: { padding: SPACING.lg, paddingTop: SPACING.xl },
    heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
    langPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F59E0B22', borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.sm, paddingVertical: 4,
        borderWidth: 1, borderColor: '#F59E0B44',
    },
    langText: { color: '#F59E0B', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    heroTitle: { fontSize: 30, fontWeight: 'bold', color: '#fff', lineHeight: 36, marginBottom: SPACING.md },

    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
    enrolledChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#10B98111', borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.md, paddingVertical: 6,
        borderWidth: 1, borderColor: '#10B98133', alignSelf: 'flex-start',
    },
    enrolledChipText: { color: '#10B981', fontSize: 12, fontWeight: '600' },

    // Tabs
    section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: SPACING.md },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F59E0B22', alignItems: 'center', justifyContent: 'center' },

    // Course cards
    courseCard: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.md,
        borderWidth: 1, borderColor: '#1E2D44', overflow: 'hidden',
    },
    courseNumBadge: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: '#F59E0B22',
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F59E0B44',
    },
    courseNum: { color: '#F59E0B', fontWeight: 'bold', fontSize: 15 },
    courseBody: { flex: 1 },
    courseName: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4 },
    courseDesc: { color: '#9CA3AF', fontSize: 13, lineHeight: 18 },
    instructorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    instructorName: { color: '#F59E0B', fontSize: 12, fontWeight: '600' },

    // Pricing
    pricingCard: {
        borderRadius: 20, padding: SPACING.lg, marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl, overflow: 'hidden',
        borderWidth: 1, borderColor: '#F59E0B33',
    },
    pricingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
    pricingLabel: { color: '#9CA3AF', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
    pricingValue: { fontSize: 40, fontWeight: 'bold', color: '#F59E0B', marginTop: 2 },
    pricingCurrency: { fontSize: 18, fontWeight: '600', color: '#F59E0BAA' },
    paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
    paidText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    pricingNote: { color: '#6B7280', fontSize: 12, marginTop: 4, marginBottom: SPACING.md },
    includedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
    includedItem: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#0A162855', borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.sm, paddingVertical: 6,
        borderWidth: 1, borderColor: '#1E2D44',
    },
    includedLabel: { color: '#D1D5DB', fontSize: 12 },

    // About
    aboutCard: { borderRadius: 16, padding: SPACING.lg, overflow: 'hidden', borderWidth: 1, borderColor: '#1E2D44' },
    aboutText: { color: '#D1D5DB', fontSize: 15, lineHeight: 24, marginBottom: SPACING.lg },
    metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    metaItem: {
        flex: 1, minWidth: '45%', backgroundColor: '#0A162855',
        borderRadius: BORDER_RADIUS.md, padding: SPACING.sm,
        alignItems: 'flex-start', gap: 3, borderWidth: 1, borderColor: '#1E2D44',
    },
    metaLabel: { color: '#6B7280', fontSize: 11, textTransform: 'uppercase' },
    metaValue: { color: '#fff', fontWeight: '600', fontSize: 13 },

    // Progress
    progressCard: {
        borderRadius: 20, padding: SPACING.lg, marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl, overflow: 'hidden', borderWidth: 1, borderColor: '#1E2D44',
    },
    progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    progressTitle: { color: '#fff', fontWeight: 'bold', fontSize: 17, marginBottom: 4 },
    progressSub: { color: '#9CA3AF', fontSize: 13 },
    progressBarBg: { height: 8, backgroundColor: '#1E2D44', borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.md },
    progressBarFill: { height: '100%', borderRadius: 4 },
    continueBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, backgroundColor: '#F59E0B', paddingVertical: 12, borderRadius: 10,
    },
    continueBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 14 },

    // Schedule
    scheduleCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.md,
        overflow: 'hidden', borderWidth: 1, borderColor: '#1E2D44',
    },
    scheduleLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
    scheduleIconWrap: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: '#F59E0B22', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#F59E0B44',
    },
    scheduleDay: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    scheduleTime: { color: '#F59E0B', fontSize: 13, marginTop: 2, fontWeight: '600' },
    attendanceBadge: {
        marginTop: 4, backgroundColor: '#3B82F622', borderRadius: 6,
        paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start',
    },
    attendanceText: { color: '#60A5FA', fontSize: 11, fontWeight: '600' },
    joinBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F59E0B', paddingHorizontal: SPACING.md,
        paddingVertical: 9, borderRadius: 10,
    },
    joinBtnLoading: { opacity: 0.6 },
    joinBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 13 },

    // Resources
    resourcesSub: { color: '#6B7280', fontSize: 13, marginBottom: SPACING.md },
    videoCard: {
        flexDirection: 'row', borderRadius: 16, overflow: 'hidden',
        marginBottom: SPACING.md, borderWidth: 1, borderColor: '#1E2D44',
    },
    videoThumb: {
        width: 110, height: 85, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    videoBody: { flex: 1, padding: SPACING.md, justifyContent: 'space-between' },
    videoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 13, lineHeight: 18 },
    videoDurationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    videoDuration: { color: '#6B7280', fontSize: 12 },
    watchText: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold' },
    refreshVideosBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10,
    },
    refreshVideosBtnText: { color: '#F59E0B', fontWeight: '600' },

    // Empty box (shared)
    emptyBox: {
        borderRadius: 20, padding: SPACING.xl, alignItems: 'center',
        gap: SPACING.sm, overflow: 'hidden', borderWidth: 1,
        borderColor: '#1E2D44', borderStyle: 'dashed', minHeight: 200, justifyContent: 'center',
    },
    emptyTitle: { color: '#9CA3AF', fontWeight: '700', fontSize: 18 },
    emptyDesc: { color: '#4B5563', textAlign: 'center', lineHeight: 20, maxWidth: 260 },
    aiGenerateBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F59E0B', paddingHorizontal: SPACING.xl,
        paddingVertical: 12, borderRadius: BORDER_RADIUS.full, marginTop: SPACING.sm,
    },
    aiGenerateBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 15 },

    // Footer
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: SPACING.md, paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md,
        backgroundColor: '#0A1628EE', borderTopWidth: 1, borderTopColor: '#1E2D44',
    },
    enrolledFooter: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#10B98111', borderRadius: 14, paddingHorizontal: SPACING.md, paddingVertical: 12,
        borderWidth: 1, borderColor: '#10B98133',
    },
    enrolledFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    enrolledFooterTitle: { color: '#10B981', fontWeight: 'bold', fontSize: 14 },
    enrolledFooterSub: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
    studyBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F59E0B', paddingHorizontal: SPACING.md,
        paddingVertical: 8, borderRadius: 10,
    },
    studyBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 13 },
    payBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 16, borderRadius: 14, overflow: 'hidden',
        shadowColor: '#F59E0B', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    payBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
    payBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 17 },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#000' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: '#0A1628', gap: SPACING.sm },
    modalCloseBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { flex: 1, color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
// Stat pill style
export const stat = StyleSheet.create({
    pill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#0F1B33', borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.sm, paddingVertical: 5,
        borderWidth: 1, borderColor: '#1E2D44',
    },
    label: { fontSize: 12, fontWeight: '600' },
});
// Tab bar style
export const tabBar = StyleSheet.create({
    container: {
        flexDirection: 'row', gap: 4,
        paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg,
    },
    item: {
        flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        paddingVertical: 10, borderRadius: 12, gap: 3,
        backgroundColor: '#0F1B33', borderWidth: 1, borderColor: '#1E2D44',
    },
    itemActive: { borderColor: '#F59E0B66', overflow: 'hidden' },
    label: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
    labelActive: { color: '#1A1A2E', fontWeight: 'bold' },
    labelLocked: { color: '#374151' },
    lock: { position: 'absolute', top: 4, right: 4 },
});
