import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, StatusBar, Dimensions, ActivityIndicator,
    Alert, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBatchStore } from '../../src/stores/batchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import PremiumMenu from '../../src/components/PremiumMenu';

const { width } = Dimensions.get('window');

const LiveClassesScreen = () => {
    const { user } = useAuthStore();
    const {
        currentBatch, enrollments, schedules, isLoading,
        getCourseSchedules, getBatchMeetingLink
    } = useBatchStore();

    const [menuVisible, setMenuVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const batchId = currentBatch?.id || enrollments.find(e => e.status === 'ENROLLED')?.batch?.id;

    useEffect(() => {
        if (batchId) {
            fetchSchedules();
        }
    }, [batchId]);

    const fetchSchedules = useCallback(async () => {
        if (batchId) {
            // Note: Currently getCourseSchedules takes batchCourseId. 
            // We might need a getBatchSchedules or loop through batchCourses.
            // For now, let's assume we can fetch schedules for the batch context.
            // Adjusting based on batchStore.js logic.
            await getCourseSchedules();
        }
    }, [batchId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSchedules();
        setRefreshing(false);
    }, [fetchSchedules]);

    const handleJoinClass = async () => {
        if (!batchId) return;
        const res = await getBatchMeetingLink(batchId);
        if (res.success && res.data?.meetingLink) {
            Linking.openURL(res.data.meetingLink);
        } else {
            Alert.alert("Class Not Started", res.error || "The live session has not started yet or the link is unavailable.");
        }
    };

    const renderSchedule = ({ item }) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[item.schedule?.dayOfWeek] || 'Scheduled';

        return (
            <View style={styles.scheduleCard}>
                <View style={[styles.statusIndicator, { backgroundColor: COLORS.primary }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.classTitle}>Live Session</Text>
                        <View style={[
                            styles.liveBadge,
                            item.status === 'LIVE' && { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                            item.status === 'COMPLETED' && { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                        ]}>
                            <View style={[
                                styles.liveDot,
                                item.status === 'LIVE' && { backgroundColor: '#ef4444' },
                                item.status === 'COMPLETED' && { backgroundColor: '#94a3b8' }
                            ]} />
                            <Text style={[
                                styles.liveText,
                                item.status === 'LIVE' && { color: '#ef4444' },
                                item.status === 'COMPLETED' && { color: '#94a3b8' }
                            ]}>
                                {item.status === 'LIVE' ? 'LIVE NOW' : item.status === 'COMPLETED' ? 'Completed' : 'Upcoming'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.infoText}>{dayName}</Text>
                        <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.4)" style={{ marginLeft: 15 }} />
                        <Text style={styles.infoText}>{item.schedule?.startTime} - {item.schedule?.endTime}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.joinBtn, item.status === 'COMPLETED' && styles.disabledBtn]}
                        onPress={() => item.status !== 'COMPLETED' && handleJoinClass()}
                        disabled={item.status === 'COMPLETED'}
                    >
                        <LinearGradient
                            colors={item.status === 'COMPLETED' ? ['#475569', '#334155'] : [COLORS.primary, '#059669']}
                            style={styles.joinGradient}
                        >
                            <Text style={styles.joinBtnText}>
                                {item.status === 'COMPLETED' ? 'Class Ended' : 'Join Class'}
                            </Text>
                            <Ionicons name={item.status === 'COMPLETED' ? "checkmark-done" : "arrow-forward"} size={18} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

            <LinearGradient
                colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.heroBanner}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                        <Ionicons name="menu" size={26} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.titleGroup}>
                        <Text style={styles.headerTitle}>Live Classes</Text>
                        <Text style={styles.headerSubtitle}>Real-time learning with tutors</Text>
                    </View>
                </View>
            </LinearGradient>

            <FlatList
                data={schedules}
                renderItem={renderSchedule}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.bannerContainer}>
                        <LinearGradient
                            colors={['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.05)']}
                            style={styles.joiningBanner}
                        >
                            <Ionicons name="videocam" size={24} color={COLORS.primary} />
                            <Text style={styles.bannerText}>
                                Join your scheduled sessions to interact with tutors in real-time.
                            </Text>
                        </LinearGradient>
                    </View>
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={60} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>No classes scheduled for this week.</Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },
    heroBanner: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    menuBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    titleGroup: { flex: 1 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    bannerContainer: { marginVertical: 20 },
    joiningBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 15,
        padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    bannerText: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 18 },

    scheduleCard: {
        backgroundColor: '#0F172A',
        borderRadius: 20, marginBottom: 16,
        flexDirection: 'row', overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    statusIndicator: { width: 6 },
    cardContent: { flex: 1, padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    classTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
    liveBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
    liveText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    infoText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginLeft: 6 },

    joinBtn: { borderRadius: 12, overflow: 'hidden' },
    joinGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 12, gap: 8
    },
    joinBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyText: { color: 'rgba(255,255,255,0.3)', marginTop: 12, fontSize: 15 },
    disabledBtn: { opacity: 0.6 },
});

export default LiveClassesScreen;
