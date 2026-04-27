import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    Alert, ActivityIndicator, TextInput, Modal, Switch, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { useFeedbackStore } from '../../src/stores/feedbackStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { AGE_RANGES, PROFICIENCY_LEVELS } from '../../src/constants/index';
import { LinearGradient } from 'expo-linear-gradient';
import { useBatchStore } from '../../src/stores/batchStore';
import PremiumMenu from '../../src/components/PremiumMenu';
import styles from '../styles/profileStyle';

const ProfileScreen = () => {
    const router = useRouter();
    const { user, logout, updateMe } = useAuthStore();
    const { profile, getProfile, createProfile, updateProfile, isLoading: profileLoading } = useProfileStore();
    const { submitFeedback, submitAnonymously, isLoading: isSubmittingFeedback } = useFeedbackStore();
    const { enrollments, premiumUnlocked } = useBatchStore();
    const [menuVisible, setMenuVisible] = useState(false);

    const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({ content: '', rate: 5, isAnonymous: false });
    const [accountForm, setAccountForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);

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

    const handleFeedbackSubmit = async () => {
        if (!feedbackForm.content.trim()) { Alert.alert('Missing Content', 'Please write some feedback.'); return; }
        const result = feedbackForm.isAnonymous
            ? await submitAnonymously(feedbackForm.content, feedbackForm.rate)
            : await submitFeedback(feedbackForm.content, feedbackForm.rate);
        if (result.success) {
            setShowFeedbackModal(false);
            setFeedbackForm({ content: '', rate: 5, isAnonymous: false });
            Alert.alert('Thank You!', 'Feedback submitted.');
        } else {
            Alert.alert('Error', result.error || 'Failed to submit feedback.');
        }
    };

    /* ── Account Details Card ── */
    const renderDetails = () => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Details</Text>
            {[
                { label: 'First Name', value: user?.firstName || 'Not set' },
                { label: 'Last Name', value: user?.lastName || 'Not set' },
                { label: 'Email', value: user?.email || 'Not set' },
                { label: 'Role', value: user?.role || 'Not set' },
            ].map(({ label, value }, i, arr) => (
                <View key={label}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{label}</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>{value || '—'}</Text>
                    </View>
                    {i < arr.length - 1 && <View style={styles.divider} />}
                </View>
            ))}
            {!isEditingAccount && (
                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditingAccount(true)}>
                    <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.editBtnText}>Edit Account</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    /* ── Feedback Modal ── */
    const renderFeedbackModal = () => (
        <Modal visible={showFeedbackModal} animationType="slide" transparent onRequestClose={() => setShowFeedbackModal(false)}>
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Platform Feedback</Text>
                        <TouchableOpacity onPress={() => setShowFeedbackModal(false)} style={styles.modalCloseBtn}>
                            <Ionicons name="close" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>Rate your experience</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <TouchableOpacity key={s} onPress={() => setFeedbackForm({ ...feedbackForm, rate: s })}>
                                <Ionicons name={feedbackForm.rate >= s ? 'star' : 'star-outline'}
                                    size={30} color={feedbackForm.rate >= s ? '#F59E0B' : '#374151'} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.inputLabel}>Your Feedback</Text>
                    <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4}
                        placeholder="Tell us what you think..." placeholderTextColor="#4B5563"
                        value={feedbackForm.content}
                        onChangeText={(t) => setFeedbackForm({ ...feedbackForm, content: t })} />

                    <View style={styles.anonRow}>
                        <Text style={styles.inputLabel}>Submit Anonymously</Text>
                        <Switch value={feedbackForm.isAnonymous}
                            onValueChange={(v) => setFeedbackForm({ ...feedbackForm, isAnonymous: v })}
                            trackColor={{ false: '#374151', true: COLORS.primary }} thumbColor="#fff" />
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleFeedbackSubmit} disabled={isSubmittingFeedback}>
                        <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {isSubmittingFeedback
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.saveBtnText}>Submit Feedback</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    /* ── Profile Modal ── */
    const renderProfileModal = () => (
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
                            { label: 'Constraints', value: profile?.constraints || 'Not set' },
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
    );

    /* ── Edit Account Form ── */
    const renderEditAccountForm = () => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit Account</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput style={styles.input} value={accountForm.firstName}
                    onChangeText={(t) => setAccountForm({ ...accountForm, firstName: t })}
                    placeholder="First Name" placeholderTextColor="#4B5563" />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput style={styles.input} value={accountForm.lastName}
                    onChangeText={(t) => setAccountForm({ ...accountForm, lastName: t })}
                    placeholder="Last Name" placeholderTextColor="#4B5563" />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput style={styles.input} value={accountForm.email}
                    onChangeText={(t) => setAccountForm({ ...accountForm, email: t })}
                    placeholder="Email" placeholderTextColor="#4B5563" keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password (optional)</Text>
                <TextInput style={styles.input} value={accountForm.password}
                    onChangeText={(t) => setAccountForm({ ...accountForm, password: t })}
                    placeholder="Leave blank to keep current" placeholderTextColor="#4B5563" secureTextEntry />
            </View>

            {accountForm.password.length > 0 && (
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <TextInput style={styles.input} value={accountForm.confirmPassword}
                        onChangeText={(t) => setAccountForm({ ...accountForm, confirmPassword: t })}
                        placeholder="Confirm new password" placeholderTextColor="#4B5563" secureTextEntry />
                </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={handleSaveAccount} disabled={isLoading}>
                    <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        {isLoading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.saveBtnText}>Save</Text>}
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: '#374151' }]} onPress={handleCancelEdit} disabled={isLoading}>
                    <View style={[styles.saveBtnGrad, { backgroundColor: '#374151' }]}>
                        <Text style={[styles.saveBtnText, { color: '#fff' }]}>Cancel</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* ── Hero Banner ── */}
                <LinearGradient
                    colors={['#0A2540', '#0D1B2A', '#080C14']}
                    style={styles.heroBanner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.glowBlob} />

                    {isPremium && (
                        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                            <Ionicons name="menu" size={26} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {/* Avatar */}
                    <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.avatarRing}>
                        <View style={styles.avatarInner}>
                            <Text style={styles.avatarText}>{user?.firstName?.[0]?.toUpperCase() || 'U'}</Text>
                        </View>
                    </LinearGradient>

                    <Text style={styles.heroName}>{user?.firstName} {user?.lastName}</Text>
                    <Text style={styles.heroEmail}>{user?.email}</Text>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statPill}>
                            <Ionicons name="school-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.statPillText}>
                                {PROFICIENCY_LEVELS[profile?.proficiency] || 'Beginner'}
                            </Text>
                        </View>
                        <View style={styles.statPill}>
                            <Ionicons name="language-outline" size={14} color="#6366F1" />
                            <Text style={[styles.statPillText, { color: '#6366F1' }]}>
                                {profile?.nativeLanguage || 'Not set'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* ── Body ── */}
                <View style={styles.body}>
                    {isEditingAccount ? renderEditAccountForm() : renderDetails()}

                    <View style={styles.menuSection}>
                        <TouchableOpacity style={styles.menuRow} onPress={() => setShowProfileModal(true)}>
                                <View style={[styles.menuIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                                    <Ionicons name="school-outline" size={20} color={COLORS.primary} />
                                </View>
                                <Text style={styles.menuLabel}>Profile Settings</Text>
                                <Ionicons name="chevron-forward" size={18} color="#4B5563" />
                            </TouchableOpacity>

                            <View style={styles.menuDivider} />

                            <TouchableOpacity style={styles.menuRow} onPress={() => setShowFeedbackModal(true)}>
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

            {renderFeedbackModal()}
            {renderProfileModal()}
        </View>
    );
}

export default ProfileScreen;
