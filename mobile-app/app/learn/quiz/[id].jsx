import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLearningStore } from '../../../src/stores/learningStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../../src/components/Button'; // Assuming Button component exists

export default function QuizScreen() {
    const { id } = useLocalSearchParams(); // Lesson ID acting as Quiz ID
    const router = useRouter();
    const { getQuiz, isLoading, error, markLessonComplete } = useLearningStore();

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (id) {
            loadQuiz();
        }
    }, [id]);

    const loadQuiz = async () => {
        const result = await getQuiz(id);
        if (result.success) {
            setQuiz(result.quiz);
        } else {
            Alert.alert("Error", "Failed to load quiz.");
        }
    };

    const handleOptionSelect = (questionId, optionIndex) => {
        if (submitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        // precise validation
        const unanswered = quiz.questions.filter(q => answers[q.id] === undefined);
        if (unanswered.length > 0) {
            Alert.alert("Incomplete", "Please answer all questions before submitting.");
            return;
        }

        let correctCount = 0;
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctOptionIndex) {
                correctCount++;
            }
        });

        setScore(correctCount);
        setSubmitted(true);

        // Mark as complete if passed (e.g., > 50%)
        // For now, completion = submission
        await markLessonComplete(id);
    };

    if (isLoading && !quiz) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!quiz) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Quiz not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{quiz.title || "Quiz"}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {quiz.questions.map((q, index) => {
                    const isCorrect = submitted && answers[q.id] === q.correctOptionIndex;
                    const isWrong = submitted && answers[q.id] !== q.correctOptionIndex && answers[q.id] !== undefined;

                    return (
                        <View key={q.id} style={styles.questionCard}>
                            <Text style={styles.questionText}>{index + 1}. {q.question}</Text>
                            <View style={styles.optionsContainer}>
                                {q.options.map((opt, optIndex) => {
                                    const isSelected = answers[q.id] === optIndex;
                                    let optionStyle = styles.optionButton;
                                    let textStyle = styles.optionText;

                                    if (submitted) {
                                        if (optIndex === q.correctOptionIndex) {
                                            optionStyle = styles.correctOption;
                                            textStyle = styles.whiteText;
                                        } else if (isSelected && optIndex !== q.correctOptionIndex) {
                                            optionStyle = styles.wrongOption;
                                            textStyle = styles.whiteText;
                                        }
                                    } else if (isSelected) {
                                        optionStyle = styles.selectedOption;
                                        textStyle = styles.selectedOptionText;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={optIndex}
                                            style={optionStyle}
                                            onPress={() => handleOptionSelect(q.id, optIndex)}
                                            disabled={submitted}
                                        >
                                            <Text style={textStyle}>{opt}</Text>
                                            {submitted && optIndex === q.correctOptionIndex && (
                                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}

                {submitted && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>Quiz Completed!</Text>
                        <Text style={styles.resultScore}>
                            You scored {score} / {quiz.questions.length}
                        </Text>
                        <Button
                            title="Continue Learning"
                            onPress={() => router.back()}
                        />
                    </View>
                )}
            </ScrollView>

            {!submitted && (
                <View style={styles.footer}>
                    <Button
                        title="Submit Quiz"
                        onPress={handleSubmit}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: 50,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.sm,
        marginRight: SPACING.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.textSecondary,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    questionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    questionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    optionsContainer: {
        gap: SPACING.sm,
    },
    optionButton: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedOption: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
    },
    correctOption: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    wrongOption: {
        backgroundColor: COLORS.error,
        borderColor: COLORS.error,
    },
    optionText: {
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    whiteText: {
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    resultContainer: {
        marginTop: SPACING.xl,
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.sm,
    },
    resultScore: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
});
