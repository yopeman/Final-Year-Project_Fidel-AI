import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useAuthStore } from '../../src/stores/authStore';

export default function GeneratePlan() {
    const router = useRouter();
    const { generateLearningPlan, isLoading, error } = useLearningStore();
    const { user } = useAuthStore();
    const [statusText, setStatusText] = useState('Organizing your learning path...');

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
            <View style={styles.content}>
                <Text style={styles.title}>AI Learning Plan</Text>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFD700" />
                        <Text style={styles.statusText}>{statusText}</Text>
                    </View>
                ) : (
                    <View style={styles.infoContainer}>
                        <Text style={styles.description}>
                            We've analyzed your preferences. Here's a summary of what we'll use to build your curriculum:
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

                            <Text style={styles.cardLabel}>Learning Goal</Text>
                            <Text style={styles.cardValue}>{user?.profile?.learningGoal || 'General Fluency'}</Text>
                        </View>

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <TouchableOpacity style={styles.button} onPress={handleGenerate}>
                            <Text style={styles.buttonText}>Generate My Plan</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        gap: 20,
    },
    statusText: {
        fontSize: 18,
        color: '#666',
        marginTop: 20,
        textAlign: 'center',
    },
    infoContainer: {
        width: '100%',
        alignItems: 'center',
    },
    description: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    card: {
        width: '100%',
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#eee',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    item: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 5,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    },
});
