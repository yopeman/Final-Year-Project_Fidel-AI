import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View, StyleSheet, ScrollView, RefreshControl,Text,
    StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useLearningStore } from '../../src/stores/learningStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { useNotificationStore } from '../../src/stores/notificationStore';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumMenu from '../../src/components/PremiumMenu';
import PremiumUpgradeModal from '../../src/components/PremiumUpgradeModal';
import HeroBanner from '../../src/components/home/HeroBanner';
import UpNextSection from '../../src/components/home/UpNextSection';
import QuickActions from '../../src/components/home/QuickActions';
import { COLORS } from '../../src/constants/theme';
import PremiumSection from '../../src/components/home/PremiumSection';
import MyBatchesSection from '../../src/components/MyBatchesSection';
import styles from '../styles/homeStyle';

const HomeScreen = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const [menuVisible, setMenuVisible] = useState(false);
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('all');

    const { progress, getCurrentPosition, getModules, getProgress, isLoading } = useLearningStore();
    const { unreadCount, getNotifications } = useNotificationStore();
    const {
        batches,
        enrollments,
        getMyBatches,
        getMyEnrollments,
        isLoading: batchLoading,
        premiumUnlocked,
        initializeStore
    } = useBatchStore();

    // Initialize store with persisted data
    useEffect(() => {
        const init = async () => {
            try {
                await initializeStore();
                await getMyEnrollments();
                setIsInitialized(true);
            } catch (error) {
                console.log('[Home] Initialization error:', error);
                setIsInitialized(true);
            }
        };
        init();
    }, []);

    // Re-fetch when user changes
    useEffect(() => {
        if (user?.id && isInitialized) {
            getMyEnrollments();
        }
    }, [user?.id, isInitialized]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        await Promise.all([
            getModules(),
            getProgress(),
            getMyEnrollments(),
            getMyBatches(),
            getNotifications()
        ]);
    };

    const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED' || e.status === 'COMPLETED');
    const currentPosition = getCurrentPosition();
    const overallProgress = progress?.completionPercentage || 0;

    const onRefresh = useCallback(async () => {
        await fetchData();
    }, []);

    const enrolledBatches = useMemo(() => {
        return enrollments
            .filter(e => e.status === 'ENROLLED' || e.status === 'COMPLETED')
            .map(enrollment => {
                const batchDetails = batches.find(b => b.id === enrollment.batch?.id);
                return {
                    ...enrollment,
                    batch: {
                        ...enrollment.batch,
                        ...batchDetails,
                        startDate: enrollment.batch?.startDate || batchDetails?.startDate,
                        endDate: enrollment.batch?.endDate || batchDetails?.endDate,
                        level: enrollment.batch?.level || batchDetails?.level,
                        status: enrollment.batch?.status || batchDetails?.status || 'ACTIVE',
                        language: enrollment.batch?.language || batchDetails?.language || 'English'
                    }
                };
            })
            .sort((a, b) => new Date(a.enrollmentDate) - new Date(b.enrollmentDate));
    }, [enrollments, batches]);

    const groupedBatches = useMemo(() => {
        const groups = {};
        enrolledBatches.forEach(enrollment => {
            if (!enrollment.batch?.startDate) return;
            const date = new Date(enrollment.batch.startDate);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) groups[monthYear] = [];
            groups[monthYear].push({
                ...enrollment.batch,
                enrollmentId: enrollment.id,
                enrollmentDate: enrollment.enrollmentDate,
            });
        });
        return groups;
    }, [enrolledBatches]);

    const availableMonths = useMemo(() => {
        const months = new Set();
        Object.keys(groupedBatches).forEach(month => {
            months.add(month.split(' ')[0].toLowerCase());
        });
        return Array.from(months);
    }, [groupedBatches]);

    if (!isInitialized) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LinearGradient
                    colors={['#0A2540', '#0D1B2A', '#080C14']}
                    style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}
                >
                    <ActivityIndicator size="large" color="#FFC107" style={{ marginBottom: 16 }} />
                    <Text style={{ color: '#fff', fontSize: 16, opacity: 0.8 }}>Loading your profile...</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>
                        Please wait while we set up your experience
                    </Text>
                </LinearGradient>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
                <PremiumUpgradeModal visible={upgradeModalVisible} onClose={() => setUpgradeModalVisible(false)} />

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading || batchLoading}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
                >
                    <HeroBanner
                        user={user}
                        overallProgress={overallProgress}
                        streakDays={progress?.streakDays}
                        completedLessons={progress?.completedLessons}
                        unreadCount={unreadCount}
                        onMenuPress={() => setMenuVisible(true)}
                        onNotificationPress={() => router.push('/notifications')}
                        onProfilePress={() => router.push('/(tabs)/Profile')}
                    />

                    <View style={styles.body}>
                        <UpNextSection
                            currentPosition={currentPosition}
                            onViewAll={() => router.push('/(tabs)/Modules')}
                            onContinue={() => {
                                if (currentPosition?.lessonId) {
                                    router.push(`/learn/${currentPosition.lessonId}`);
                                } else {
                                    router.push('/(tabs)/Modules');
                                }
                            }}
                        />

                        <QuickActions
                            onActionPress={(route) => router.push(route)}
                            onBatchPress={() => setMenuVisible(true)}
                        />

                        <PremiumSection
                            isPremium={isPremium}
                            onItemPress={(route) => router.push(route)}
                            onUpgradePress={() => setUpgradeModalVisible(true)}
                        />

                        <MyBatchesSection
                            enrolledBatches={enrolledBatches}
                            groupedBatches={groupedBatches}
                            availableMonths={availableMonths}
                            selectedMonth={selectedMonth}
                            onMonthSelect={setSelectedMonth}
                            onBatchPress={async (batchId) => {
                                await useBatchStore.getState().setActiveBatchId(batchId);
                                setMenuVisible(true);
                            }}
                            onSeeAllPress={() => router.push('/(tabs)/Batch')}
                        />
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

export default HomeScreen;