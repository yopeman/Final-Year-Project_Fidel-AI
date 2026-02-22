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
                                <Text style={styles.verifyText}>I Have Completed Payment</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
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
                    </TouchableOpacity>

                    {/* DEV-ONLY test button — ENHANCED visibility */}
                    {__DEV__ && (
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
                    )}

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

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const modal = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1E3A5F',
        backgroundColor: '#0A1628',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    gradientBg: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
    iconWrap: {
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    ring: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#F59E0B30',
    },
    checkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#F59E0B',
        shadowOpacity: 0.5,
        shadowRadius: 15,
    },
    headline: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingHorizontal: 24,
        lineHeight: 22,
        marginBottom: 32,
    },
    features: {
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#0F1B33',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E2D44',
    },
    featureIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 12,
        color: '#6B7280',
    },
    cta: {
        margin: 24,
        marginTop: 0,
        borderRadius: 18,
        overflow: 'hidden',
    },
    ctaGradient: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    ctaText: {
        color: '#1A1A2E',
        fontSize: 17,
        fontWeight: 'bold',
    },
    // Chapa Redirect Button
    payNowBtn: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    payNowGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    payNowText: {
        color: '#1A1A2E',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: SPACING.lg, paddingBottom: 140 },

    loadingText: { marginTop: SPACING.md, color: '#9CA3AF', fontSize: 15 },

    errorCard: {
        backgroundColor: '#1A1A2E',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        gap: SPACING.sm,
    },
    errorTitle: { color: '#EF4444', fontSize: 20, fontWeight: 'bold' },
    errorSub: { color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
    retryBtn: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        marginTop: SPACING.sm,
    },
    retryText: { color: '#1A1A2E', fontWeight: 'bold' },

    header: { alignItems: 'center', marginBottom: SPACING.xl, position: 'relative' },
    headerGlow: {
        position: 'absolute', top: -20, width: 260, height: 120,
        borderRadius: 130,
    },
    headerIcon: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: '#F59E0B22',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1, borderColor: '#F59E0B44',
    },
    title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#9CA3AF' },

    amountCard: {
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F59E0B33',
    },
    amountCardGrad: { ...StyleSheet.absoluteFillObject },
    amountLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
    amountValue: { fontSize: 42, fontWeight: 'bold', color: '#F59E0B' },
    amountCurrency: { fontSize: 20, fontWeight: '600', color: '#F59E0BAA' },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { color: '#D1D5DB', fontSize: 13, fontWeight: '600' },

    unlockBox: {
        backgroundColor: '#0F1B33',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    unlockTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: SPACING.md },
    unlockRow: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#1E2D44',
    },
    unlockIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    unlockLabel: { flex: 1, color: '#D1D5DB', fontSize: 14 },

    gatewayBox: {
        backgroundColor: '#0D1626',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#1E2D44',
        gap: SPACING.sm,
    },
    gatewayText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
    gatewayHint: { color: '#6B7280', fontSize: 12, textAlign: 'center', lineHeight: 18 },
    reopenBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: SPACING.sm,
        borderWidth: 1, borderColor: '#F59E0B55',
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.md, paddingVertical: 8,
        backgroundColor: '#F59E0B11',
    },
    reopenBtnText: { color: '#F59E0B', fontSize: 13, fontWeight: '600' },

    secureBadge: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 5, marginBottom: SPACING.sm,
    },
    secureText: { color: '#4B5563', fontSize: 12 },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#0A1628',
        padding: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 36 : SPACING.lg,
        borderTopWidth: 1, borderTopColor: '#1E2D44',
    },
    verifyBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, backgroundColor: '#F59E0B',
        paddingVertical: 16, borderRadius: BORDER_RADIUS.lg,
        shadowColor: '#F59E0B', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    verifyBtnDisabled: { opacity: 0.6, shadowOpacity: 0 },
    verifyText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 16 },
    devTestBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 5, paddingVertical: 8, marginTop: 6,
        borderWidth: 1, borderColor: '#2D3748', borderRadius: BORDER_RADIUS.md,
        borderStyle: 'dashed',
    },
    devTestText: { color: '#4B5563', fontSize: 12 },
    cancelBtn: { alignItems: 'center', paddingVertical: SPACING.sm, marginTop: SPACING.xs },
    cancelText: { color: '#6B7280', fontWeight: '600' },

    statusCheckBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'transparent',
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.primary + '44',
        marginTop: SPACING.md,
    },
    statusCheckBtnDisabled: { opacity: 0.5 },
    statusCheckText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },

    statusCheckText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});