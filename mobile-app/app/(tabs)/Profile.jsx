import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, AGE_RANGES, PROFICIENCY_LEVELS, DURATION_UNITS } from '../../src/constants';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { profile, getProfile, createProfile, updateProfile, isLoading } = useProfileStore();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        ageRange: 'UNDER_18',
        proficiency: 'BEGINNER',
        nativeLanguage: '',
        learningGoal: '',
        targetDuration: '30',
        durationUnit: 'DAYS',
        constraints: ''
    });

    useEffect(() => {
        getProfile();
    }, []);

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
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out', style: 'destructive', onPress: () => {
                        logout();
                    }
                },
            ]
        );
    };

    const handleSaveProfile = async () => {
        if (!formData.nativeLanguage || !formData.learningGoal || !formData.targetDuration) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        const payload = {
            ...formData,
            targetDuration: parseInt(formData.targetDuration, 10)
        };

        let result;
        if (profile) {
            result = await updateProfile(payload);
        } else {
            result = await createProfile(payload);
        }

        if (result.success) {
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } else {
            Alert.alert('Error', result.error || 'Failed to save profile.');
        }
    };

    const SelectionGroup = ({ label, options, value, onChange, mapLabels }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.selectionContainer}>
                {Object.keys(options).map((key) => {
                    const isSelected = value === key;
                    const displayLabel = mapLabels ? options[key] : key;
                    return (
                        <TouchableOpacity
                            key={key}
                            style={[styles.selectionChip, isSelected && styles.selectionChipActive]}
                            onPress={() => onChange(key)}
                        >
                            <Text style={[styles.selectionText, isSelected && styles.selectionTextActive]}>
                                {displayLabel}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderEditForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{profile ? 'Edit Profile' : 'Setup Profile'}</Text>

            <SelectionGroup
                label="Age Range"
                options={AGE_RANGES}
                value={formData.ageRange}
                onChange={(val) => setFormData({ ...formData, ageRange: val })}
                mapLabels
            />

            <SelectionGroup
                label="Current Proficiency Level"
                options={PROFICIENCY_LEVELS}
                value={formData.proficiency}
                onChange={(val) => setFormData({ ...formData, proficiency: val })}
                mapLabels
            />

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Learning Goal</Text>
                <TextInput
                    style={styles.pillInput}
                    value={formData.learningGoal}
                    onChangeText={(text) => setFormData({ ...formData, learningGoal: text })}
                    placeholder="e.g., I want to speak fluently for travel"
                    placeholderTextColor="#6B7280"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Study Hours per Day</Text>
                <View style={styles.selectionContainer}>
                    {['30 min', '1 hour', '2 hours', '3+ hours'].map((label, idx) => {
                        const val = idx === 0 ? '30' : idx === 1 ? '60' : idx === 2 ? '120' : '180';
                        const isSelected = formData.targetDuration === val;
                        return (
                            <TouchableOpacity
                                key={label}
                                style={[styles.selectionChip, isSelected && styles.selectionChipActive]}
                                onPress={() => setFormData({ ...formData, targetDuration: val })}
                            >
                                <Text style={[styles.selectionText, isSelected && styles.selectionTextActive]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Native Language</Text>
                <TextInput
                    style={styles.pillInput}
                    value={formData.nativeLanguage}
                    onChangeText={(text) => setFormData({ ...formData, nativeLanguage: text })}
                    placeholder="e.g. Amharic"
                    placeholderTextColor="#6B7280"
                />
            </View>

            <View style={styles.formActions}>
                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color={COLORS.secondary} /> : <Text style={styles.saveButtonText}>Save Details</Text>}
                </TouchableOpacity>
                {profile && (
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderProfileDetails = () => (
        <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Native Language</Text>
                <Text style={styles.detailValue}>{profile?.nativeLanguage}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Proficiency</Text>
                <Text style={styles.detailValue}>{PROFICIENCY_LEVELS[profile?.proficiency] || profile?.proficiency}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Goal</Text>
                <Text style={styles.detailValue}>{profile?.learningGoal}</Text>
            </View>
            <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditing(true)}>
                <Text style={styles.editProfileBtnText}>Edit Preferences</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.secondary || '#111827', '#000']}
                style={styles.background}
            />
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 50 }}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.firstName?.[0] || 'U'}</Text>
                    </View>
                    <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                <View style={styles.content}>
                    {isEditing || !profile ? renderEditForm() : renderProfileDetails()}

                    {profile && !isEditing && (
                        <View style={styles.section}>
                            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                                <Ionicons name="log-out-outline" size={22} color="#EF4444" style={{ marginRight: 10 }} />
                                <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary || '#111827',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        padding: SPACING.xl,
        paddingTop: 60,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    content: {
        padding: SPACING.lg,
    },
    formContainer: {
        backgroundColor: COLORS.surfaceDark || '#1F2937',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: '#374151',
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: SPACING.lg,
        color: '#fff',
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D1D5DB',
        marginBottom: SPACING.sm,
    },
    selectionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    selectionChip: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#374151',
        minWidth: '45%',
        alignItems: 'center',
    },
    selectionChipActive: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: COLORS.primary,
    },
    selectionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#D1D5DB',
    },
    selectionTextActive: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    pillInput: {
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: BORDER_RADIUS.md,
        padding: 16,
        fontSize: 16,
        color: '#fff',
    },
    formActions: {
        marginTop: SPACING.lg,
        gap: SPACING.md,
    },
    actionButton: {
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    saveButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelButtonText: {
        color: '#9CA3AF',
        fontWeight: '600',
    },
    detailsCard: {
        backgroundColor: COLORS.surfaceDark || '#1F2937',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: '#374151',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
    },
    detailLabel: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    detailValue: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#374151',
        marginVertical: 4,
    },
    editProfileBtn: {
        marginTop: SPACING.lg,
        alignItems: 'center',
    },
    editProfileBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    section: {
        marginTop: SPACING.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surfaceDark || '#1F2937',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    menuLabel: {
        fontSize: 16,
        color: '#fff',
    },
});
