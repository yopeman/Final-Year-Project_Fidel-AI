import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useLearningStore } from '../../src/stores/learningStore';
import { Ionicons } from '@expo/vector-icons';


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

    useEffect(() => {
        getModules();
        getProgress();
    }, []);

    const onRefresh = React.useCallback(() => {
        getModules();
        getProgress();
    }, []);

    const currentPosition = getCurrentPosition();
    const overallProgress = progress?.completionPercentage || 0;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#FFD700" />
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

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Main Actions</Text>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => {
                        if (currentPosition?.lessonId) {
                            router.push(`/learn/${currentPosition.lessonId}`);
                        } else {
                            router.push('/(tabs)/Modules');
                        }
                    }}
                >
                    <View
                        style={[styles.actionGradient, { backgroundColor: '#000' }]}
                    >
                        <View style={styles.actionIconContainer}>
                            <Ionicons name="rocket" size={26} color="#FFD700" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Continue Learning</Text>
                            <Text style={styles.actionSubtitle} numberOfLines={1}>
                                {currentPosition?.lessonTitle || 'Start your first lesson'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, styles.secondaryActionCard]}
                    onPress={() => router.push('/(tabs)/AIConversation')}
                >
                    <View style={styles.actionGradient}>
                        <View style={[styles.actionIconContainer, { backgroundColor: '#f0f0f0' }]}>
                            <Ionicons name="chatbubbles" size={26} color="#000" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actionTitle, { color: '#000' }]}>Talk with AI</Text>
                            <Text style={styles.actionSubtitle}>Practice your fluency naturally</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, styles.secondaryActionCard]}
                    onPress={() => router.push('/(tabs)/Modules')}
                >
                    <View style={styles.actionGradient}>
                        <View style={[styles.actionIconContainer, { backgroundColor: '#f0f0f0' }]}>
                            <Ionicons name="library" size={26} color="#000" />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actionTitle, { color: '#000' }]}>All Modules</Text>
                            <Text style={styles.actionSubtitle}>Browse the full curriculum</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Upcoming Lesson Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Up Next</Text>
                <View style={styles.nextLessonCard}>
                    <Text style={styles.moduleName}>{currentPosition?.moduleTitle || 'Foundation'}</Text>
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
                        <Ionicons name="arrow-forward" size={16} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
    },
    subGreeting: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    avatarText: {
        color: '#FFD700',
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressSection: {
        marginHorizontal: 20,
        padding: 24,
        backgroundColor: '#000',
        borderRadius: 25,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 8,
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
        color: '#888',
    },
    progressPercentage: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: '#333',
        borderRadius: 5,
        marginBottom: 15,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statText: {
        color: '#ccc',
        fontSize: 13,
    },
    quickActions: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    section: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    actionCard: {
        borderRadius: 20,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    secondaryActionCard: {
        backgroundColor: '#fff',
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
    },
    actionIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#888',
    },
    nextLessonCard: {
        padding: 24,
        backgroundColor: '#f9f9f9',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    moduleName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFD700',
        backgroundColor: '#000',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    lessonName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    startButton: {
        backgroundColor: '#FFD700',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        alignSelf: 'flex-start',
    },
    startButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
