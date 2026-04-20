import { StyleSheet } from 'react-native';
import { COLORS } from '../../src/constants';
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    menuButton: {
        padding: 5,
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 15,
        paddingBottom: 30,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    aiRow: {
        justifyContent: 'flex-start',
    },
    aiAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.2)',
    },
    messageGlassBubble: {
        padding: 14,
        borderRadius: 22,
        maxWidth: '80%',
        borderWidth: 1,
    },
    aiGlassBubble: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 4,
    },
    userGlassBubble: {
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        borderColor: 'rgba(52, 211, 153, 0.3)',
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 22,
    },
    messageFooter: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    speakerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    audioLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginLeft: 6,
        fontWeight: '500',
    },
    userAudioLabel: {
        color: COLORS.primary,
    },
    userMessageText: {
        color: COLORS.primary,
    },
    typingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    typingDot: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 14,
    },
    footer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    suggestionsWrapper: {
        marginBottom: 15,
    },
    suggestionBubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    suggestionText: {
        color: '#D1D5DB',
        fontSize: 14,
    },
    suggestionBulbButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        marginBottom: 12,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
    },
    suggestionBulbText: {
        color: COLORS.primary,
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 28,
        padding: 6,
        paddingLeft: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconButton: {
        padding: 8,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    sendGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
