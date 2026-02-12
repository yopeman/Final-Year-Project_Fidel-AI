import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../src/components/Card';
import { useLearningStore } from '../../src/stores/learningStore';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function LessonsScreen() {
    const router = useRouter();
    const { id, title } = useLocalSearchParams();
    const moduleId = id;
    const moduleTitle = title;

    const { modules, getLessons } = useLearningStore();

    useEffect(() => {
        if (moduleId) {
            getLessons(moduleId);
        }
    }, [moduleId]);

    const module = modules.find(m => m.id === moduleId);
    const lessons = module?.lessons || [];

    const getLessonStatus = (lesson) => {
        if (lesson.locked) return 'locked';
        if (lesson.completed) return 'completed';
        if (lesson.current) return 'current';
        return 'unlocked';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'locked': return COLORS.locked;
            case 'completed': return COLORS.completed;
            case 'current': return COLORS.inProgress;
            case 'unlocked': return COLORS.unlocked;
            default: return COLORS.border;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'locked': return '🔒';
            case 'completed': return '✅';
            case 'current': return '▶️';
            case 'unlocked': return '📖';
            default: return '';
        }
    };

    const handleLessonPress = (lesson) => {
        if (lesson.locked) return;
        router.push({
            pathname: '/learn/lesson/[id]',
            params: { id: lesson.id }
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>{moduleTitle}</Text>
                <Text style={styles.subtitle}>
                    {lessons.filter(l => l.completed).length}/{lessons.length} lessons completed
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {lessons.map((lesson, index) => {
                    const status = getLessonStatus(lesson);
                    const statusColor = getStatusColor(status);

                    return (
                        <TouchableOpacity
                            key={lesson.id || index}
                            onPress={() => handleLessonPress(lesson)}
                            disabled={lesson.locked}
                            activeOpacity={0.7}
                        >
                            <Card
                                variant="elevated"
                                style={[
                                    styles.lessonCard,
                                    lesson.locked && styles.lessonCardLocked,
                                    lesson.current && styles.lessonCardCurrent,
                                ]}
                            >
                                <View style={styles.lessonHeader}>
                                    <View style={styles.lessonNumber}>
                                        <Text style={[styles.lessonNumberText, lesson.locked && styles.textLocked]}>
                                            {index + 1}
                                        </Text>
                                    </View>

                                    <View style={styles.lessonInfo}>
                                        <Text style={[styles.lessonTitle, lesson.locked && styles.textLocked]}>
                                            {lesson.title}
                                        </Text>
                                        {lesson.description && (
                                            <Text style={styles.lessonDescription}>
                                                {lesson.description}
                                            </Text>
                                        )}

                                        {!lesson.locked && (
                                            <View style={styles.lessonMeta}>
                                                <Text style={styles.lessonDuration}>⏱️ {lesson.duration || '10 min'}</Text>
                                                {lesson.xp && (
                                                    <Text style={styles.lessonXP}>⭐ {lesson.xp} XP</Text>
                                                )}
                                            </View>
                                        )}
                                    </View>

                                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                        <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
                                    </View>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
    },
    title: {
        fontSize: FONTS.sizes.xxxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
        gap: SPACING.md,
    },
    lessonCard: {
        opacity: 1,
    },
    lessonCardLocked: {
        opacity: 0.6,
    },
    lessonCardCurrent: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    lessonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lessonNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    lessonNumberText: {
        fontSize: FONTS.sizes.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    textLocked: {
        color: COLORS.textSecondary,
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    lessonDescription: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    lessonMeta: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    lessonDuration: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
    },
    lessonXP: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    statusBadge: {
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    statusIcon: {
        fontSize: 20,
    },
});
