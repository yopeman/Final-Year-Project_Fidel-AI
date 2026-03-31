import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/createProfileStyle';

const steps = [
    { key: 'basics', title: 'Basic Info' },
    { key: 'language', title: 'Language & Goals' },
];

const CreateProfile = () => {
    const router = useRouter();
    const { createProfile, isLoading, error, hasProfile, hasPlan } = useAuthStore();

    useEffect(() => {
        if (hasProfile && hasPlan) {
            router.replace('/(tabs)/Home');
        }
    }, [hasProfile, hasPlan]);
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
                    <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${((currentStep + 1) / steps.length) * 100}%` }]} />
                        </View>
                        <Text style={styles.progressText}>Step {currentStep + 1} of {steps.length}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {renderStepContent()}
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color="#EF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                {currentStep > 0 && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={isLoading}>
                        <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.nextButton, currentStep === 0 && { marginLeft: 0 }]}
                    onPress={handleNext}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[COLORS.primary, '#059669']}
                        style={styles.nextButtonGrad}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.nextButtonText}>
                                    {currentStep === steps.length - 1 ? 'Create Profile' : 'Next Step'}
                                </Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default CreateProfile;
