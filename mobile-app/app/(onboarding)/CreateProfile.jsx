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
    { key: 'duration', title: 'Schedule & Constraints' },
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
        constraints: '',
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
            // Alert.alert("Please fill in all fields"); // Optional
            return;
        }

        // Filter out fields not in CreateProfileInput schema (interests, targetLanguage)
        const payload = {
            ageRange: formData.ageRange,
            proficiency: formData.proficiency,
            nativeLanguage: formData.nativeLanguage,
            learningGoal: formData.learningGoal,
            targetDuration: parseInt(formData.targetDuration),
            durationUnit: formData.durationUnit,
            constraints: formData.constraints || ''
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
                            placeholder="e.g. Amharic, Oromo"
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            multiline
                            value={formData.learningGoal}
                            onChangeText={(text) => setFormData({ ...formData, learningGoal: text })}
                        />
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.label}>Target Learning Duration</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="30"
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                keyboardType="numeric"
                                value={formData.targetDuration.toString()}
                                onChangeText={(text) => setFormData({ ...formData, targetDuration: text.replace(/[^0-9]/g, '') })}
                            />
                            <View style={{ width: 10 }} />
                            <View style={[styles.optionsContainer, { flex: 2, marginBottom: 0 }]}>
                                {['DAYS', 'WEEKS', 'MONTHS'].map((unit) => (
                                    <TouchableOpacity
                                        key={unit}
                                        style={[styles.optionChip, formData.durationUnit === unit && styles.selectedOption]}
                                        onPress={() => setFormData({ ...formData, durationUnit: unit })}
                                    >
                                        <Text style={[styles.optionText, formData.durationUnit === unit && styles.selectedOptionText]}>
                                            {unit.charAt(0) + unit.slice(1).toLowerCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <Text style={styles.label}>Any learning constraints? (Optional)</Text>
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="e.g. Only available on weekends, etc."
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            multiline
                            value={formData.constraints}
                            onChangeText={(text) => setFormData({ ...formData, constraints: text })}
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
