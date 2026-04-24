import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants';
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
    },
    title: {
        fontSize: FONTS.sizes.xxxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
        gap: SPACING.md,
    },
    lessonCard: {
        opacity: 1,
    },
    lessonCardLocked: {
        opacity: 0.6,
    },
    lessonCardCurrent: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    lessonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lessonNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    lessonNumberText: {
        fontSize: FONTS.sizes.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    textLocked: {
        color: COLORS.textSecondary,
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    lessonDescription: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    lessonMeta: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    lessonDuration: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
    },
    lessonXP: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    statusBadge: {
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    statusIcon: {
        fontSize: 20,
    },
});
