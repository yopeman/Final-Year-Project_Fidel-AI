import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
export default StyleSheet.create({
    container: { flex: 1 },

    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.md, paddingTop: 52, paddingBottom: SPACING.md,
        backgroundColor: '#0A162890',
        borderBottomWidth: 1, borderBottomColor: '#1E2D44',
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    topBarCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    topBarTitle: { color: '#fff', fontWeight: 'bold', fontSize: 17 },

    listContent: { padding: SPACING.md, paddingBottom: 100 },
    listHeader: { marginBottom: SPACING.md },
    listTitle: { color: '#fff', fontWeight: 'bold', fontSize: 22, marginBottom: 4 },
    listSub: { color: '#6B7280', fontSize: 13 },

    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
    loadingText: { color: '#6B7280' },

    emptyContainer: { paddingVertical: 60, alignItems: 'center', gap: SPACING.sm },
    emptyTitle: { color: '#9CA3AF', fontSize: 18, fontWeight: '600' },
    emptyDesc: { color: '#4B5563', textAlign: 'center', lineHeight: 20 },

    composeBar: {
        backgroundColor: '#0A1628',
        borderTopWidth: 1, borderTopColor: '#1E2D44',
        paddingHorizontal: SPACING.md, paddingTop: SPACING.sm,
        paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md,
    },
    composeInner: {
        flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm,
        backgroundColor: '#0F1B33',
        borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: '#1E3A5F',
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    },
    composeInput: {
        flex: 1, color: '#E5E7EB', fontSize: 14, maxHeight: 100,
        paddingVertical: Platform.OS === 'ios' ? 0 : 4,
    },
    postBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    postBtnDisabled: { backgroundColor: '#1E2D44' },
});
export const card = StyleSheet.create({
    wrapper: {
        backgroundColor: '#0D1E35',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1, borderColor: '#1E2D44',
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
    avatar: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: COLORS.primary + '33',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: COLORS.primary + '55',
    },
    avatarText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
    authorName: { color: '#E5E7EB', fontWeight: '700', fontSize: 14 },
    date: { color: '#4B5563', fontSize: 12, marginTop: 2 },

    content: { color: '#D1D5DB', fontSize: 15, lineHeight: 22, marginBottom: SPACING.md },

    emojiBar: {
        flexDirection: 'row', gap: SPACING.sm,
        backgroundColor: '#0A1628', borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.sm, borderWidth: 1, borderColor: '#1E2D44',
        alignSelf: 'flex-start', marginBottom: SPACING.sm,
    },
    emojiBtn: { padding: 4 },
    emoji: { fontSize: 22 },

    footer: {
        flexDirection: 'row', gap: SPACING.lg,
        borderTopWidth: 1, borderTopColor: '#1E2D44', paddingTop: SPACING.sm,
    },
    action: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingRight: SPACING.md },
    actionNum: { color: '#6B7280', fontSize: 13 },

    commentSection: { marginTop: SPACING.md },
    commentBubble: {
        flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    commentAvatar: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#1E3A5F', alignItems: 'center', justifyContent: 'center',
    },
    commentAvatarText: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold' },
    commentContent: {
        flex: 1, backgroundColor: '#0A1628', borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm, borderWidth: 1, borderColor: '#1E2D44',
    },
    commentAuthor: { color: '#9CA3AF', fontWeight: '700', fontSize: 11, marginBottom: 2 },
    commentText: { color: '#D1D5DB', fontSize: 13, lineHeight: 18 },

    commentInput: {
        flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm,
        backgroundColor: '#0A1628', borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1, borderColor: '#1E3A5F',
        paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
        marginTop: SPACING.sm,
    },
    input: { flex: 1, color: '#E5E7EB', fontSize: 13, maxHeight: 80, paddingVertical: 4 },
    sendBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    },
    sendBtnDisabled: { backgroundColor: '#1E2D44' },

    // Reaction buttons (always visible, 3 per post)
    reactionsGroup: {
        flexDirection: 'row',
        gap: 5,
        flex: 1,
    },
    reactionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: '#1E2D44',
    },
    reactionBtnEmoji: { fontSize: 14 },
    reactionBtnCount: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '600',
        minWidth: 8,
    },

    // Role badge & edited label
    roleBadge: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    roleBadgeText: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
    editedLabel: { color: 'rgba(255,255,255,0.25)', fontSize: 10 },
    commentTime: { color: 'rgba(255,255,255,0.25)', fontSize: 10 },

    // Post image
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: SPACING.sm,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },

    // Attachments
    attachmentsList: { marginBottom: SPACING.sm, gap: 6 },
    attachmentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    attachmentBadge: {
        flex: 1,
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(16,185,129,0.08)',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    },
    attachmentName: { flex: 1, color: COLORS.primary, fontSize: 12 },
    attachmentSize: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },

    // Attach panel
    attachPanel: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 10,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    attachPickBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    },
    attachPickBtnText: { color: '#000', fontWeight: '700', fontSize: 12 },
    attachFileCount: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
    attachFileRow: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 3,
    },
    attachFileName: { flex: 1, color: '#E5E7EB', fontSize: 11 },
    attachFileSize: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
    attachUploadBtn: {
        backgroundColor: '#10B981',
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    },
    attachUploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    attachCancelBtn: {
        paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    attachCancelBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

    // Owner icon button
    iconBtn: {
        padding: 5, borderRadius: 7,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },

    // Comment save/cancel
    saveBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 7,
    },
    saveBtnText: { color: '#000', fontWeight: '700', fontSize: 12 },
    cancelText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, paddingVertical: 5 },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#0D1E35',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        width: '100%',
        borderWidth: 1,
        borderColor: '#1E2D44',
    },
    modalTitle: { color: '#E5E7EB', fontWeight: '700', fontSize: 15, marginBottom: 8 },
    modalBody: { color: '#6B7280', fontSize: 13, lineHeight: 19, marginBottom: 16 },
    modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
    modalCancelBtn: {
        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
        borderWidth: 1, borderColor: '#1E2D44',
    },
    modalCancelText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
    modalConfirmBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
    },
    modalConfirmText: { color: '#000', fontWeight: '700', fontSize: 13 },
    modalDeleteBtn: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
    },
    modalDeleteText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
