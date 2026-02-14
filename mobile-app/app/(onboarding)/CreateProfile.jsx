import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

const steps = [
    { key: 'basics', title: 'Basic Info' },
    { key: 'language', title: 'Language & Goals' },
];

export default function CreateProfile() {
    const router = useRouter();
    const { createProfile, isLoading, error } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(0);

    const [formData, setFormData] = useState({
        nativeLanguage: '',
        targetLanguage: 'English',
        proficiency: 'BEGINNER', // Uppercase Enum
        learningGoal: '',
        ageRange: '',
        targetDuration: 30,
        durationUnit: 'DAYS', // Uppercase Enum
        interests: []
    });

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!formData.ageRange || !formData.nativeLanguage || !formData.learningGoal) {
            console.warn("Missing required fields");
            // alert("Please fill in all fields"); // Optional
            return;
        }

        // Filter out fields not in CreateProfileInput schema (interests, targetLanguage)
        const payload = {
            ageRange: formData.ageRange,
            proficiency: formData.proficiency,
            nativeLanguage: formData.nativeLanguage,
            learningGoal: formData.learningGoal,
            targetDuration: formData.targetDuration,
            durationUnit: formData.durationUnit,
            // constraints: '' // Optional, we can omit if empty
        };

        const result = await createProfile(payload);
        if (result.success) {
            router.replace('/(onboarding)/GeneratePlan');
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.label}>What is your native language?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Spanish, French"
                            value={formData.nativeLanguage}
                            onChangeText={(text) => setFormData({ ...formData, nativeLanguage: text })}
                        />

                        <Text style={styles.label}>Age Range</Text>
                        <View style={styles.optionsContainer}>
                            {[
                                { label: 'Under 18', value: 'UNDER_18' },
                                { label: '18-25', value: '_18_25' },
                                { label: '26-35', value: '_26_35' },
                                { label: '36-45', value: '_36_45' },
                                { label: '45+', value: '_45_PLUS' }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[styles.optionChip, formData.ageRange === option.value && styles.selectedOption]}
                                    onPress={() => setFormData({ ...formData, ageRange: option.value })}
                                >
                                    <Text style={[styles.optionText, formData.ageRange === option.value && styles.selectedOptionText]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.label}>Current Proficiency Level</Text>
                        <View style={styles.optionsContainer}>
                            {['BEGINNER', 'BASIC', 'INTERMEDIATE', 'ADVANCED'].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[styles.optionChip, formData.proficiency === level && styles.selectedOption]}
                                    onPress={() => setFormData({ ...formData, proficiency: level })}
                                >
                                    <Text style={[styles.optionText, formData.proficiency === level && styles.selectedOptionText]}>
                                        {level.charAt(0) + level.slice(1).toLowerCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>What is your main goal?</Text>
                        <TextInput
                            style={[styles.input, { height: 100 }]}
                            placeholder="e.g. For travel, career, or fun"
                            multiline
                            value={formData.learningGoal}
                            onChangeText={(text) => setFormData({ ...formData, learningGoal: text })}
                        />
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((currentStep + 1) / steps.length) * 100}%` }]} />
                </View>
                <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderStepContent()}
                {error && <Text style={styles.errorText}>{error}</Text>}
            </ScrollView>

            <View style={styles.footer}>
                {currentStep > 0 && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={isLoading}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.nextButtonText}>{currentStep === steps.length - 1 ? 'Create Profile' : 'Next'}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFD700', // Gold/Yellow
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 20,
    },
    stepContainer: {
        gap: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#f5f5f5',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    selectedOption: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
    },
    selectedOptionText: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 15,
    },
    backButtonText: {
        fontSize: 16,
        color: '#666',
    },
    nextButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
});
