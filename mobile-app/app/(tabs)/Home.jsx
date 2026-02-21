import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    RefreshControl, StatusBar, Animated, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useLearningStore } from '../../src/stores/learningStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { useNotificationStore } from '../../src/stores/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import PremiumMenu from '../../src/components/PremiumMenu';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
    { label: 'AI Tutor', icon: 'chatbubbles', color: '#6366F1', bg: 'rgba(99,102,241,0.15)', route: '/(tabs)/AIConversation' },
    { label: 'Library', icon: 'library', color: '#10B981', bg: 'rgba(16,185,129,0.15)', route: '/(tabs)/Modules' },
    { label: 'Batches', icon: 'people', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', route: '/(tabs)/Batch' },
    { label: 'Profile', icon: 'person-circle', color: '#EC4899', bg: 'rgba(236,72,153,0.15)', route: '/(tabs)/Profile' },
];

const PREMIUM_ITEMS = [
    { title: 'Live Classes', icon: 'videocam', color: '#3B82F6', route: '/(tabs)/Batch' },
    { title: 'Resources', icon: 'book', color: '#F59E0B', route: '/(tabs)/Resources' },
    { title: 'Community', icon: 'chatbubbles', color: '#10B981', route: '/(tabs)/Community' },
];

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [menuVisible, setMenuVisible] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const progressAnim = useRef(new Animated.Value(0)).current;

    const { progress, getCurrentPosition, getModules, getProgress, isLoading } = useLearningStore();
    const { unreadCount, getNotifications } = useNotificationStore();
    const {
        batches,
        enrollments,
        getBatches,
        isLoading: batchLoading,
        premiumUnlocked,
        initializeStore,
        syncWithProfile
    } = useBatchStore();

    // Initialize store with persisted data
    useEffect(() => {
        const init = async () => {
            try {
                await initializeStore();
                if (user?.profile) {
                    await syncWithProfile(user.profile);
                }
                setIsInitialized(true);
                console.log('[Home] Store initialized, premium status:', premiumUnlocked);
            } catch (error) {
                console.error('[Home] Initialization error:', error);
                setIsInitialized(true);
            }
        };

        init();
    }, []);

    // Re-sync when user changes
    useEffect(() => {
        const syncUserData = async () => {
            if (user?.profile && isInitialized) {
                await syncWithProfile(user.profile);
            }
        };

        syncUserData();
    }, [user?.id, user?.profile, isInitialized]);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await Promise.all([
            getModules(),
            getProgress(),
            getBatches(),
            getNotifications()
        ]);
    };

    const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED' || e.status === 'COMPLETED');
    const currentPosition = getCurrentPosition();
    const overallProgress = progress?.completionPercentage || 0;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: overallProgress / 100,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [overallProgress]);

    const onRefresh = React.useCallback(async () => {
        await fetchData();
        if (user?.profile) {
            await syncWithProfile(user.profile);
        }
    }, [user?.profile]);

    // Get enrolled batches with full details
    const enrolledBatches = React.useMemo(() => {
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

    // Group batches by month
    const groupedBatches = React.useMemo(() => {
        const groups = {};

        enrolledBatches.forEach(enrollment => {
            if (!enrollment.batch?.startDate) return;

            const date = new Date(enrollment.batch.startDate);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }

            groups[monthYear].push({
                ...enrollment.batch,
                enrollmentId: enrollment.id,
                enrollmentDate: enrollment.enrollmentDate,
            });
        });

        return groups;
    }, [enrolledBatches]);

    // Get unique months for filter
    const availableMonths = React.useMemo(() => {
        const months = new Set();
        Object.keys(groupedBatches).forEach(month => {
            const shortMonth = month.split(' ')[0].toLowerCase();
            months.add(shortMonth);
        });
        return Array.from(months);
    }, [groupedBatches]);

    // Filter batches by month
    const filteredMonths = React.useMemo(() => {
        if (selectedMonth === 'all') {
            return Object.entries(groupedBatches);
        }

        return Object.entries(groupedBatches).filter(([month]) =>
            month.toLowerCase().includes(selectedMonth.toLowerCase())
        );
    }, [groupedBatches, selectedMonth]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    if (!isInitialized) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LinearGradient
                    colors={['#0A2540', '#0D1B2A', '#080C14']}
                    style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}
                >
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 60, height: 60, marginBottom: 16 }}>
                            <CircleProgress value={0} loading={true} />
                        </View>
                        <Text style={{ color: '#fff', fontSize: 16, opacity: 0.8 }}>Loading your profile...</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>
                            Please wait while we set up your experience
                        </Text>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading || batchLoading}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {/* ── Hero Banner ── */}
                <LinearGradient
                    colors={['#0A2540', '#0D1B2A', '#080C14']}
                    style={styles.heroBanner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Decorative glow blob */}
                    <View style={styles.glowBlob} />

                    {/* Top bar */}
                    <View style={styles.topBar}>
                        <View style={styles.topBarLeft}>
                            {isPremium && (
                                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                                    <Ionicons name="menu" size={20} color="#fff" />
                                </TouchableOpacity>
                            )}
                            <View>
                                <Text style={styles.greeting}>
                                    Good {getTimeOfDay()},
                                </Text>
                                <Text style={styles.userName}>
                                    {user?.firstName || 'Learner'}
                                </Text>
                                <Text style={styles.subGreeting}>Keep up the great work!</Text>
                            </View>
                        </View>
                        <View style={styles.topBarRight}>
                            <TouchableOpacity
                                style={styles.notifBtn}
                                onPress={() => router.push('/notifications')}
                            >
                                <Ionicons name="notifications-outline" size={20} color="#fff" />
                                {unreadCount > 0 && <View style={styles.notifDot} />}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/Profile')}>
                                <LinearGradient
                                    colors={[COLORS.primary, '#059669']}
                                    style={styles.avatarRing}
                                >
                                    <View style={styles.avatarInner}>
                                        <Text style={styles.avatarText}>
                                            {user?.firstName?.[0]?.toUpperCase() || 'U'}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Progress hero card */}
                    <View style={styles.heroProgressCard}>
                        <View style={styles.heroProgressLeft}>
                            <Text style={styles.heroProgressLabel}>OVERALL PROGRESS</Text>
                            <Text style={styles.heroProgressValue}>{Math.round(overallProgress)}%</Text>
                            <View style={styles.heroStatRow}>
                                <Ionicons name="flame" size={14} color="#F59E0B" />
                                <Text style={styles.heroStatText}>{progress?.streakDays || 0} day streak</Text>
                                <View style={styles.dotSep} />
                                <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                                <Text style={styles.heroStatText}>{progress?.completedLessons || 0} lessons</Text>
                            </View>
                        </View>
                        <View style={styles.circleProgressWrapper}>
                            <CircleProgress value={overallProgress} />
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.heroBarBg}>
                        <Animated.View style={[styles.heroBarFill, { width: progressWidth }]} />
                    </View>
                </LinearGradient>

                <View style={styles.body}>
                    {/* ── Up Next ── */}
                    <View style={styles.upNextSection}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Up Next</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/Modules')}>
                                <Text style={styles.seeAll}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => {
                                if (currentPosition?.lessonId) {
                                    router.push(`/learn/${currentPosition.lessonId}`);
                                } else {
                                    router.push('/(tabs)/Modules');
                                }
                            }}
                        >
                            <LinearGradient
                                colors={['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.06)']}
                                style={styles.upNextCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.upNextIconWrapper}>
                                    <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.upNextIcon}>
                                        <Ionicons name="play" size={22} color="#fff" />
                                    </LinearGradient>
                                </View>
                                <View style={styles.upNextInfo}>
                                    <Text style={styles.upNextModule}>NEXT LESSON</Text>
                                    <Text style={styles.upNextLesson} numberOfLines={1}>
                                        {currentPosition?.lessonTitle || 'Ready to start!'}
                                    </Text>
                                </View>
                                <View style={styles.upNextChevron}>
                                    <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* ── Quick Actions ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.actionsGrid}>
                            {QUICK_ACTIONS.map((a) => (
                                <TouchableOpacity
                                    key={a.label}
                                    style={[styles.actionTile, { backgroundColor: a.bg }]}
                                    onPress={() => router.push(a.route)}
                                    activeOpacity={0.75}
                                >
                                    <View style={[styles.actionIconCircle, { backgroundColor: a.color + '25' }]}>
                                        <Ionicons name={a.icon} size={24} color={a.color} />
                                    </View>
                                    <Text style={styles.actionLabel}>{a.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── Premium Section ── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Premium</Text>
                            {isPremium ? (
                                <View style={styles.activePill}>
                                    <Text style={styles.activePillText}>✦ ACTIVE</Text>
                                </View>
                            ) : (
                                <View style={styles.lockedPill}>
                                    <Text style={styles.lockedPillText}>🔒 LOCKED</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.premiumRow}>
                            {PREMIUM_ITEMS.map((item, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.premiumTile, !isPremium && styles.premiumTileLocked]}
                                    onPress={() => isPremium && router.push(item.route)}
                                    activeOpacity={isPremium ? 0.75 : 1}
                                >
                                    <View style={[styles.premiumTileIcon, { backgroundColor: item.color + '22' }]}>
                                        <Ionicons name={item.icon} size={24} color={isPremium ? item.color : '#4B5563'} />
                                    </View>
                                    <Text style={[styles.premiumTileLabel, !isPremium && { color: '#6B7280' }]}>
                                        {item.title}
                                    </Text>
                                    {!isPremium && (
                                        <View style={styles.lockOverlay}>
                                            <Ionicons name="lock-closed" size={12} color="#6B7280" />
                                        </View>
                                    )}
                                    {isPremium && <View style={[styles.activeDot, { backgroundColor: item.color }]} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── My Batches ── */}
                    {enrolledBatches.length > 0 && (
                        <View style={[styles.section, { marginBottom: 40 }]}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionTitle}>My Batches ({enrolledBatches.length})</Text>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/Batch')}>
                                    <Text style={styles.seeAll}>See All</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Month Filter */}
                            {availableMonths.length > 1 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{ marginBottom: 16 }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.batchLevelPill,
                                            { marginRight: 8 },
                                            selectedMonth === 'all' && { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary }
                                        ]}
                                        onPress={() => setSelectedMonth('all')}
                                    >
                                        <Text style={[
                                            styles.batchLevelText,
                                            selectedMonth === 'all' && { color: COLORS.primary }
                                        ]}>
                                            All
                                        </Text>
                                    </TouchableOpacity>

                                    {availableMonths.map((month) => (
                                        <TouchableOpacity
                                            key={month}
                                            style={[
                                                styles.batchLevelPill,
                                                { marginRight: 8 },
                                                selectedMonth === month && { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary }
                                            ]}
                                            onPress={() => setSelectedMonth(month)}
                                        >
                                            <Text style={[
                                                styles.batchLevelText,
                                                selectedMonth === month && { color: COLORS.primary }
                                            ]}>
                                                {month.charAt(0).toUpperCase() + month.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}

                            {/* Batches Horizontal Scroll */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.batchScroll}
                            >
                                {filteredMonths.length > 0 ? (
                                    filteredMonths.map(([monthYear, monthBatches]) => (
                                        monthBatches.map((batch) => (
                                            <TouchableOpacity
                                                key={batch.id}
                                                style={styles.batchCard}
                                                onPress={() => router.push(`/batch/${batch.id}`)}
                                                activeOpacity={0.8}
                                            >
                                                <LinearGradient
                                                    colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.05)']}
                                                    style={styles.batchGradient}
                                                >
                                                    <View style={styles.batchIconWrap}>
                                                        <Ionicons name="school" size={20} color="#F59E0B" />
                                                    </View>
                                                    <Text style={styles.batchName} numberOfLines={2}>
                                                        {batch.name}
                                                    </Text>
                                                    <View style={styles.batchLevelPill}>
                                                        <Text style={styles.batchLevelText}>
                                                            {batch.level || 'BEGINNER'}
                                                        </Text>
                                                    </View>
                                                    <Text style={[styles.heroStatText, { marginTop: 8, fontSize: 10 }]}>
                                                        {new Date(batch.startDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        ))
                                    ))
                                ) : (
                                    <View style={{ paddingVertical: 20, alignItems: 'center', width: width - 40 }}>
                                        <Text style={styles.heroStatText}>No batches for this month</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    )}

                    {/* ── No Batches State ── */}
                    {enrolledBatches.length === 0 && (
                        <View style={[styles.section, { marginBottom: 40, alignItems: 'center' }]}>
                            <View style={[styles.batchCard, { width: '100%', marginRight: 0 }]}>
                                <LinearGradient
                                    colors={['rgba(245,158,11,0.1)', 'rgba(245,158,11,0.02)']}
                                    style={[styles.batchGradient, { alignItems: 'center', padding: 24 }]}
                                >
                                    <Ionicons name="school-outline" size={48} color="#F59E0B" style={{ marginBottom: 12 }} />
                                    <Text style={[styles.batchName, { textAlign: 'center' }]}>No Batches Yet</Text>
                                    <Text style={[styles.heroStatText, { textAlign: 'center', marginBottom: 16 }]}>
                                        Join a batch to start learning with live classes
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.batchLevelPill, { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary }]}
                                        onPress={() => router.push('/(tabs)/Batch')}
                                    >
                                        <Text style={[styles.batchLevelText, { color: COLORS.primary }]}>
                                            Browse Batches →
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

/* ── Helpers ── */
function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
}

function CircleProgress({ value, loading = false }) {
    const size = 56;
    const strokeWidth = 4;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!loading) {
            Animated.timing(animatedValue, {
                toValue: value,
                duration: 1000,
                useNativeDriver: false,
            }).start();
        }
    }, [value, loading]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    if (loading) {
        return (
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <AnimatedCircle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={COLORS.primary}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * 0.7}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </Svg>
                <View style={{ position: 'absolute' }}>
                    <Ionicons name="sync" size={16} color={COLORS.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={COLORS.primary}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                />
            </Svg>
            <View style={{ position: 'absolute' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{Math.round(value)}%</Text>
            </View>
        </View>
    );
}

/* ── Styles ── */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },
    scrollView: { flex: 1 },

    // Hero
    heroBanner: {
        paddingTop: 18,
        paddingHorizontal: 20,
        paddingBottom: 28,
        overflow: 'hidden',
    },
    glowBlob: {
        position: 'absolute', top: -40, right: -40,
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(16,185,129,0.12)',
    },
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 28,
    },
    topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    menuBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    greeting: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
    userName: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
    subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    notifBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    notifDot: {
        position: 'absolute', top: 8, right: 8,
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#080C14',
    },
    avatarRing: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center', padding: 2,
    },
    avatarInner: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: '#111827',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },

    // Hero progress card
    heroProgressCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20, padding: 18, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    heroProgressLeft: { flex: 1 },
    heroProgressLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
    heroProgressValue: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
    heroStatRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    heroStatText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    dotSep: {
        width: 3, height: 3, borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4,
    },
    circleProgressWrapper: { marginLeft: 16 },

    // Hero bar
    heroBarBg: {
        height: 6, backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 3, overflow: 'hidden',
    },
    heroBarFill: {
        height: '100%', borderRadius: 3,
        backgroundColor: COLORS.primary,
    },

    // Body
    body: { paddingHorizontal: 20, paddingTop: 24 },
    section: { marginBottom: 28 },
    sectionHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

    // Up Next
    upNextSection: { marginBottom: 28 },
    upNextCard: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 18, padding: 16,
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    upNextIconWrapper: { marginRight: 14 },
    upNextIcon: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    upNextInfo: { flex: 1 },
    upNextModule: {
        fontSize: 11, fontWeight: '700', color: COLORS.primary,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
    },
    upNextLesson: { fontSize: 16, fontWeight: '600', color: '#fff' },
    upNextChevron: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: 'rgba(16,185,129,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },

    // Quick Actions
    actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    actionTile: {
        flex: 1, borderRadius: 18, padding: 14, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    actionIconCircle: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    actionLabel: { color: '#D1D5DB', fontSize: 12, fontWeight: '600', textAlign: 'center' },

    // Premium
    premiumRow: { flexDirection: 'row', gap: 10 },
    premiumTile: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 18, padding: 14, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        position: 'relative',
    },
    premiumTileLocked: { opacity: 0.6 },
    premiumTileIcon: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    premiumTileLabel: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },
    lockOverlay: {
        position: 'absolute', top: 8, right: 8,
        backgroundColor: 'rgba(255,255,255,0.06)',
        width: 20, height: 20, borderRadius: 6,
        alignItems: 'center', justifyContent: 'center',
    },
    activeDot: {
        position: 'absolute', top: 10, right: 10,
        width: 6, height: 6, borderRadius: 3,
    },
    activePill: {
        backgroundColor: 'rgba(16,185,129,0.15)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    },
    activePillText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
    lockedPill: {
        backgroundColor: 'rgba(107,114,128,0.15)',
        borderWidth: 1, borderColor: 'rgba(107,114,128,0.3)',
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    },
    lockedPillText: { color: '#6B7280', fontSize: 11, fontWeight: '700' },

    // Batches
    batchScroll: { marginHorizontal: -20, paddingLeft: 20 },
    batchCard: {
        width: 148, marginRight: 12,
        borderRadius: 18, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
    },
    batchGradient: { padding: 16 },
    batchIconWrap: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(245,158,11,0.15)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    batchName: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 10 },
    batchLevelPill: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(245,158,11,0.1)',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    },
    batchLevelText: { color: '#F59E0B', fontSize: 11, fontWeight: '700' },
});