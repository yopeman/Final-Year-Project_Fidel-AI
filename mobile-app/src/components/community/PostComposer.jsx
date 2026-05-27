import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import styles from '../../../app/styles/communityStyle';

const PostComposer = ({ isPremium, onUpgrade, onSubmit, onFilePick, selectedFiles, onRemoveFile, isSubmitting }) => {
    const [newPost, setNewPost] = useState('');

    const handleSubmit = async () => {
        if (!newPost.trim() && selectedFiles.length === 0) return;
        const success = await onSubmit(newPost.trim());
        if (success) setNewPost('');
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!isPremium) {
        return (
            <TouchableOpacity
                style={[styles.composerCard, { alignItems: 'center', paddingVertical: 16, marginBottom: 16 }]}
                onPress={onUpgrade}
                activeOpacity={0.8}
            >
                <Ionicons name="lock-closed" size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
                <Text style={[styles.headerTitle, { fontSize: 16, textAlign: 'center' }]}>Batch Lounge is Premium</Text>
                <Text style={[styles.headerSubtitle, { textAlign: 'center', marginTop: 2, fontSize: 11 }]}>
                    Enroll in a batch to participate in discussions.
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.composerCard}>
                <View style={styles.composerRow}>
                    <TouchableOpacity style={styles.attachmentButton} onPress={onFilePick}>
                        <Ionicons name="attach-outline" size={24} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                    <View style={styles.verticalDivider} />
                    <TextInput
                        style={styles.composerInput}
                        placeholder="Write a message..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        multiline
                        value={newPost}
                        onChangeText={setNewPost}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!newPost.trim() && selectedFiles.length === 0) && styles.sendButtonDisabled]}
                        disabled={(!newPost.trim() && selectedFiles.length === 0) || isSubmitting}
                        onPress={handleSubmit}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color={(!newPost.trim() && selectedFiles.length === 0) ? 'rgba(255,255,255,0.2)' : COLORS.primary} />
                        )}
                    </TouchableOpacity>
                </View>
                {selectedFiles.length > 0 && (
                    <View style={styles.previewContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedFiles.map((file) => (
                                <View key={file.uri} style={styles.filePreview}>
                                    <Ionicons name={file.type?.includes('image') ? 'image' : 'document'} size={18} color={COLORS.primary} />
                                    <Text style={styles.previewName} numberOfLines={1}>{file.name}</Text>
                                    <TouchableOpacity style={styles.removeFileBtn} onPress={() => onRemoveFile(file.uri)}>
                                        <Ionicons name="close-circle" size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default PostComposer;