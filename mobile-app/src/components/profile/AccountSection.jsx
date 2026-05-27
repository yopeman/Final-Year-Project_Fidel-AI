import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import styles from '../../../app/styles/profileStyle';

const AccountSection = ({
    isEditing,
    user,
    accountForm,
    onEditPress,    
    onFormChange,
    onSave,
    onCancel,
    isLoading
}) => {
    // Display mode - show account details
    if (!isEditing) {
        return (
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
                <TouchableOpacity style={styles.editBtn} onPress={onEditPress}>
                    <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.editBtnText}>Edit Account</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Edit mode - show form
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Edit Account</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        value={accountForm.firstName}
                        onChangeText={(t) => onFormChange({ ...accountForm, firstName: t })}
                        placeholder="First Name"
                        placeholderTextColor="#4B5563"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        value={accountForm.lastName}
                        onChangeText={(t) => onFormChange({ ...accountForm, lastName: t })}
                        placeholder="Last Name"
                        placeholderTextColor="#4B5563"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={accountForm.email}
                        onChangeText={(t) => onFormChange({ ...accountForm, email: t })}
                        placeholder="Email"
                        placeholderTextColor="#4B5563"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>New Password (optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={accountForm.password}
                        onChangeText={(t) => onFormChange({ ...accountForm, password: t })}
                        placeholder="Leave blank to keep current"
                        placeholderTextColor="#4B5563"
                        secureTextEntry
                    />
                </View>

                {accountForm.password.length > 0 && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            value={accountForm.confirmPassword}
                            onChangeText={(t) => onFormChange({ ...accountForm, confirmPassword: t })}
                            placeholder="Confirm new password"
                            placeholderTextColor="#4B5563"
                            secureTextEntry
                        />
                    </View>
                )}

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                    <TouchableOpacity
                        style={[styles.saveBtn, { flex: 1 }]}
                        onPress={onSave}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, '#059669']}
                            style={styles.saveBtnGrad}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveBtnText}>Save</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveBtn, { flex: 1, backgroundColor: '#374151' }]}
                        onPress={onCancel}
                        disabled={isLoading}
                    >
                        <View style={[styles.saveBtnGrad, { backgroundColor: '#374151' }]}>
                            <Text style={[styles.saveBtnText, { color: '#fff' }]}>Cancel</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default AccountSection;