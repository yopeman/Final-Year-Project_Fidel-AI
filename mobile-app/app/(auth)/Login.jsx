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
        <ScreenContainer>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Card style={styles.card}>
                        <Text style={styles.title}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>Log in to continue learning</Text>

                        <View style={styles.form}>
                            <Input
                                label="Email"
                                placeholder="your@email.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Input
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            {error && <Text style={styles.error}>{error}</Text>}

                            <Button
                                title="Log In"
                                onPress={handleLogin}
                                loading={isLoading}
                                style={styles.button}
                                size="large"
                            />

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => router.push('/(auth)/Register')}
                            >
                                <Text style={styles.linkText}>
                                    Don't have an account? <Text style={styles.linkHighlight}>Sign up</Text>
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

export default LoginScreen;
