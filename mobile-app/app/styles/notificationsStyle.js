import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary || '#111827',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    header: {
        paddingTop: 15,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    markReadBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    markReadBtnText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    notificationCard: {
        backgroundColor: 'rgba(31, 41, 55, 0.5)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#374151',
    },
    unreadCard: {
        backgroundColor: 'rgba(31, 41, 55, 0.8)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    contentContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D1D5DB',
        marginBottom: 4,
    },
    unreadText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    notificationContent: {
        fontSize: 14,
        color: '#9CA3AF',
        lineHeight: 20,
    },
    notificationDate: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    deleteButton: {
        padding: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: SPACING.md,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});
