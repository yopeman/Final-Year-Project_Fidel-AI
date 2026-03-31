import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../src/constants';
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    lessonHeader: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    lessonTitle: {
        fontSize: FONTS.sizes.xl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    lessonDescription: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
    },
    tabContent: {
        padding: SPACING.lg,
    },
    vocabCard: {
        marginBottom: SPACING.md,
    },
    vocabWord: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    vocabDefinition: {
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    vocabExample: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    articleCard: {
        marginBottom: SPACING.md,
    },
    articleTitle: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    articleContent: {
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
        lineHeight: 24,
    },
    videoCard: {
        marginBottom: SPACING.md,
    },
    videoTitle: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    videoPlaceholder: {
        backgroundColor: COLORS.border,
        height: 200,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    videoIcon: {
        fontSize: 48,
    },
    videoText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    },
    videoDescription: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
    },
    placeholderText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.xxl,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    chatContent: {
        padding: SPACING.md,
        flexGrow: 1,
    },
    chatEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatEmptyIcon: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    chatEmptyText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: SPACING.md,
        borderRadius: 16,
        marginBottom: SPACING.sm,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    messageText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
    },
    chatInputContainer: {
        flexDirection: 'row',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: SPACING.sm,
    },
    chatInput: {
        flex: 1,
        marginBottom: 0,
    },
    sendButton: {
        width: 80,
    },
    bottomBar: {
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    completeButton: {
        width: '100%',
    },
});
