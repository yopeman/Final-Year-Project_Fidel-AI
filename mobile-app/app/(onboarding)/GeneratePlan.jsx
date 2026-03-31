import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/generatePlanStyle';

export default function GeneratePlan() {
    const router = useRouter();
    const { generateLearningPlan, isLoading, error } = useLearningStore();
    const { user, hasPlan } = useAuthStore();
    const [statusText, setStatusText] = useState('Organizing your learning path...');

    useEffect(() => {
        if (hasPlan) {
            router.replace('/(tabs)/Home');
        }
    }, [hasPlan]);

    useEffect(() => {
        // Simulate AI "thinking" phases
        if (isLoading) {
            const timer1 = setTimeout(() => setStatusText('Analyzing your unique profile...'), 1500);
            const timer2 = setTimeout(() => setStatusText('Curating the best resources for you...'), 3000);
            const timer3 = setTimeout(() => setStatusText('Creating your personalized plan...'), 4500);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [isLoading]);

    const handleGenerate = async () => {
        const result = await generateLearningPlan();
        if (result.success) {
            router.replace('/(onboarding)/ReviewPlan');
        }
    };

    const formatEnum = (str) => {
        if (!str) return 'N/A';
        return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.heroBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.glowBlob} />
                <View style={styles.header}>
                    <Text style={styles.title}>AI Learning Plan</Text>
                    <Text style={styles.subtitle}>Let's build your path to mastery</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.statusText}>{statusText}</Text>
                    </View>
                ) : (
                    <View style={styles.infoContainer}>
                        <View style={styles.summaryBadge}>
                            <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                            <Text style={styles.summaryBadgeText}>PROFILE ANALYSIS COMPLETE</Text>
                        </View>

                        <Text style={styles.description}>
                            We've analyzed your preferences. Here's what we'll use to build your curriculum:
                        </Text>

                        <View style={styles.card}>
                            <View style={styles.row}>
                                <View style={styles.item}>
                                    <Text style={styles.cardLabel}>Native Language</Text>
                                    <Text style={styles.cardValue}>{user?.profile?.nativeLanguage || 'N/A'}</Text>
                                </View>
                                <View style={styles.item}>
                                    <Text style={styles.cardLabel}>Proficiency</Text>
                                    <Text style={styles.cardValue}>{formatEnum(user?.profile?.proficiency)}</Text>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.item}>
                                    <Text style={styles.cardLabel}>Age Range</Text>
                                    <Text style={styles.cardValue}>{formatEnum(user?.profile?.ageRange)}</Text>
                                </View>
                                <View style={styles.item}>
                                    <Text style={styles.cardLabel}>Duration</Text>
                                    <Text style={styles.cardValue}>
                                        {user?.profile?.targetDuration} {formatEnum(user?.profile?.durationUnit)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.cardLabel}>Learning Goal</Text>
                            <Text style={styles.cardValue}>{user?.profile?.learningGoal || 'General Fluency'}</Text>
                        </View>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.button} onPress={handleGenerate} activeOpacity={0.8}>
                            <LinearGradient
                                colors={[COLORS.primary, '#059669']}
                                style={styles.buttonGrad}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.buttonText}>Generate My Plan</Text>
                                <Ionicons name="chevron-forward" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

