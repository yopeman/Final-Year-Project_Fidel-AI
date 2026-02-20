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
    const { user, isPremium: hasPremiumSub } = useAuthStore();
    const [menuVisible, setMenuVisible] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const { progress, getCurrentPosition, getModules, getProgress, isLoading } = useLearningStore();
    const { unreadCount, getNotifications } = useNotificationStore();
    const { batches, enrollments, getBatches, isLoading: batchLoading, premiumUnlocked } = useBatchStore();

    const isPremium = hasPremiumSub || premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');
    const currentPosition = getCurrentPosition();
    const overallProgress = progress?.completionPercentage || 0;

    useEffect(() => {
        getModules(); getProgress(); getBatches(); getNotifications();
    }, []);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: overallProgress / 100,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [overallProgress]);

    const onRefresh = React.useCallback(() => {
        getModules(); getProgress(); getBatches();
    }, []);

    const myBatches = batches.filter(b =>
        enrollments.some(e => e.batch?.id === b.id && e.status === 'ENROLLED') || b.status === 'ENROLLED_MOCK'
    );

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

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
                                    <Ionicons name="menu" size={26} color="#fff" />
                                </TouchableOpacity>
                            )}
                            <View>
                                <Text style={styles.greeting}>
                                    <Text style={styles.greetingText}>Good {getTimeOfDay()},</Text>
                                </Text>
                                <Text style={styles.greeting}>
                                    <Text style={styles.greetingText}>{user?.firstName || 'Learner'}</Text>
                                </Text>

                                <Text style={styles.subGreeting}>Keep up the great work!</Text>
                            </View>
                        </View>
                        <View style={styles.topBarRight}>
                            <TouchableOpacity
                                style={styles.notifBtn}
                                onPress={() => router.push('/notifications')}
                            >
                                <Ionicons name="notifications-outline" size={22} color="#fff" />
                                {unreadCount > 0 && <View style={styles.notifDot} />}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/Profile')}>
                                <LinearGradient
                                    colors={[COLORS.primary, '#059669']}
                                    style={styles.avatarRing}
                                >
                                    <View style={styles.avatarInner}>
                                        <Text style={styles.avatarText}>{user?.firstName?.[0]?.toUpperCase() || 'U'}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Progress hero */}
                    <View style={styles.heroProgressCard}>
                        <View style={styles.heroProgressLeft}>
                            <Text style={styles.heroProgressLabel}>Overall Progress</Text>
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

                    {/* Animated bar */}
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
                                    <Text style={styles.upNextModule}>{currentPosition?.moduleTitle || 'Foundation'}</Text>
                                    <Text style={styles.upNextLesson} numberOfLines={1}>
                                        {currentPosition?.lessonTitle || 'Ready to start!'}
                                    </Text>
                                </View>
                                <View style={styles.upNextChevron}>
                                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
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
                                        <Ionicons name={a.icon} size={26} color={a.color} />
                                    </View>
                                    <Text style={styles.actionLabel}>{a.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── Premium Features ── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Premium</Text>
                            {isPremium
                                ? <View style={styles.activePill}><Text style={styles.activePillText}>✦ ACTIVE</Text></View>
                                : <View style={styles.lockedPill}><Text style={styles.lockedPillText}>🔒 LOCKED</Text></View>
                            }
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
                                        <Ionicons name={item.icon} size={26} color={isPremium ? item.color : '#4B5563'} />
                                    </View>
                                    <Text style={[styles.premiumTileLabel, !isPremium && { color: '#4B5563' }]}>
                                        {item.title}
                                    </Text>
                                    {!isPremium && (
                                        <View style={styles.lockOverlay}>
                                            <Ionicons name="lock-closed" size={11} color="#6B7280" />
                                        </View>
                                    )}
                                    {isPremium && <View style={[styles.activeDot, { backgroundColor: item.color }]} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── My Batches ── */}
                    {myBatches.length > 0 && (
                        <View style={[styles.section, { marginBottom: 40 }]}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionTitle}>My Batches</Text>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/Batch')}>
                                    <Text style={styles.seeAll}>See All</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.batchScroll}>
                                {myBatches.map((batch, index) => (
                                    <TouchableOpacity
                                        key={batch.id || index}
                                        style={styles.batchCard}
                                        onPress={() => router.push(`batch/${batch.id}`)}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.05)']}
                                            style={styles.batchGradient}
                                        >
                                            <View style={styles.batchIconWrap}>
                                                <Ionicons name="school" size={22} color="#F59E0B" />
                                            </View>
                                            <Text style={styles.batchName} numberOfLines={2}>{batch.name}</Text>
                                            <View style={styles.batchLevelPill}>
                                                <Text style={styles.batchLevelText}>{batch.level || 'N/A'}</Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
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

function CircleProgress({ value }) {
    const size = 72;
    const strokeWidth = 5;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                {/* Background ring */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Circle arc */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={COLORS.primary}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                />
            </Svg>
            <View style={{ position: 'absolute' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{Math.round(value)}%</Text>
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
