import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    RefreshControl, StatusBar, Dimensions, ActivityIndicator,
    Alert, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBatchStore } from '../../src/stores/batchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import PremiumMenu from '../../src/components/PremiumMenu';
import styles from '../styles/liveClassesStyle';

const { width } = Dimensions.get('window');

const LiveClassesScreen = () => {
    const { user } = useAuthStore();
    const {
        activeBatchId, enrollments, schedules, isLoading,
        getBatchSchedules, getMeetingLink
    } = useBatchStore();

    const [menuVisible, setMenuVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const batchId = activeBatchId || enrollments.find(e => e.status === 'ENROLLED')?.batch?.id;

    useEffect(() => {
        if (batchId) {
            fetchSchedules();
        }
    }, [batchId]);

    const fetchSchedules = useCallback(async () => {
        if (batchId) {
            await getBatchSchedules(batchId);
        }
    }, [batchId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSchedules();
        setRefreshing(false);
    }, [fetchSchedules]);

    const handleJoinClass = async (scheduleId) => {
        if (!scheduleId) return;
        const res = await getMeetingLink(scheduleId);
        if (res.success && res.data?.meetingLink) {
            Linking.openURL(res.data.meetingLink);
        } else {
            console.log("Join Class Error:", res.error);
            if (res.error?.includes('not paid') || res.error?.includes('payment')) {
                Alert.alert(
                    "Payment Required",
                    "Your enrollment is not fully active. Please complete your payment to join live classes.",
                    [
                        { text: "Later", style: "cancel" },
                        {
                            text: "Complete Payment",
                            onPress: () => {
                                // Find the enrollment for this batch to get ID
                                const enrollment = enrollments.find(e => e.batch?.id === batchId);
                                if (enrollment) router.push(`/payment/${enrollment.id}`);
                                else Alert.alert("Error", "Could not find your enrollment details.");
                            }
                        }
                    ]
                );
            } else {
                Alert.alert("Class Not Started", res.error || "The live session has not started yet or the link is unavailable.");
            }
        }
    };

    const renderSchedule = ({ item }) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        // Fix for dayOfWeek if it's a string from backend
        const dayIdx = parseInt(item.schedule?.dayOfWeek);
        const dayName = isNaN(dayIdx) ? item.schedule?.dayOfWeek : (days[dayIdx] || 'Scheduled');

        return (
            <View style={styles.scheduleCard}>
                <View style={[styles.statusIndicator, { backgroundColor: COLORS.primary }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.classTitle}>Live Session</Text>
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>Upcoming</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.infoText}>{dayName}</Text>
                        <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.4)" style={{ marginLeft: 15 }} />
                        <Text style={styles.infoText}>{item.schedule?.startTime} - {item.schedule?.endTime}</Text>
                    </View>

                    <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoinClass(item.id)}>
                        <LinearGradient
                            colors={[COLORS.primary, '#059669']}
                            style={styles.joinGradient}
                        >
                            <Text style={styles.joinBtnText}>Join Class</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
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
}

export default LiveClassesScreen;
