import { StyleSheet } from 'react-native';
import { COLORS } from '../../src/constants/theme';
export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },
    scrollContent: { paddingBottom: 50 },

    // Hero Banner
    heroBanner: {
        paddingTop: 32,
        paddingHorizontal: 20,
        paddingBottom: 28,
        overflow: 'hidden',
        alignItems: 'center',
    },
    menuBtn: {
        position: 'absolute',
        top: 32,
        left: 20,
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
    },
    glowBlob: {
        position: 'absolute', top: -50, right: -50,
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(16,185,129,0.1)',
    },
    avatarRing: {
        width: 88, height: 88, borderRadius: 44,
        alignItems: 'center', justifyContent: 'center',
        padding: 3, marginBottom: 14,
    },
    avatarInner: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#0D1B2A',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
    heroName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4, marginBottom: 16 },
    statsRow: { flexDirection: 'row', gap: 10 },
    statPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    },
    statPillText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

    // Body
    body: { paddingHorizontal: 16, paddingTop: 20 },

    // Card (Edit + Details)
    card: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        marginBottom: 16,
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 20 },

    // Input
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', marginBottom: 10, letterSpacing: 0.3 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 14, fontSize: 15, color: '#fff',
    },
    textArea: { height: 100, textAlignVertical: 'top' },

    // Chips
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingVertical: 9, paddingHorizontal: 16,
        borderRadius: 50, borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.08)',
    },
    chipActive: {
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderColor: COLORS.primary,
    },
    chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
    chipTextActive: { color: COLORS.primary, fontWeight: '700' },

    // Form actions
    formBtns: { marginTop: 8, gap: 10 },
    saveBtn: { borderRadius: 50, overflow: 'hidden' },
    saveBtnGrad: { paddingVertical: 15, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    cancelBtn: { alignItems: 'center', paddingVertical: 10 },
    cancelBtnText: { color: '#6B7280', fontWeight: '600' },

    // Detail rows
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, gap: 10 },
    detailLabel: { color: '#6B7280', fontSize: 14 },
    detailValue: { color: '#E5E7EB', fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, marginTop: 16, paddingVertical: 10,
        backgroundColor: 'rgba(16,185,129,0.08)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
        borderRadius: 50,
    },
    editBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },

    // Menu
    menuSection: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 20, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        marginBottom: 16,
    },
    menuRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, gap: 12,
    },
    menuIcon: {
        width: 38, height: 38, borderRadius: 11,
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { flex: 1, fontSize: 15, color: '#E5E7EB', fontWeight: '600' },
    menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16 },

    // Feedback Modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
    modalBox: {
        backgroundColor: '#0D1B2A',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24,
        borderWidth: 1, borderBottomWidth: 0,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    modalCloseBtn: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center', justifyContent: 'center',
    },
    starsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    anonRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginVertical: 16,
    },
});
