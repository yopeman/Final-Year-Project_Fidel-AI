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

const LoginScreen = () => {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        clearError();
        const res = await login({ email, password });
        if (res.success) {
            router.replace('/(tabs)/Home');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Log in to continue learning</Text>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {error && <Text style={styles.error}>{error}</Text>}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Log In</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => router.push('/(auth)/Register')}
                        >
                            <Text style={styles.linkText}>
                                Don't have an account? <Text style={styles.linkHighlight}>Sign up</Text>
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
        backgroundColor: COLORS.background, // Should be white or light
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
        // Add shadow for card effect if background is not white, 
        // but design seems potentially flat or light bg. 
        // Adding subtle shadow just in case.
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary, // Gold/Yellow
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
        borderRadius: BORDER_RADIUS.lg,
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
        color: '#fff', // Or dark text if yellow is too bright? Design shows dark text on yellow usually or white. Let's stick to Design image - looks like dark text on yellow button in "Create Account" image or white. 
        // Actually, "Create Account" button has Black/Dark text on Yellow. "Log In" likely same.
        // Let's use darker text for better contrast on yellow.
        color: COLORS.secondary,
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
        fontWeight: 'bfold',
    },
});

export default LoginScreen;
