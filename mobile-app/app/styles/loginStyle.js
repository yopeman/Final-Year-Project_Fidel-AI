import { StyleSheet } from 'react-native';
import { COLORS } from '@/src/constants';

export default StyleSheet.create({
    container: {
        flex: 1,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
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
        alignItems: 'center',
        marginBottom: 32,
    },
    logoBadge: {
        width: 70,
        height: 70,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,193,7,0.3)',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginTop: 6,
        fontWeight: '600',
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#fff',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239,68,68,0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    loginButton: {
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 10,
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    linkButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '600',
    },
    linkHighlight: {
        color: COLORS.primary,
        fontWeight: '800',
    },
});
