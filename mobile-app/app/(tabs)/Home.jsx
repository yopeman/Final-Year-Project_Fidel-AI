import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useLearningStore } from '../../src/stores/learningStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/constants';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const {
        modules,
        progress,
        getCurrentPosition,
        getModules,
        getProgress,
        isLoading
    } = useLearningStore();

    const { batches, enrollments, getBatches, isLoading: batchLoading } = useBatchStore();

    useEffect(() => {
        getModules();
        getProgress();
        getBatches();
    }, []);

    const onRefresh = React.useCallback(() => {
        getModules();
        getProgress();
        getBatches();
    }, []);

    const myBatches = batches.filter(b =>
        enrollments.some(e => e.batch?.id === b.id && e.status === 'ENROLLED') || b.status === "ENROLLED_MOCK"
    );

    const currentPosition = getCurrentPosition();
    const overallProgress = progress?.completionPercentage || 0;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.secondary || '#111827', '#000']}
                style={styles.background}
            />
            <StatusBar barStyle="light-content" />

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={isLoading || batchLoading} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Greeting */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hi, {user?.firstName || 'Learner'} 👋</Text>
                        <Text style={styles.subGreeting}>Ready to continue your journey?</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/Profile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.firstName?.[0] || 'U'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Progress Card */}
                <View style={styles.progressSection}>
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressLabel}>Daily Progress</Text>
                        <Text style={styles.progressPercentage}>{Math.round(overallProgress)}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${overallProgress}%` }]} />
                    </View>
                    <View style={styles.statsRow}>
                        <Text style={styles.statText}>
                            {progress?.completedLessons || 0} lessons completed
                        </Text>
                        <Text style={styles.statText}>
                            {progress?.streakDays || 0} day streak 🔥
                        </Text>
                    </View>
                </View>

                {/* Upcoming Lesson Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Up Next</Text>
                    <View style={styles.nextLessonCard}>
                        <View style={styles.nextLessonHeader}>
                            <Text style={styles.moduleName}>{currentPosition?.moduleTitle || 'Foundation'}</Text>
                            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                        </View>
                        <Text style={styles.lessonName}>{currentPosition?.lessonTitle || 'Ready to start!'}</Text>

                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => {
                                if (currentPosition?.lessonId) {
                                    router.push(`/learn/${currentPosition.lessonId}`);
                                } else {
                                    router.push('/(tabs)/Modules');
                                }
                            }}
                        >
                            <Text style={styles.startButtonText}>Start Now</Text>
                            <Ionicons name="arrow-forward" size={18} color={COLORS.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/(tabs)/AIConversation')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                                <Ionicons name="chatbubbles" size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.actionTitle}>AI Tutor</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/(tabs)/Modules')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                <Ionicons name="library" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.actionTitle}>Library</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/(tabs)/Batch')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                                <Ionicons name="people" size={24} color="#F59E0B" />
                            </View>
                            <Text style={styles.actionTitle}>Batches</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Batches Section */}
                {myBatches.length > 0 && (
                    <View style={[styles.section, { marginBottom: 30 }]}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>My Batches</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/Batch')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {myBatches.map((batch, index) => (
                                <TouchableOpacity
                                    key={batch.id || index}
                                    style={styles.batchCardMini}
                                    onPress={() => router.push(`batch/${batch.id}`)}
                                >
                                    <View style={styles.batchIconMini}>
                                        <Ionicons name="school" size={20} color={COLORS.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.batchNameMini} numberOfLines={1}>{batch.name}</Text>
                                        <Text style={styles.batchLevelMini}>{batch.level}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary || '#111827',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    subGreeting: {
        fontSize: 16,
        color: '#9CA3AF',
        marginTop: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.surfaceDark || '#1F2937',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    avatarText: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressSection: {
        marginHorizontal: SPACING.lg,
        padding: 24,
        backgroundColor: COLORS.surfaceDark || '#1F2937',
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#374151',
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    progressLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#D1D5DB',
    },
    progressPercentage: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#374151',
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statText: {
        color: '#9CA3AF',
        fontSize: 13,
    },
    section: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    nextLessonCard: {
        padding: 20,
        backgroundColor: COLORS.surfaceDark || '#1F2937',
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: '#374151',
    },
    nextLessonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    moduleName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    lessonName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 24,
    },
    startButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    startButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    quickActions: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 30,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: COLORS.surfaceDark || '#1F2937',
        padding: 16,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#374151',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    horizontalScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    batchCardMini: {
        backgroundColor: COLORS.surfaceDark || '#1F2937',
        borderRadius: BORDER_RADIUS.lg,
        padding: 16,
        marginRight: 12,
        width: 150,
        borderWidth: 1,
        borderColor: '#374151',
    },
    batchIconMini: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    batchNameMini: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 14,
        marginBottom: 4,
    },
    batchLevelMini: {
        color: '#9CA3AF',
        fontSize: 12,
    },
});
