import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../src/constants/theme';
const { height } = Dimensions.get('window');
export default StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    glowBlob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.6,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    centerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconBadge: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,193,7,0.3)',
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginBottom: 6,
        fontWeight: '600',
    },
    emailText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239,68,68,0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        gap: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    codeInput: {
        width: height * 0.055,
        height: height * 0.07,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    codeInputFilled: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(255,193,7,0.05)',
    },
    codeInputDisabled: {
        opacity: 0.5,
    },
    codeHint: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        marginBottom: 32,
        fontWeight: '600',
    },
    verifyButton: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 32,
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    resendText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 10,
        fontWeight: '600',
    },
    resendButtonText: {
        fontSize: 15,
        color: COLORS.primary,
        fontWeight: '800',
    },
    resendTimer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    resendTimerText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '700',
    },
    supportText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.25)',
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 20,
        paddingHorizontal: 20,
    },
});
