import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.sm,
        marginRight: SPACING.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.textSecondary,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    questionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    questionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    optionsContainer: {
        gap: SPACING.sm,
    },
    optionButton: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedOption: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
    },
    correctOption: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    wrongOption: {
        backgroundColor: COLORS.error,
        borderColor: COLORS.error,
    },
    optionText: {
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    whiteText: {
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    resultContainer: {
        marginTop: SPACING.xl,
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.sm,
    },
    resultScore: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
});
