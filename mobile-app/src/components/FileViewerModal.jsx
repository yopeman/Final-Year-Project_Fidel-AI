import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Conditional import for WebView to avoid issues on web
let WebView;
if (Platform.OS !== 'web') {
    WebView = require('react-native-webview').WebView;
}

const FileViewerModal = ({ visible, onClose, fileUrl, title }) => {
    const renderContent = () => {
        if (!fileUrl) {
            return (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.errorText}>No file available</Text>
                </View>
            );
        }

        if (Platform.OS === 'web') {
            return (
                <iframe
                    src={fileUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={title || 'File Viewer'}
                />
            );
        }

        return (
            <WebView
                source={{ uri: fileUrl }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                )}
                scalesPageToFit={true}
            />
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title} numberOfLines={1}>{title || 'File Viewer'}</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.webViewContainer}>
                    {renderContent()}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#080C14',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#0F172A',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    webViewContainer: {
        flex: 1,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#080C14',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: 'rgba(255,255,255,0.4)',
        marginTop: 12,
        fontSize: 15,
    }
});

export default FileViewerModal;
