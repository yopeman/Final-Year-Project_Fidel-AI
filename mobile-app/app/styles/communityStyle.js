import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
const { width } = Dimensions.get('window');
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
    notifBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center'
    },

    // Composer
    composerCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        margin: 12, borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 8,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    composerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    attachmentButton: {
        padding: 4
    },
    verticalDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 4
    },
    composerInput: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        padding: 8,
        marginLeft: 4
    },
    sendButtonDisabled: {
        opacity: 0.5
    },
    previewContainer: {
        marginVertical: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 10,
        gap: 6,
        position: 'relative',
    },
    previewName: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        maxWidth: 100,
    },
    removeFileBtn: {
        marginLeft: 4,
    },
    composerActions: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)'
    },
    composerTool: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginRight: 20,
    },
    toolText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
    postBtn: {
        marginLeft: 'auto',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20, paddingVertical: 8,
        borderRadius: 12,
    },
    postBtnDisabled: { opacity: 0.5 },
    postBtnText: { color: '#fff', fontWeight: 'bold' },

    // Feed
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    postCard: {
        backgroundColor: '#0F172A',
        borderRadius: 20, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    authorAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center'
    },
    avatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    authorInfo: { flex: 1 },
    authorName: { color: '#fff', fontWeight: '600', fontSize: 15 },
    postTime: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
    postContent: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 22, marginBottom: 12 },

    attachmentsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    attachmentBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(16,185,129,0.12)',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    },
    attachmentName: { color: COLORS.primary, fontSize: 12, maxWidth: 120 },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 12 },
    actionsRow: { flexDirection: 'row', gap: 24 },
    actionItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },

    // Comments
    commentSection: {
        marginTop: 16, paddingTop: 16,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)'
    },
    commentItem: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    commentAvatar: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center'
    },
    commentAvatarText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    commentBubble: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 10, borderRadius: 12,
    },
    commentAuthor: { color: '#fff', fontWeight: '600', fontSize: 13, marginBottom: 2 },
    commentText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    commentInputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginTop: 8, paddingHorizontal: 4
    },
    commentInput: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#fff', paddingHorizontal: 15, paddingVertical: 8,
        borderRadius: 20, fontSize: 14
    },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyText: { color: 'rgba(255,255,255,0.3)', marginTop: 12, fontSize: 15 },

    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    reactionPicker: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 30,
        padding: 6,
        marginTop: 8,
        position: 'absolute',
        bottom: 50,
        left: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 100,
        gap: 10
    },
    reactionOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6
    },
    reactionOptionActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    reactionEmoji: { fontSize: 20 },
    reactionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },

    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4
    },
    commentReactions: {
        flexDirection: 'row',
        gap: 6
    },
    smallReaction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2
    },
    smallReactionActive: {
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderColor: 'rgba(16,185,129,0.2)',
        borderWidth: 1
    },
    smallEmoji: { fontSize: 12 },
    reactionCountText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700'
    }
});
