import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    Modal, Switch, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import styles from '../../../app/styles/profileStyle';

const FeedbackModal = ({ visible, onClose, onSubmit, isSubmitting }) => {
    const [feedbackForm, setFeedbackForm] = useState({ content: '', rate: 5, isAnonymous: false });

    const handleSubmit = async () => {
        if (!feedbackForm.content.trim()) {
            return;
        }
        const success = await onSubmit(feedbackForm);
        if (success) {
            setFeedbackForm({ content: '', rate: 5, isAnonymous: false });
        }
    };

    const handleClose = () => {
        setFeedbackForm({ content: '', rate: 5, isAnonymous: false });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, justifyContent: 'flex-end' }}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Platform Feedback</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Rate your experience</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => setFeedbackForm({ ...feedbackForm, rate: s })}
                                >
                                    <Ionicons
                                        name={feedbackForm.rate >= s ? 'star' : 'star-outline'}
                                        size={30}
                                        color={feedbackForm.rate >= s ? '#F59E0B' : '#374151'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Your Feedback</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            numberOfLines={4}
                            placeholder="Tell us what you think..."
                            placeholderTextColor="#4B5563"
                            value={feedbackForm.content}
                            onChangeText={(t) => setFeedbackForm({ ...feedbackForm, content: t })}
                        />

                        <View style={styles.anonRow}>
                            <Text style={styles.inputLabel}>Submit Anonymously</Text>
                            <Switch
                                value={feedbackForm.isAnonymous}
                                onValueChange={(v) => setFeedbackForm({ ...feedbackForm, isAnonymous: v })}
                                trackColor={{ false: '#374151', true: COLORS.primary }}
                                thumbColor="#fff"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSubmit}
                            disabled={isSubmitting || !feedbackForm.content.trim()}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, '#059669']}
                                style={styles.saveBtnGrad}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Submit Feedback</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default FeedbackModal;