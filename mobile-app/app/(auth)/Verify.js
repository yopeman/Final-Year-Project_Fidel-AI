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
} from 'react-native';
import { useAuthStore } from '../../src/stores/authStore';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={goBackToRegister}
                        disabled={isLoading || isSubmitting}
                    >
                        <Icon name="arrow-left" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Verify Email</Text>
                    <View style={{ width: 40 }} /> {/* Spacer for alignment */}
                </View>

                <Icon
                    name="email-check-outline"
                    size={80}
                    color="#007AFF"
                    style={styles.emailIcon}
                />

                <Text style={styles.subtitle}>
                    Enter the verification code sent to
                </Text>
                <Text style={styles.emailText}>{email}</Text>

                {error && (
                    <View style={styles.errorContainer}>
                        <Icon name="alert-circle" size={20} color="#FF3B30" />
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
                            maxLength={6}
                            selectTextOnFocus
                            editable={!isLoading && !isSubmitting}
                            caretHidden={true}
                            contextMenuHidden={true}
                        />
                    ))}
                </View>

                <Text style={styles.codeHint}>
                    Enter the 6-digit code
                </Text>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[
                        styles.verifyButton,
                        (isLoading || isSubmitting) && styles.buttonDisabled,
                        code.join('').length !== 6 && styles.buttonInactive,
                    ]}
                    onPress={() => handleVerify()}
                    disabled={isLoading || isSubmitting || code.join('').length !== 6}
                    activeOpacity={0.8}
                >
                    {isLoading || isSubmitting ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.verifyButtonText}>Verify Email</Text>
                    )}
                </TouchableOpacity>

                {/* Resend Code Section */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                        Didn't receive the code?
                    </Text>
                    <TouchableOpacity
                        onPress={handleResendCode}
                        disabled={!canResend || isLoading || isSubmitting}
                        style={styles.resendButton}
                    >
                        {canResend ? (
                            <Text style={styles.resendButtonText}>Resend Code</Text>
                        ) : (
                            <Text style={styles.resendTimerText}>
                                Resend in {formatTime(timer)}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Support Text */}
                <Text style={styles.supportText}>
                    If you're having trouble receiving the code, please check your spam folder
                    or contact support at support@example.com
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        flex: 1,
        textAlign: 'center',
    },
    emailIcon: {
        alignSelf: 'center',
        marginBottom: 24,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    emailText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#007AFF',
        textAlign: 'center',
        marginBottom: 40,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    codeInput: {
        width: 50,
        height: 60,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
    codeInputFilled: {
        borderColor: '#007AFF',
        backgroundColor: '#F0F7FF',
    },
    codeInputDisabled: {
        opacity: 0.6,
    },
    codeHint: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    verifyButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#99C9FF',
    },
    buttonInactive: {
        backgroundColor: '#E0E0E0',
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    resendText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    resendButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    resendButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    resendTimerText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
    supportText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 'auto',
    },
});

export default VerifyScreen;
