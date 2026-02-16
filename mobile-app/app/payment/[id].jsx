import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBatchStore } from '../../src/stores/batchStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
// import { WebView } from 'react-native-webview'; // Assuming usage for Chapa payment page, or mock

export default function PaymentScreen() {
    const { id } = useLocalSearchParams(); // Enrollment ID
    const router = useRouter();
    const { initiatePayment, checkPaymentStatus, isLoading, error } = useBatchStore();
    const [paymentData, setPaymentData] = useState(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (id) {
            startPayment();
        }
    }, [id]);

    const startPayment = async () => {
        const result = await initiatePayment(id);
        if (result.success) {
            setPaymentData(result.payment);
        } else {
            Alert.alert("Payment Error", result.error || "Failed to initiate payment.");
        }
    };

    const verifyPayment = async () => {
        setVerifying(true);
        const result = await checkPaymentStatus(id);
        setVerifying(false);

        if (result.success && result.status === 'COMPLETED') {
            Alert.alert("Success", "Payment confirmed! Access granted.", [
                { text: "Go to Learning", onPress: () => router.push('/(tabs)/Modules') }
            ]);
        } else {
            Alert.alert("Pending", "Payment is not yet confirmed. Please complete the payment.");
        }
    };

    if (isLoading && !paymentData) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Initiating Payment...</Text>
            </View>
        );
    }

    if (error && !paymentData) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry" onPress={startPayment} style={{ marginTop: 20 }} />
            </View>
        );
    }

    // Assuming Chapa returns a checkoutUrl
    if (paymentData?.checkoutUrl) {
        // For real implementation would use WebView or redirect
        // For now, let's mock the "Simulate Payment" view
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Complete Payment</Text>
                    <Text style={styles.subtitle}>Secure payment via Chapa</Text>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.amountLabel}>Total Amount</Text>
                    <Text style={styles.amountValue}>{paymentData.amount} {paymentData.currency}</Text>
                    <Text style={styles.status}>Status: {paymentData.status}</Text>
                </View>

                <View style={styles.webviewPlaceholder}>
                    <Ionicons name="card-outline" size={64} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Redirecting to Payment Gateway...</Text>
                    {/* In real app: <WebView source={{ uri: paymentData.checkoutUrl }} /> */}
                </View>

                <View style={styles.footer}>
                    <Button
                        title={verifying ? "Verifying..." : "I have completed payment"}
                        onPress={verifyPayment}
                        isLoading={verifying}
                    />
                    <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.lg,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    loadingText: {
        marginTop: SPACING.md,
        color: COLORS.textSecondary,
    },
    errorText: {
        marginTop: SPACING.md,
        color: COLORS.error,
        textAlign: 'center',
    },
    header: {
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    subtitle: {
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.xl,
    },
    amountLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginVertical: SPACING.sm,
    },
    status: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    webviewPlaceholder: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    placeholderText: {
        marginTop: SPACING.md,
        color: COLORS.textSecondary,
    },
    footer: {
        marginTop: 'auto',
    },
    cancelButton: {
        padding: SPACING.md,
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    cancelText: {
        color: COLORS.error,
        fontWeight: '600',
    },
});
