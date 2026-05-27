import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,Modal,
    Alert, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { useFeedbackStore } from '../../src/stores/feedbackStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/theme';
import { AGE_RANGES, PROFICIENCY_LEVELS } from '../../src/constants/index';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumMenu from '../../src/components/PremiumMenu';
import ProfileHero from '../../src/components/profile/ProfileHero';
import AccountSection from '../../src/components/profile/AccountSection';
import FeedbackModal from '../../src/components/profile/FeedbackModal';
import styles from '../styles/profileStyle';

const ProfileScreen = () => {
    const router = useRouter();
    const { user, logout, updateMe } = useAuthStore();
    const { profile, getProfile } = useProfileStore();
    const { submitFeedback, submitAnonymously, isLoading: isSubmittingFeedback } = useFeedbackStore();
    const { enrollments, premiumUnlocked } = useBatchStore();
    
    const [menuVisible, setMenuVisible] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [accountForm, setAccountForm] = useState({ 
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '' 
    });
    const [isLoading, setIsLoading] = useState(false);

    const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');

    useEffect(() => { getProfile(); }, []);

    useEffect(() => {
        if (user) {
            setAccountForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                password: '',
                confirmPassword: ''
            });
        }
    }, [user]);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: () => logout() },
        ]);
    };

    const handleSaveAccount = async () => {
        if (!accountForm.firstName || !accountForm.lastName || !accountForm.email) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        if (accountForm.password && accountForm.password !== accountForm.confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }

        const payload = { ...accountForm };
        delete payload.confirmPassword;
        if (!payload.password) delete payload.password;

        try {
            setIsLoading(true);
            const result = await updateMe(payload);
            if (result.success) {
                setIsEditingAccount(false);
                Alert.alert('Saved!', 'Account updated successfully.');
            } else {
                Alert.alert('Error', result.error || 'Failed to update account.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update account.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingAccount(false);
        if (user) {
            setAccountForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                password: '',
                confirmPassword: ''
            });
        }
    };

    const handleFeedbackSubmit = async (feedbackForm) => {
        if (!feedbackForm.content.trim()) {
            Alert.alert('Missing Content', 'Please write some feedback.');
            return false;
        }

        const result = feedbackForm.isAnonymous
            ? await submitAnonymously(feedbackForm.content, feedbackForm.rate)
            : await submitFeedback(feedbackForm.content, feedbackForm.rate);

        if (result.success) {
            setShowFeedbackModal(false);
            Alert.alert('Thank You!', 'Feedback submitted.');
            return true;
        } else {
            Alert.alert('Error', result.error || 'Failed to submit feedback.');
            return false;
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <ProfileHero
                        user={user}
                        profile={profile}
                        isPremium={isPremium}
                        onMenuPress={() => setMenuVisible(true)}
                    />

                    <View style={styles.body}>
                        <AccountSection
                            isEditing={isEditingAccount}
                            user={user}
                            accountForm={accountForm}
                            onEditPress={() => setIsEditingAccount(true)}
                            onFormChange={setAccountForm}
                            onSave={handleSaveAccount}
                            onCancel={handleCancelEdit}
                            isLoading={isLoading}
                        />

                        <View style={styles.menuSection}>
                            <TouchableOpacity
                                style={styles.menuRow}
                                onPress={() => setShowProfileModal(true)}
                            >
                                <View style={[styles.menuIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                                    <Ionicons name="school-outline" size={20} color={COLORS.primary} />
                                </View>
                                <Text style={styles.menuLabel}>Profile Settings</Text>
                                <Ionicons name="chevron-forward" size={18} color="#4B5563" />
                            </TouchableOpacity>

                            <View style={styles.menuDivider} />

                            <TouchableOpacity
                                style={styles.menuRow}
                                onPress={() => setShowFeedbackModal(true)}
                            >
                                <View style={[styles.menuIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                                    <Ionicons name="chatbox-ellipses-outline" size={20} color={COLORS.primary} />
                                </View>
                                <Text style={styles.menuLabel}>Platform Feedback</Text>
                                <Ionicons name="chevron-forward" size={18} color="#4B5563" />
                            </TouchableOpacity>

                            <View style={styles.menuDivider} />

                            <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
                                <View style={[styles.menuIcon, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                                </View>
                                <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Log Out</Text>
                                <Ionicons name="chevron-forward" size={18} color="#4B5563" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <FeedbackModal
                    visible={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    onSubmit={handleFeedbackSubmit}
                    isSubmitting={isSubmittingFeedback}
                />

                {/* Profile Modal */}
                <Modal visible={showProfileModal} animationType="slide" transparent onRequestClose={() => setShowProfileModal(false)}>
                    <View style={styles.overlay}>
                        <View style={styles.modalBox}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>My Profile</Text>
                                <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.modalCloseBtn}>
                                    <Ionicons name="close" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {[
                                    { label: 'Age Range', value: AGE_RANGES[profile?.ageRange] || 'Not set' },
                                    { label: 'Native Language', value: profile?.nativeLanguage || 'Not set' },
                                    { label: 'Proficiency Level', value: PROFICIENCY_LEVELS[profile?.proficiency] || 'Not set' },
                                    { label: 'Learning Goal', value: profile?.learningGoal || 'Not set' },
                                    { label: 'Daily Study Time', value: profile?.targetDuration ? `${profile.targetDuration} ${profile.durationUnit}` : 'Not set' },
                                ].map(({ label, value }, i, arr) => (
                                    <View key={label}>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>{label}</Text>
                                            <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
                                        </View>
                                        {i < arr.length - 1 && <View style={styles.divider} />}
                                    </View>
                                ))}
                            </ScrollView>

                            <TouchableOpacity style={styles.saveBtn} onPress={() => setShowProfileModal(false)}>
                                <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                    <Text style={styles.saveBtnText}>Close</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ProfileScreen;