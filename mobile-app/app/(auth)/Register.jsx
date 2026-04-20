import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/registerStyle';

const RegisterScreen = () => {
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRegister = async () => {
        clearError();
        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            // Should show error
            return;
        }

        const result = await register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            role: 'STUDENT',
        });

        if (result.success) {
            router.push({
                pathname: '/(auth)/Verify',
                params: { email: formData.email }
            });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Decorative glow blobs */}
                <View style={[styles.glowBlob, { top: -50, right: -50, backgroundColor: 'rgba(16,185,129,0.1)' }]} />
                <View style={[styles.glowBlob, { bottom: -100, left: -100, backgroundColor: 'rgba(99,102,241,0.08)' }]} />

                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <LinearGradient
                                    colors={['rgba(255,193,7,0.2)', 'rgba(255,193,7,0.05)']}
                                    style={styles.logoBadge}
                                >
                                    <Ionicons name="person-add" size={32} color={COLORS.primary} />
                                </LinearGradient>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>Start your English learning journey</Text>
                            </View>

                            <View style={styles.form}>
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>First Name</Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="First"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                value={formData.firstName}
                                                onChangeText={(v) => handleInputChange('firstName', v)}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Last Name</Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Last"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                value={formData.lastName}
                                                onChangeText={(v) => handleInputChange('lastName', v)}
                                            />
                                        </View>
                                    </View>

                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="your@email.com"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={formData.email}
                                            onChangeText={(v) => handleInputChange('email', v)}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Create a password"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={formData.password}
                                            onChangeText={(v) => handleInputChange('password', v)}
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                {error && (
                                    <View style={styles.errorContainer}>
                                        <Ionicons name="alert-circle" size={18} color="#EF4444" />
                                        <Text style={styles.errorText}>{error}</Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.registerButton}
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={[COLORS.primary, '#059669']}
                                        style={styles.btnGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Text style={styles.registerButtonText}>Create Account</Text>
                                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={() => router.push('/(auth)/Login')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.linkText}>
                                        Already have an account? <Text style={styles.linkHighlight}>Log in</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

export default RegisterScreen;
