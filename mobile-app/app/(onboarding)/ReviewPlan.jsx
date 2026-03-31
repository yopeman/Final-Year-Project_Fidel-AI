import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/reviewPlanStyle';

export default function ReviewPlan() {
    const router = useRouter();
    const { learningPlan, updateLearningPlan, installLearningPlan, getModules, isLoading, error } = useLearningStore();
    const { refreshUser } = useAuthStore();
    const [isImproving, setIsImproving] = useState(false);
    const [improvementText, setImprovementText] = useState('');

    const handleInstall = async () => {
        const result = await installLearningPlan();
        if (result.success) {
            await refreshUser();
            await getModules();
            router.replace('/(tabs)/Home');
        }
    };

    const handleImprove = async () => {
        if (!improvementText.trim()) {
            setIsImproving(false);
            return;
        }
        const result = await updateLearningPlan(improvementText);
        if (result.success) {
            setIsImproving(false);
            setImprovementText('');
        }
    };

    if (!learningPlan && !isLoading) {
        return (
            <View style={styles.container}>
                <View style={[styles.content, { justifyContent: 'center' }]}>
                    <Text style={styles.errorText}>No plan generated. Please try again.</Text>
                    <TouchableOpacity style={styles.button} onPress={() => router.replace('/(onboarding)/GeneratePlan')}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // A very basic markdown-lite renderer for the plan text
    const renderPlan = (text) => {
        if (!text) return null;

        const lines = text.split('\n');
        return lines.map((line, index) => {
            if (line.startsWith('###')) {
                return <Text key={index} style={styles.h3}>{line.replace('###', '').trim()}</Text>;
            } else if (line.startsWith('####')) {
                return <Text key={index} style={styles.h4}>{line.replace('####', '').trim()}</Text>;
            } else if (line.startsWith('**')) {
                return <Text key={index} style={styles.boldLine}>{line.replace(/\*\*/g, '').trim()}</Text>;
            } else if (line.startsWith('-')) {
                return <Text key={index} style={styles.bullet}>{line}</Text>;
            }
            return <Text key={index} style={styles.textLine}>{line}</Text>;
        });
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
                    <Text style={styles.title}>Your Personal Plan</Text>
                    <Text style={styles.subtitle}>Review your curriculum before starting.</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.planContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                {isLoading && !isImproving ? (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Refining your curriculum...</Text>
                    </View>
                ) : (
                    <View style={styles.planCard}>
                        {renderPlan(learningPlan)}
                    </View>
                )}
            </ScrollView>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {isImproving ? (
                <View style={styles.improveContainer}>
                    <TextInput
                        style={styles.improveInput}
                        placeholder="What would you like to change? (e.g. More focus on business, slower pace)"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        multiline
                        value={improvementText}
                        onChangeText={setImprovementText}
                        autoFocus
                    />
                    <View style={styles.improveButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setIsImproving(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitImproveButton} onPress={handleImprove} disabled={isLoading} activeOpacity={0.8}>
                            <LinearGradient
                                colors={[COLORS.primary, '#059669']}
                                style={styles.improveBtnGrad}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitImproveButtonText}>Update Plan</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setIsImproving(true)}
                        disabled={isLoading}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="options-outline" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.secondaryButtonText}>Improve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleInstall}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, '#059669']}
                            style={styles.primaryButtonGrad}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.primaryButtonText}>Install & Start</Text>
                                    <Ionicons name="rocket" size={20} color="#fff" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

