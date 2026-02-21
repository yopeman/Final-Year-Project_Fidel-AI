import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, FONTS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../src/components/Input';

const { width } = Dimensions.get('window');

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
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
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
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Glow blobs */}
            <View style={[styles.glowBlob, { top: -50, left: -50, backgroundColor: 'rgba(99,102,241,0.08)' }]} />
            <View style={[styles.glowBlob, { bottom: -100, right: -100, backgroundColor: 'rgba(16,185,129,0.1)', width: 300, height: 300, borderRadius: 150 }]} />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="rocket" size={32} color={COLORS.primary} />
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Start your English learning journey</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.form}>
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        label="First Name"
                                        placeholder="First"
                                        value={formData.firstName}
                                        onChangeText={(v) => handleInputChange('firstName', v)}
                                        containerStyle={styles.inputContainer}
                                    />
                                </View>
                                <View style={{ width: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <Input
                                        label="Last Name"
                                        placeholder="Last"
                                        value={formData.lastName}
                                        onChangeText={(v) => handleInputChange('lastName', v)}
                                        containerStyle={styles.inputContainer}
                                    />
                                </View>
                            </View>

                            <Input
                                label="Email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChangeText={(v) => handleInputChange('email', v)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                containerStyle={styles.inputContainer}
                            />

                            <Input
                                label="Password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChangeText={(v) => handleInputChange('password', v)}
                                secureTextEntry
                                containerStyle={styles.inputContainer}
                            />

                            {error && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                                    <Text style={styles.error}>{error}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={handleRegister}
                                disabled={isLoading}
                                activeOpacity={0.8}
                                style={styles.registerBtnWrap}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, '#059669']}
                                    style={styles.registerBtn}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.registerBtnText}>
                                        {isLoading ? 'Creating Account...' : 'Continue'}
                                    </Text>
                                    {!isLoading && <Ionicons name="arrow-forward" size={18} color="#fff" />}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => router.push('/(auth)/Login')}
                            >
                                <Text style={styles.linkText}>
                                    Already have an account? <Text style={styles.linkHighlight}>Log in</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#080C14',
    },
    glowBlob: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(16,185,129,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(16,185,129,0.2)',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginTop: 8,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    inputContainer: {
        marginBottom: 16,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    error: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '500',
    },
    registerBtnWrap: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    registerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    registerBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    linkButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 14,
    },
    linkHighlight: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});

export default RegisterScreen;
