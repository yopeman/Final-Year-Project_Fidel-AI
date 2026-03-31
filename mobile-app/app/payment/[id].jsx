import {
    View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity,
    Modal, Animated, Easing, Linking, ScrollView, Platform
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBatchStore } from '../../src/stores/batchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppState } from 'react-native';
import styles, { modal } from '../styles/paymentStyle';

// ─────────────────────────────────────────────
// Premium Success Modal
// ─────────────────────────────────────────────
function PremiumSuccessModal({ visible, onContinue }) {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const ring1 = useRef(new Animated.Value(0)).current;
    const ring2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.parallel([
                    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 12 }),
                    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.timing(ring1, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
                    Animated.timing(ring2, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), delay: 200, useNativeDriver: true }),
                ])
            ]).start();
        } else {
            scale.setValue(0);
            opacity.setValue(0);
            ring1.setValue(0);
            ring2.setValue(0);
        }
    }, [visible]);

    const FEATURES = [
        { icon: 'book-outline', label: 'Premium Learning Resources', color: '#F59E0B', desc: 'AI-curated lessons and vocabulary' },
        { icon: 'calendar-outline', label: 'Live Classes', color: '#3B82F6', desc: 'Join real-time sessions with instructors' },
        { icon: 'chatbubbles-outline', label: 'Community Chat', color: '#10B981', desc: 'Discuss and learn with classmates' },
    ];

    const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.6] });
    const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.7, 2] });
    const ring1Opacity = ring1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.3, 0] });
    const ring2Opacity = ring2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.2, 0] });

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={modal.backdrop}>
                <Animated.View style={[modal.card, { transform: [{ scale }], opacity }]}>
                    <LinearGradient
                        colors={['#0A1628', '#0D2137', '#0A1628']}
                        style={modal.gradientBg}
                    />

                    {/* Animated check icon with ripple rings */}
                    <View style={modal.iconWrap}>
                        <Animated.View style={[modal.ring, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />
                        <Animated.View style={[modal.ring, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity, borderColor: '#F59E0B50' }]} />
                        <LinearGradient colors={['#F59E0B', '#F97316']} style={modal.checkCircle}>
                            <Ionicons name="checkmark-sharp" size={36} color="#fff" />
                        </LinearGradient>
                    </View>

                    <Text style={modal.headline}>You're Premium! 🎉</Text>
                    <Text style={modal.subtitle}>Your payment was confirmed. All premium features are now unlocked.</Text>

                    {/* Feature Cards */}
                    <View style={modal.features}>
                        {FEATURES.map((f, i) => (
                            <View key={i} style={modal.featureRow}>
                                <View style={[modal.featureIconWrap, { backgroundColor: f.color + '22' }]}>
                                    <Ionicons name={f.icon} size={22} color={f.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={modal.featureName}>{f.label}</Text>
                                    <Text style={modal.featureDesc}>{f.desc}</Text>
                                </View>
                                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                            </View>
                        ))}
                    </View>

                    {/* CTA */}
                    <TouchableOpacity style={modal.cta} onPress={onContinue} activeOpacity={0.85}>
                        <LinearGradient colors={['#F59E0B', '#F97316']} style={modal.ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={modal.ctaText}>Start Learning</Text>
                            <Ionicons name="arrow-forward" size={18} color="#1A1A2E" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

// ─────────────────────────────────────────────
// Payment Screen
// ─────────────────────────────────────────────
export default function PaymentScreen() {
    const { id, txRef, autoOpened } = useLocalSearchParams(); // Enrollment ID and optional redirect ref
    const router = useRouter();
    const { user, refreshUser } = useAuthStore();
    const {
        initiatePayment,
        verifyPaymentAndUnlock,
        checkPaymentStatus,
        cancelPayment, // Now available in store
        syncWithProfile,
        isLoading,
        error,
        clearError
    } = useBatchStore();

    const [paymentData, setPaymentData] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [verificationAttempts, setVerificationAttempts] = useState(0);
    const [paymentInitiated, setPaymentInitiated] = useState(false);
    const shimmer = useRef(new Animated.Value(0)).current;
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        if (id) {
            initializePayment();
        }
        return () => {
            clearError();
        };
    }, [id]);

    // Step 3: Handle Gateway Redirect (Deep Link)
    useEffect(() => {
        if (txRef && !showSuccess) {
            console.log('Detected return from gateway with txRef:', txRef);
            verifyPayment();
        }
    }, [txRef]);

    // Shimmer animation for the secure badge
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const initializePayment = async () => {
        try {
            // First check if payment is already completed
            const statusCheck = await checkPaymentStatus(id);

            if (statusCheck.success) {
                if (statusCheck.status === 'COMPLETED') {
                    // Payment already verified - unlock premium
                    await handleSuccessfulVerification(statusCheck);
                    return;
                } else if (statusCheck.payment) {
                    // Payment exists but not completed
                    setPaymentData(statusCheck.payment);

                    // If there's a checkout URL, open it (unless already opened)
                    if (statusCheck.payment.checkoutUrl) {
                        if (autoOpened !== 'true') {
                            try {
                                await Linking.openURL(statusCheck.payment.checkoutUrl);
                            } catch (err) {
                                console.error('Failed to auto-open checkout URL:', err);
                            }
                        }
                        setPaymentInitiated(true);
                    }
                    return;
                }
            }

            // No payment exists, initiate new one
            const result = await initiatePayment(id);

            if (result.success) {
                setPaymentData(result.payment);

                // Double-check payment status after initiation
                if (result.payment?.status === 'COMPLETED') {
                    await handleSuccessfulVerification({ payment: result.payment });
                    return;
                }

                // Open checkout URL for pending payments (unless already opened)
                if (result.payment?.checkoutUrl) {
                    if (autoOpened !== 'true') {
                        try {
                            await Linking.openURL(result.payment.checkoutUrl);
                        } catch (err) {
                            console.error('Failed to auto-open checkout URL:', err);
                        }
                    }
                    setPaymentInitiated(true);
                }
            } else {
                Alert.alert('Payment Error', result.error || 'Failed to initiate payment.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        }
    };
    const handleEnroll = async () => {
        const result = await enrollInBatch(id, user?.profile?.id);
        if (result.success) {
            // Navigate to payment
            router.push(`/payment/${result.enrollment.id}`);
        } else if (result.isDuplicate) {
            // Already enrolled - navigate to payment or batch details
            Alert.alert(
                'Already Enrolled',
                'You are already enrolled in this batch.',
                [
                    { text: 'OK', onPress: () => router.push(`/payment/${result.enrollmentId}`) }
                ]
            );
        } else {
            Alert.alert('Error', result.error);
        }
    };
    const handleSuccessfulVerification = async (verificationData) => {
        try {
            // Update local payment data first
            setPaymentData(verificationData.payment || { status: 'COMPLETED' });

            // CRITICAL: Refresh the user from the server to get the updated enrollment status
            // This also calls syncWithProfile internally in authStore
            const refreshResult = await refreshUser();

            if (refreshResult.success) {
                setShowSuccess(true);
            } else {
                // Fallback to manual sync if refresh fails
                const store = useBatchStore.getState();
                if (store.premiumUnlocked || store.enrollmentStatusGlobal === 'ENROLLED') {
                    setShowSuccess(true);
                } else {
                    // One last try: call verifyPaymentAndUnlock directly
                    const verifyResult = await verifyPaymentAndUnlock(id);
                    if (verifyResult.success && verifyResult.verified) {
                        setShowSuccess(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error in successful verification:', error);
            setShowSuccess(true); // Still show success if payment was confirmed
        }
    };

    // Auto-verify when user returns to app from Chapa browser
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // Add delay to allow webhook to process
                setTimeout(async () => {
                    if (paymentData && !showSuccess && paymentInitiated) {
                        await verifyPayment();
                    }
                }, 2000);
            }
            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, [paymentData, showSuccess, paymentInitiated]);

    const verifyPayment = async () => {
        if (verifying) return;

        if (!id) {
            console.error('Payment Error: enrollmentId (id) is missing from URL params');
            Alert.alert('Error', 'Missing enrollment ID. Please go back and try again.');
            return;
        }

        setVerifying(true);
        setVerificationAttempts(prev => prev + 1);

        try {
            // Step 4: Call backend verification
            const result = await verifyPaymentAndUnlock(id);

            if (result.success && (result.verified || result.payment?.status === 'COMPLETED')) {
                // Step 5: Frontend shows premium modal
                const payment = result.payment;

                // Update local payment data with backend subscription info
                setPaymentData(prev => ({
                    ...prev,
                    status: 'COMPLETED',
                    ...(payment && {
                        ...payment,
                        isPremium: payment.subscriptionActive || true // Map backend field
                    })
                }));

                // Refresh user profile to reflect premium status (Step 5)
                if (user?.profile) {
                    await syncWithProfile(user.profile);
                }

                // Show 🎉 “Premium Activated” modal
                setShowSuccess(true);
            } else {
                // Handle failed verification
                if (verificationAttempts < 3) {
                    Alert.alert(
                        'Payment Not Confirmed',
                        'Your payment could not be verified yet. This can take a few moments.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Try Again',
                                onPress: () => {
                                    setVerifying(false);
                                    verifyPayment();
                                }
                            }
                        ]
                    );
                } else {
                    Alert.alert(
                        'Verification Failed',
                        'Unable to verify payment after multiple attempts. Please check your transaction status or contact support.',
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (error) {
            console.error('Verification Error Detail:', error);
            Alert.alert(
                'Verification Error',
                `Failed to verify payment: ${error.message || 'Unknown error'}`
            );
        } finally {
            setVerifying(false);
        }
    };

    // Manual verification handler
    const handleManualVerification = async () => {
        setVerificationAttempts(0); // Reset attempts for manual verification
        await verifyPayment();
    };

    // Dev-only: bypass Chapa verification for testing
    const forceUnlockDev = () => {
        if (__DEV__) {
            useBatchStore.setState({
                premiumUnlocked: true,
                enrollmentStatusGlobal: 'ENROLLED',
            });
            setPaymentData(prev => ({ ...prev, status: 'COMPLETED' }));
            setShowSuccess(true);
        }
    };

    const handleContinue = () => {
        setShowSuccess(false);
        // Navigate to home and force a refresh
        router.replace('/(tabs)/Home');
    };

    // ── Loading state
    if (isLoading && !paymentData) {
        return (
            <View style={styles.centerContainer}>
                <LinearGradient colors={['#0A1628', '#0D2137', '#0A1628']} style={StyleSheet.absoluteFillObject} />
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Setting up your payment...</Text>
            </View>
        );
    }

    // ── Error state
    if (error && !paymentData) {
        return (
            <View style={styles.centerContainer}>
                <LinearGradient colors={['#0A1628', '#0D2137', '#0A1628']} style={StyleSheet.absoluteFillObject} />
                <View style={styles.errorCard}>
                    <Ionicons name="alert-circle" size={52} color="#EF4444" />
                    <Text style={styles.errorTitle}>Payment Failed</Text>
                    <Text style={styles.errorSub}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={initializePayment}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0A1628', '#0D2137', '#0A1628']} style={StyleSheet.absoluteFillObject} />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <LinearGradient colors={['#F59E0B22', '#F5972200']} style={styles.headerGlow} />
                    <View style={styles.headerIcon}>
                        <Ionicons name="shield-checkmark" size={32} color="#F59E0B" />
                    </View>
                    <Text style={styles.title}>Complete Payment</Text>
                    <Text style={styles.subtitle}>Secure checkout powered by Chapa</Text>
                </View>

                {/* Amount Card */}
                {paymentData && (
                    <View style={styles.amountCard}>
                        <LinearGradient colors={['#1A2744', '#0F1B33']} style={styles.amountCardGrad} />
                        <Text style={styles.amountLabel}>Total Amount</Text>
                        <Text style={styles.amountValue}>
                            {paymentData.amount ?? '--'} <Text style={styles.amountCurrency}>{paymentData.currency ?? 'ETB'}</Text>
                        </Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: paymentData.status === 'COMPLETED' ? '#10B981' : '#F59E0B' }]} />
                            <Text style={styles.statusText}>{paymentData.status ?? 'PENDING'}</Text>
                        </View>
                    </View>
                )}

                {/* What you unlock */}
                <View style={styles.unlockBox}>
                    <Text style={styles.unlockTitle}>What you unlock</Text>
                    {[
                        { icon: 'book-outline', label: 'Premium Learning Resources', color: '#F59E0B' },
                        { icon: 'videocam-outline', label: 'Live Class Schedules', color: '#3B82F6' },
                        { icon: 'chatbubbles-outline', label: 'Community Chat Access', color: '#10B981' },
                        { icon: 'sparkles-outline', label: 'AI Vocabulary & Stories', color: '#8B5CF6' },
                    ].map((f, i) => (
                        <View key={i} style={styles.unlockRow}>
                            <View style={[styles.unlockIcon, { backgroundColor: f.color + '22' }]}>
                                <Ionicons name={f.icon} size={18} color={f.color} />
                            </View>
                            <Text style={styles.unlockLabel}>{f.label}</Text>
                            {!showSuccess && <Ionicons name="lock-closed-outline" size={14} color="#6B7280" />}
                        </View>
                    ))}
                </View>

                {/* Gateway & Re-open */}
                {paymentData?.checkoutUrl && paymentData?.status !== 'COMPLETED' && !showSuccess && (
                    <View style={styles.gatewayBox}>
                        <Ionicons name="card-outline" size={36} color="#6B7280" />
                        <Text style={styles.gatewayText}>Payment page opened in browser</Text>
                        <Text style={styles.gatewayHint}>Complete your payment on the Chapa page and return here. Premium access will activate automatically.</Text>
                        <TouchableOpacity
                            style={styles.reopenBtn}
                            onPress={() => Linking.openURL(paymentData.checkoutUrl).catch(() => { })}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="open-outline" size={15} color="#F59E0B" />
                            <Text style={styles.reopenBtnText}>Re-open Payment Page</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.reopenBtn, { borderColor: '#EF444433', marginTop: 12 }]}
                            onPress={() => {
                                Alert.alert(
                                    'Cancel Payment',
                                    'Are you sure you want to cancel this pending payment?',
                                    [
                                        { text: 'No', style: 'cancel' },
                                        {
                                            text: 'Yes, Cancel',
                                            style: 'destructive',
                                            onPress: async () => {
                                                const res = await cancelPayment(paymentData.id);
                                                if (res.success) {
                                                    Alert.alert('Canceled', 'Payment has been canceled.');
                                                    checkStatus(); // Refresh state
                                                }
                                            }
                                        }
                                    ]
                                )
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close-circle-outline" size={15} color="#EF4444" />
                            <Text style={[styles.reopenBtnText, { color: '#EF4444' }]}>Cancel Payment</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Success Message */}
                {paymentData?.status === 'COMPLETED' && !showSuccess && (
                    <View style={[styles.gatewayBox, { borderColor: '#10B98133' }]}>
                        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                        <Text style={[styles.gatewayText, { color: '#10B981' }]}>Payment Completed!</Text>
                        <Text style={styles.gatewayHint}>Your payment was successful. Click continue to access premium features.</Text>
                        <TouchableOpacity
                            style={[styles.reopenBtn, { borderColor: '#10B98155' }]}
                            onPress={handleContinue}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-forward" size={15} color="#10B981" />
                            <Text style={[styles.reopenBtnText, { color: '#10B981' }]}>Continue to Premium</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Secure badge */}
                <Animated.View style={[styles.secureBadge, { opacity: shimmerOpacity }]}>
                    <Ionicons name="lock-closed" size={13} color="#6B7280" />
                    <Text style={styles.secureText}>256-bit SSL encrypted · Powered by Chapa</Text>
                </Animated.View>
            </ScrollView>

            {/* Footer */}
            {paymentData?.status !== 'COMPLETED' && !showSuccess && (
                <View style={styles.footer}>
                    {/* Step 2: Manual Redirect Fallback */}
                    {paymentData?.checkoutUrl && (
                        <TouchableOpacity
                            style={styles.payNowBtn}
                            onPress={() => Linking.openURL(paymentData.checkoutUrl)}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#F59E0B', '#D97706']}
                                style={styles.payNowGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="card-outline" size={22} color="#1A1A2E" />
                                <Text style={styles.payNowText}>Complete Payment</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.verifyBtn, verifying && styles.verifyBtnDisabled]}
                        onPress={handleManualVerification}
                        disabled={verifying}
                        activeOpacity={0.85}
                    >
                        {verifying ? (
                            <ActivityIndicator color="#1A1A2E" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#1A1A2E" />
                                <Text style={styles.verifyText}>Check Payment Status</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={[styles.statusCheckBtn, verifying && styles.statusCheckBtnDisabled]}
                        onPress={handleManualVerification}
                        disabled={verifying}
                        activeOpacity={0.8}
                    >
                        {verifying ? (
                            <ActivityIndicator color={COLORS.primary} size="small" />
                        ) : (
                            <>
                                <Ionicons name="refresh-circle-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.statusCheckText}>Check Payment Status</Text>
                            </>
                        )}
                    </TouchableOpacity> */}

                    {/* DEV-ONLY test button — ENHANCED visibility */}
                    {/* {__DEV__ && (
                        <TouchableOpacity
                            style={[styles.devTestBtn, { backgroundColor: '#3B3B3B', paddingVertical: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#EF4444' }]}
                            onPress={forceUnlockDev}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="flask" size={16} color="#EF4444" />
                            <Text style={[styles.devTestText, { color: '#F3F4F6', fontWeight: 'bold' }]}>
                                EMERGENCY BYPASS: Force Unlock Premium
                            </Text>
                        </TouchableOpacity>
                    )} */}

                    <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Premium Success Modal */}
            <PremiumSuccessModal
                visible={showSuccess}
                onContinue={handleContinue}
            />
        </View>
    );
}