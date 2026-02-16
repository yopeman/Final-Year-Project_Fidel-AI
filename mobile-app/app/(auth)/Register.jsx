import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';

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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Start your English learning journey</Text>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your first name"
                                value={formData.firstName}
                                onChangeText={(v) => handleInputChange('firstName', v)}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your last name"
                                value={formData.lastName}
                                onChangeText={(v) => handleInputChange('lastName', v)}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                value={formData.email}
                                onChangeText={(v) => handleInputChange('email', v)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Create a password"
                                value={formData.password}
                                onChangeText={(v) => handleInputChange('password', v)}
                                secureTextEntry
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {error && <Text style={styles.error}>{error}</Text>}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.secondary} />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg, // Rounded pill-like but standard input shape
        padding: SPACING.md,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    error: {
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginTop: SPACING.sm,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: COLORS.secondary, // Dark text on yellow
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    linkHighlight: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
