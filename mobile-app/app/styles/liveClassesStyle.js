import { StyleSheet } from 'react-native';
import { COLORS } from '../../src/constants/theme';
export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },
    heroBanner: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    menuBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    titleGroup: { flex: 1 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    bannerContainer: { marginVertical: 20 },
    joiningBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 15,
        padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    bannerText: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 18 },

    scheduleCard: {
        backgroundColor: '#0F172A',
        borderRadius: 20, marginBottom: 16,
        flexDirection: 'row', overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    statusIndicator: { width: 6 },
    cardContent: { flex: 1, padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    classTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
    liveBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
    liveText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    infoText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginLeft: 6 },

    joinBtn: { borderRadius: 12, overflow: 'hidden' },
    joinGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 12, gap: 8
    },
    joinBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyText: { color: 'rgba(255,255,255,0.3)', marginTop: 12, fontSize: 15 },
});
