import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, FONTS } from '../../src/constants/theme';
import ScreenContainer from '../../src/components/ScreenContainer';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';

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
        <ScreenContainer>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Card style={styles.card}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Start your English learning journey</Text>

                        <View style={styles.form}>
                            <Input
                                label="First Name"
                                placeholder="Enter your first name"
                                value={formData.firstName}
                                onChangeText={(v) => handleInputChange('firstName', v)}
                            />

                            <Input
                                label="Last Name"
                                placeholder="Enter your last name"
                                value={formData.lastName}
                                onChangeText={(v) => handleInputChange('lastName', v)}
                            />

                            <Input
                                label="Email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChangeText={(v) => handleInputChange('email', v)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Input
                                label="Password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChangeText={(v) => handleInputChange('password', v)}
                                secureTextEntry
                            />

                            {error && <Text style={styles.error}>{error}</Text>}

                            <Button
                                title="Create Account"
                                onPress={handleRegister}
                                loading={isLoading}
                                size="large"
                                style={styles.button}
                            />

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => router.push('/(auth)/Login')}
                            >
                                <Text style={styles.linkText}>
                                    Already have an account? <Text style={styles.linkHighlight}>Log in</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.md,
    },
    card: {
        padding: SPACING.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    form: {
        width: '100%',
    },
    error: {
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: SPACING.md,
        fontSize: FONTS.sizes.sm,
    },
    button: {
        marginTop: SPACING.sm,
    },
    linkButton: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.sm,
    },
    linkHighlight: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
