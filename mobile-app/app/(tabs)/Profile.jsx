import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
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

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, isPremium: hasPremiumSub } = useAuthStore();
    const { profile, getProfile, createProfile, updateProfile, isLoading } = useProfileStore();
    const { submitFeedback, submitAnonymously, isLoading: isSubmittingFeedback } = useFeedbackStore();
    const { enrollments, premiumUnlocked } = useBatchStore();
    const [menuVisible, setMenuVisible] = useState(false);

    const isPremium = hasPremiumSub || premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');

    const [isEditing, setIsEditing] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [formData, setFormData] = useState({
        ageRange: 'UNDER_18',
        proficiency: 'BEGINNER',
        nativeLanguage: '',
        learningGoal: '',
        targetDuration: '30',
        durationUnit: 'DAYS',
        constraints: ''
    });
    const [feedbackForm, setFeedbackForm] = useState({ content: '', rate: 5, isAnonymous: false });

    useEffect(() => { getProfile(); }, []);

    useEffect(() => {
        if (profile) {
            setFormData({
                ageRange: profile.ageRange || 'UNDER_18',
                proficiency: profile.proficiency || 'BEGINNER',
                nativeLanguage: profile.nativeLanguage || '',
                learningGoal: profile.learningGoal || '',
                targetDuration: profile.targetDuration?.toString() || '30',
                durationUnit: profile.durationUnit || 'DAYS',
                constraints: profile.constraints || ''
            });
        }
    }, [profile]);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: () => logout() },
        ]);
    };

    const handleSaveProfile = async () => {
        if (!formData.nativeLanguage || !formData.learningGoal || !formData.targetDuration) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }
        const payload = { ...formData, targetDuration: parseInt(formData.targetDuration, 10) };
        const result = profile ? await updateProfile(payload) : await createProfile(payload);
        if (result.success) {
            setIsEditing(false);
            Alert.alert('Saved!', 'Profile updated successfully.');
        } else {
            Alert.alert('Error', result.error || 'Failed to save profile.');
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

    /* ── Selection chips ── */
    const SelectionGroup = ({ label, options, value, onChange, mapLabels }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.chipRow}>
                {Object.keys(options).map((key) => {
                    const active = value === key;
                    return (
                        <TouchableOpacity
                            key={key}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() => onChange(key)}
                        >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                {mapLabels ? options[key] : key}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    /* ── Edit Form ── */
    const renderEditForm = () => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{profile ? 'Edit Preferences' : 'Setup Profile'}</Text>

            <SelectionGroup label="Age Range" options={AGE_RANGES} value={formData.ageRange}
                onChange={(v) => setFormData({ ...formData, ageRange: v })} mapLabels />

            <SelectionGroup label="Proficiency Level" options={PROFICIENCY_LEVELS} value={formData.proficiency}
                onChange={(v) => setFormData({ ...formData, proficiency: v })} mapLabels />

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Learning Goal</Text>
                <TextInput style={styles.input} value={formData.learningGoal}
                    onChangeText={(t) => setFormData({ ...formData, learningGoal: t })}
                    placeholder="e.g., Speak fluently for travel" placeholderTextColor="#4B5563" />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Study Time</Text>
                <View style={styles.chipRow}>
                    {[['30 min', '30'], ['1 hour', '60'], ['2 hours', '120'], ['3+ hours', '180']].map(([label, val]) => (
                        <TouchableOpacity key={val}
                            style={[styles.chip, formData.targetDuration === val && styles.chipActive]}
                            onPress={() => setFormData({ ...formData, targetDuration: val })}>
                            <Text style={[styles.chipText, formData.targetDuration === val && styles.chipTextActive]}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Native Language</Text>
                <TextInput style={styles.input} value={formData.nativeLanguage}
                    onChangeText={(t) => setFormData({ ...formData, nativeLanguage: t })}
                    placeholder="e.g. Amharic" placeholderTextColor="#4B5563" />
            </View>

            <View style={styles.formBtns}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={isLoading}>
                    <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        {isLoading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.saveBtnText}>Save Changes</Text>}
                    </LinearGradient>
                </TouchableOpacity>
                {profile && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    /* ── Profile Detail Card ── */
    const renderDetails = () => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Learning Profile</Text>
            {[
                { label: 'Native Language', value: profile?.nativeLanguage },
                { label: 'Proficiency', value: PROFICIENCY_LEVELS[profile?.proficiency] || profile?.proficiency },
                { label: 'Goal', value: profile?.learningGoal },
            ].map(({ label, value }, i, arr) => (
                <View key={label}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{label}</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>{value || '—'}</Text>
                    </View>
                    {i < arr.length - 1 && <View style={styles.divider} />}
                </View>
            ))}
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                <Text style={styles.editBtnText}>Edit Preferences</Text>
            </TouchableOpacity>
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
                    {isEditing || !profile ? renderEditForm() : renderDetails()}

                    {profile && !isEditing && (
                        <View style={styles.menuSection}>
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
                    )}
                </View>
            </ScrollView>

            {renderFeedbackModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },
    scrollContent: { paddingBottom: 50 },

    // Hero Banner
    heroBanner: {
        paddingTop: 32,
        paddingHorizontal: 20,
        paddingBottom: 28,
        overflow: 'hidden',
        alignItems: 'center',
    },
    menuBtn: {
        position: 'absolute',
        top: 32,
        left: 20,
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
    },
    glowBlob: {
        position: 'absolute', top: -50, right: -50,
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(16,185,129,0.1)',
    },
    avatarRing: {
        width: 88, height: 88, borderRadius: 44,
        alignItems: 'center', justifyContent: 'center',
        padding: 3, marginBottom: 14,
    },
    avatarInner: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#0D1B2A',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
    heroName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4, marginBottom: 16 },
    statsRow: { flexDirection: 'row', gap: 10 },
    statPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(16,185,129,0.1)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    },
    statPillText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

    // Body
    body: { paddingHorizontal: 16, paddingTop: 20 },

    // Card (Edit + Details)
    card: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        marginBottom: 16,
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 20 },

    // Input
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', marginBottom: 10, letterSpacing: 0.3 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 14, fontSize: 15, color: '#fff',
    },
    textArea: { height: 100, textAlignVertical: 'top' },

    // Chips
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingVertical: 9, paddingHorizontal: 16,
        borderRadius: 50, borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.08)',
    },
    chipActive: {
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderColor: COLORS.primary,
    },
    chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
    chipTextActive: { color: COLORS.primary, fontWeight: '700' },

    // Form actions
    formBtns: { marginTop: 8, gap: 10 },
    saveBtn: { borderRadius: 50, overflow: 'hidden' },
    saveBtnGrad: { paddingVertical: 15, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    cancelBtn: { alignItems: 'center', paddingVertical: 10 },
    cancelBtnText: { color: '#6B7280', fontWeight: '600' },

    // Detail rows
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, gap: 10 },
    detailLabel: { color: '#6B7280', fontSize: 14 },
    detailValue: { color: '#E5E7EB', fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, marginTop: 16, paddingVertical: 10,
        backgroundColor: 'rgba(16,185,129,0.08)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
        borderRadius: 50,
    },
    editBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },

    // Menu
    menuSection: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 20, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        marginBottom: 16,
    },
    menuRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, gap: 12,
    },
    menuIcon: {
        width: 38, height: 38, borderRadius: 11,
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { flex: 1, fontSize: 15, color: '#E5E7EB', fontWeight: '600' },
    menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16 },

    // Feedback Modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
    modalBox: {
        backgroundColor: '#0D1B2A',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24,
        borderWidth: 1, borderBottomWidth: 0,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    modalCloseBtn: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center', justifyContent: 'center',
    },
    starsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    anonRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginVertical: 16,
    },
});
