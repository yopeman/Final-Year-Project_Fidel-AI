import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/loginStyle';

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
                                    <Ionicons name="log-in" size={32} color={COLORS.primary} />
                                </LinearGradient>
                                <Text style={styles.title}>Welcome Back!</Text>
                                <Text style={styles.subtitle}>Log in to continue learning</Text>
                            </View>

                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="your@email.com"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={email}
                                            onChangeText={setEmail}
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
                                            placeholder="Enter your password"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={password}
                                            onChangeText={setPassword}
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
                                    style={styles.loginButton}
                                    onPress={handleLogin}
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
                                                <Text style={styles.loginButtonText}>Log In</Text>
                                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={() => router.push('/(auth)/Register')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.linkText}>
                                        Don't have an account? <Text style={styles.linkHighlight}>Sign up</Text>
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

export default LoginScreen;
