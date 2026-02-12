import React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useAuthStore } from '../../src/stores/authStore';

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
            <View style={styles.header}>
                <Text style={styles.title}>Your Personal Plan</Text>
                <Text style={styles.subtitle}>Review your curriculum before starting.</Text>
            </View>

            <ScrollView style={styles.planContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                {isLoading && !isImproving ? (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#FFD700" />
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
                        multiline
                        value={improvementText}
                        onChangeText={setImprovementText}
                        autoFocus
                    />
                    <View style={styles.improveButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setIsImproving(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitImproveButton} onPress={handleImprove} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.submitImproveButtonText}>Update Plan</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => setIsImproving(true)}
                        disabled={isLoading}
                    >
                        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Improve Plan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleInstall}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={[styles.buttonText, styles.primaryButtonText]}>Install & Start</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#ccc',
    },
    planContainer: {
        flex: 1,
        padding: 20,
    },
    planCard: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    h3: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 20,
        marginBottom: 10,
    },
    h4: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 15,
        marginBottom: 8,
    },
    textLine: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        marginBottom: 5,
    },
    boldLine: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    bullet: {
        fontSize: 15,
        color: '#444',
        marginLeft: 10,
        marginBottom: 5,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    improveContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    improveInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        height: 100,
        backgroundColor: '#f5f5f5',
        textAlignVertical: 'top',
    },
    improveButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 15,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    submitImproveButton: {
        backgroundColor: '#FFD700',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 20,
        minWidth: 120,
        alignItems: 'center',
    },
    submitImproveButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        flexDirection: 'row',
        gap: 15,
        backgroundColor: '#fff',
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#FFD700',
    },
    primaryButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});
