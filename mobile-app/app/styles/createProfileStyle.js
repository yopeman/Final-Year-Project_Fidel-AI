import { StyleSheet } from 'react-native';
import { COLORS } from '../../src/constants/theme';
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#080C14',
    },
    heroBanner: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 30,
        overflow: 'hidden',
    },
    glowBlob: {
        position: 'absolute', top: -30, right: -30,
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(16,185,129,0.1)',
    },
    header: {
        gap: 12,
    },
    stepTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
    scrollContent: {
        padding: 24,
    },
    stepContainer: {
        gap: 24,
    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionChip: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    selectedOption: {
        backgroundColor: 'rgba(16,185,129,0.15)',
        borderColor: COLORS.primary,
    },
    optionText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#080C14',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 16,
        gap: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden',
    },
    nextButtonGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239,68,68,0.1)',
        padding: 14,
        borderRadius: 12,
        marginTop: 20,
        gap: 10,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
});
