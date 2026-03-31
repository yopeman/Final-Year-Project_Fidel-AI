import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../src/constants/theme';
const { width } = Dimensions.get('window');
export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },

    // Hero / Header
    heroBanner: {
        paddingTop: 48,
        paddingHorizontal: 20,
        paddingBottom: 24,
        overflow: 'hidden',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    glowBlob: {
        position: 'absolute', top: -30, right: -30,
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(16,185,129,0.1)',
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 },
    premiumBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: 12, alignSelf: 'flex-start',
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    },
    premiumBannerText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

    // List
    listContent: { paddingVertical: 20, paddingBottom: 40 },

    // Module Card
    moduleCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    },
    moduleHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    moduleHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    moduleNumberBadge: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    moduleNumber: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    moduleLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    moduleName: { color: '#fff', fontWeight: '700', fontSize: 15, marginTop: 2 },
    moduleProgressInfo: { alignItems: 'flex-end' },
    moduleProgressText: { fontSize: 18, fontWeight: '800' },
    moduleDoneLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },

    // Module progress bar
    moduleBarBg: {
        height: 3, backgroundColor: 'rgba(255,255,255,0.05)',
    },
    moduleBarFill: { height: '100%' },

    // Lessons
    lessonList: { paddingTop: 4, paddingBottom: 8 },
    lessonItem: {
        paddingHorizontal: 16, paddingVertical: 12,
        position: 'relative',
    },
    lessonLocked: { opacity: 0.55 },
    connectorLine: {
        position: 'absolute', top: 0, left: 36,
        width: 1, height: 12,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    lessonIconWrap: {
        width: 34, height: 34, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    lessonTextWrap: { flex: 1 },
    lessonTitle: { color: '#E5E7EB', fontSize: 14, fontWeight: '600' },
    lockedText: { color: '#4B5563' },
    lessonMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
    lessonTypeTag: { color: '#6B7280', fontSize: 11, fontWeight: '600' },
    dotSep: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#374151' },
    lessonDur: { color: '#6B7280', fontSize: 11 },
    completedBadge: {
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
    },
    completedBadgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
    lockPill: {
        backgroundColor: 'rgba(245,158,11,0.1)',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
    },
    lockPillText: { color: '#F59E0B', fontSize: 10, fontWeight: '700' },

    // Empty state
    emptyState: {
        paddingTop: 80, paddingHorizontal: 40, alignItems: 'center',
    },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.04)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
    emptySubtitle: { color: '#6B7280', fontSize: 14, marginBottom: 28 },
    reloadBtn: { borderRadius: 50, overflow: 'hidden' },
    reloadBtnGrad: { paddingHorizontal: 32, paddingVertical: 14 },
    reloadBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
