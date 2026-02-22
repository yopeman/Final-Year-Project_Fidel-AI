import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    BackHandler,
    StatusBar,
    ScrollView,
    Dimensions
} from 'react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const VerifyScreen = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef([]);

    const { verify, resendVerification, isLoading, error, clearError } = useAuthStore();

    useEffect(() => {
        if (!email) {
            Alert.alert('Error', 'No email provided');
            router.back();
            return;
        }

        // Start countdown timer
        const countdown = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Handle back button on Android
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                Alert.alert(
                    'Cancel Verification?',
                    'Are you sure you want to cancel email verification?',
                    [
                        { text: 'Continue', style: 'cancel' },
                        { text: 'Cancel', style: 'destructive', onPress: () => router.back() }
                    ]
                );
                return true;
            }
        );

        return () => {
            clearInterval(countdown);
            backHandler.remove();
        };
    }, [email]);

    const handleCodeChange = (value, index) => {
        // Only allow numbers
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue && numericValue.length > 1) {
            // Handle paste
            const pastedCode = numericValue.split('');
            const newCode = [...code];
            for (let i = 0; i < 6 && i < pastedCode.length; i++) {
                newCode[index + i] = pastedCode[i];
            }
            setCode(newCode);

            // Focus last input after paste
            const lastFilledIndex = Math.min(index + pastedCode.length - 1, 5);
            inputRefs.current[lastFilledIndex]?.focus();

            // Auto-verify if all digits are filled
            if (newCode.every(digit => digit !== '')) {
                setTimeout(() => handleVerify(newCode.join('')), 100);
            }
            return;
        }

        const newCode = [...code];
        newCode[index] = numericValue;
        setCode(newCode);

        // Auto-focus next input
        if (numericValue && index < 5) {
            setTimeout(() => inputRefs.current[index + 1]?.focus(), 50);
        }

        // Auto-verify when last digit is entered
        if (numericValue && index === 5 && newCode.every(digit => digit !== '')) {
            setTimeout(() => handleVerify(newCode.join('')), 100);
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!code[index] && index > 0) {
                // Move focus to previous input
                setTimeout(() => {
                    inputRefs.current[index - 1]?.focus();
                    const newCode = [...code];
                    newCode[index - 1] = '';
                    setCode(newCode);
                }, 50);
            }
        }
    };

    const handleVerify = async (verificationCode = null) => {
        const verificationCodeToUse = verificationCode || code.join('');

        if (verificationCodeToUse.length !== 6) {
            Alert.alert('Error', 'Please enter all 6 digits');
            return;
        }

        if (!/^\d{6}$/.test(verificationCodeToUse)) {
            Alert.alert('Error', 'Please enter a valid 6-digit code');
            return;
        }

        setIsSubmitting(true);
        clearError();

        try {
            const result = await verify({
                email,
                verificationCode: verificationCodeToUse,
            });

            if (result.success) {
                // Success - replace stack to home
                Alert.alert('Success', 'Email verified! Please log in.');
                router.replace('/(auth)/Login');
            } else {
                Alert.alert('Verification Failed', result.error || 'Invalid verification code');
                // Clear code on error
                setCode(['', '', '', '', '', '']);
                // Focus first input
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;

        clearError();
        setIsSubmitting(true);

        try {
            const result = await resendVerification(email);

            if (result.success) {
                setTimer(60);
                setCanResend(false);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                Alert.alert('Code Sent', 'A new verification code has been sent to your email.');

                // Restart timer
                const countdown = setInterval(() => {
                    setTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(countdown);
                            setCanResend(true);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                Alert.alert('Error', result.error || 'Failed to resend code. Please try again.');
            }
        } catch (err) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const goBackToRegister = () => {
        router.back();
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
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.content}>
                            {/* Header */}
                            <View style={styles.header}>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={goBackToRegister}
                                    disabled={isLoading || isSubmitting}
                                >
                                    <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.7)" />
                                </TouchableOpacity>
                                <Text style={styles.title}>Verify Email</Text>
                                <View style={{ width: 40 }} />
                            </View>

                            <View style={styles.centerSection}>
                                <LinearGradient
                                    colors={['rgba(255,193,7,0.2)', 'rgba(255,193,7,0.05)']}
                                    style={styles.iconBadge}
                                >
                                    <Ionicons name="mail-unread" size={40} color={COLORS.primary} />
                                </LinearGradient>

                                <Text style={styles.subtitle}>
                                    Enter the verification code sent to
                                </Text>
                                <Text style={styles.emailText}>{email}</Text>
                            </View>

                            {error && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={18} color="#EF4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            {/* Code Inputs */}
                            <View style={styles.codeContainer}>
                                {code.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={ref => (inputRefs.current[index] = ref)}
                                        style={[
                                            styles.codeInput,
                                            digit && styles.codeInputFilled,
                                            (isLoading || isSubmitting) && styles.codeInputDisabled,
                                        ]}
                                        value={digit}
                                        onChangeText={(value) => handleCodeChange(value, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        selectTextOnFocus
                                        editable={!isLoading && !isSubmitting}
                                        placeholder="0"
                                        placeholderTextColor="rgba(255,255,255,0.1)"
                                    />
                                ))}
                            </View>

                            <Text style={styles.codeHint}>
                                6-digit verification code
                            </Text>

                            {/* Verify Button */}
                            <TouchableOpacity
                                style={styles.verifyButton}
                                onPress={() => handleVerify()}
                                disabled={isLoading || isSubmitting || code.join('').length !== 6}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, '#059669']}
                                    style={styles.btnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isLoading || isSubmitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.verifyButtonText}>Verify Email</Text>
                                            <Ionicons name="checkpoint" size={18} color="#fff" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Resend Code Section */}
                            <View style={styles.resendContainer}>
                                <Text style={styles.resendText}>
                                    Didn't receive the code?
                                </Text>
                                <TouchableOpacity
                                    onPress={handleResendCode}
                                    disabled={!canResend || isLoading || isSubmitting}
                                    activeOpacity={0.7}
                                >
                                    {canResend ? (
                                        <Text style={styles.resendButtonText}>Resend Code</Text>
                                    ) : (
                                        <View style={styles.resendTimer}>
                                            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.4)" />
                                            <Text style={styles.resendTimerText}>
                                                Resend in {formatTime(timer)}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Support Text */}
                            <Text style={styles.supportText}>
                                Check your spam folder or contact support if the code doesn't arrive.
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    glowBlob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.6,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    centerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconBadge: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,193,7,0.3)',
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginBottom: 6,
        fontWeight: '600',
    },
    emailText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239,68,68,0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        gap: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    codeInput: {
        width: height * 0.055,
        height: height * 0.07,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    codeInputFilled: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(255,193,7,0.05)',
    },
    codeInputDisabled: {
        opacity: 0.5,
    },
    codeHint: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        marginBottom: 32,
        fontWeight: '600',
    },
    verifyButton: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 32,
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    resendText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 10,
        fontWeight: '600',
    },
    resendButtonText: {
        fontSize: 15,
        color: COLORS.primary,
        fontWeight: '800',
    },
    resendTimer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    resendTimerText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '700',
    },
    supportText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.25)',
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 20,
        paddingHorizontal: 20,
    },
});

export default VerifyScreen;
