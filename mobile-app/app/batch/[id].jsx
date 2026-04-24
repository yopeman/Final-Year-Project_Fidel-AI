import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
    Alert, Linking, Platform, AppState, Modal, SafeAreaView, Animated, Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { useBatchStore } from '../../src/stores/batchStore';
import { useLearningStore } from '../../src/stores/learningStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles, { stat, tabBar } from '../styles/batchDetailStyle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
    if (url.includes('watch?v=')) return `https://www.youtube.com/embed/${url.split('watch?v=')[1].split('&')[0]}`;
    if (url.includes('youtube.com/embed/')) return url;
    return url;
};

const STATUS_COLORS = { ACTIVE: '#10B981', UPCOMING: '#3B82F6', COMPLETED: '#6B7280', DEFAULT: '#9CA3AF' };
const LEVEL_ICONS = { Beginner: 'leaf-outline', Intermediate: 'trending-up-outline', Advanced: 'rocket-outline' };

// ─────────────────────────────────────────────
// Stat Pill
// ─────────────────────────────────────────────
function StatPill({ icon, label, color = '#9CA3AF' }) {
    return (
        <View style={stat.pill}>
            <Ionicons name={icon} size={14} color={color} />
            <Text style={[stat.label, { color }]}>{label}</Text>
        </View>
    );
}

// ─────────────────────────────────────────────
// Animated Tab Bar
// ─────────────────────────────────────────────
const TABS = [
    { id: 'overview', icon: 'grid-outline', label: 'Overview' },
    { id: 'schedules', icon: 'calendar-outline', label: 'Schedule' },
    { id: 'resources', icon: 'play-circle-outline', label: 'Resources' },
    { id: 'community', icon: 'people-outline', label: 'Community' },
];

function TabBar({ activeTab, isFullyEnrolled, onTabPress }) {
    return (
        <View style={tabBar.container}>
            {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                const isLocked = tab.id !== 'overview' && !isFullyEnrolled;
                return (
                    <TouchableOpacity
                        key={tab.id}
                        style={[tabBar.item, isActive && tabBar.itemActive]}
                        onPress={() => onTabPress(tab.id)}
                        activeOpacity={0.75}
                    >
                        {isActive && (
                            <LinearGradient colors={['#F59E0B', '#F97316']} style={StyleSheet.absoluteFillObject} borderRadius={12} />
                        )}
                        <Ionicons
                            name={tab.icon}
                            size={18}
                            color={isActive ? '#1A1A2E' : isLocked ? '#374151' : '#9CA3AF'}
                        />
                        <Text style={[tabBar.label, isActive && tabBar.labelActive, isLocked && tabBar.labelLocked]}>
                            {tab.label}
                        </Text>
                        {isLocked && (
                            <Ionicons name="lock-closed" size={9} color="#4B5563" style={tabBar.lock} />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ─────────────────────────────────────────────
// Progress Ring (SVG-free, CSS-style)
// ─────────────────────────────────────────────
function ProgressRing({ pct }) {
    const size = 72;
    const strokeW = 6;
    const radius = (size - strokeW) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - pct / 100);

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Background track */}
            <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: strokeW, borderColor: '#1E2D44' }} />
            {/* Simulated fill using rotation */}
            <View style={{
                position: 'absolute', width: size, height: size,
                borderRadius: size / 2, borderWidth: strokeW,
                borderColor: 'transparent',
                borderTopColor: '#F59E0B',
                borderRightColor: pct > 25 ? '#F59E0B' : 'transparent',
                borderBottomColor: pct > 50 ? '#F59E0B' : 'transparent',
                borderLeftColor: pct > 75 ? '#F59E0B' : 'transparent',
                transform: [{ rotate: '-90deg' }],
            }} />
            <Text style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 16 }}>{pct}%</Text>
        </View>
    );
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export default function BatchDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const {
        currentBatch, getBatchById, enrollInBatch, getBatchSchedules,
        schedules, getMeetingLink, isLoading, checkEnrollmentStatus,
        initiatePayment, checkPaymentStatus,
        premiumUnlocked, enrollmentStatusGlobal,
        generatedVideos, generateAiVideos,
    } = useBatchStore();

    const [enrolling, setEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [joining, setJoining] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [myEnrollmentId, setMyEnrollmentId] = useState(null);
    const appState = useRef(AppState.currentState);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [generating, setGenerating] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { modules, progress, getModules, getProgress } = useLearningStore();
    const completionPct = Math.round(progress?.completionPercentage || 0);
    const completedLessons = progress?.completedLessons || 0;
    const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);

    // React to global premium unlock
    useEffect(() => {
        if (premiumUnlocked && enrollmentStatusGlobal === 'ENROLLED') {
            setEnrollmentStatus('ENROLLED');
            getModules();
            getProgress();
        }
    }, [premiumUnlocked, enrollmentStatusGlobal]);

    // Tab fade
    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }, [activeTab]);

    useEffect(() => { if (id) getBatchById(id); }, [id]);

    useFocusEffect(useCallback(() => { if (id) checkAccess(); }, [id]));

    useEffect(() => {
        const sub = AppState.addEventListener('change', next => {
            if (appState.current.match(/inactive|background/) && next === 'active') {
                if (enrollmentStatus === 'PENDING' && myEnrollmentId) checkAccess();
            }
            appState.current = next;
        });
        return () => sub.remove();
    }, [enrollmentStatus, myEnrollmentId]);

    useEffect(() => {
        const sub = Linking.addEventListener('url', () => {
            if (enrollmentStatus === 'PENDING' && myEnrollmentId) checkAccess();
        });
        return () => sub.remove();
    }, [enrollmentStatus, myEnrollmentId]);

    const checkAccess = async () => {
        // Optimistic check: if global store says we're enrolled, trust it (handling dev skip / API delay)
        if (enrollmentStatusGlobal === 'ENROLLED') {
            if (enrollmentStatus !== 'ENROLLED') {
                setEnrollmentStatus('ENROLLED');
                if (!myEnrollmentId) setMyEnrollmentId('premium-access');
                Alert.alert('🎉 Access Unlocked', 'You now have full premium access to this batch!');
                getModules();
                getProgress();
            }
            return;
        }

        const result = await checkEnrollmentStatus(id);
        if (result.isEnrolled) {
            const wasNotEnrolled = enrollmentStatus !== 'ENROLLED';
            setEnrollmentStatus(result.status);
            setMyEnrollmentId(result.enrollmentId);
            if (result.status === 'ENROLLED' && wasNotEnrolled) {
                Alert.alert('🎉 Access Unlocked', 'You now have full premium access to this batch!');
                getModules(); getProgress();
            }
        } else {
            if (enrollmentStatus !== 'PENDING') { setEnrollmentStatus(null); setMyEnrollmentId(null); }
        }
    };

    useEffect(() => {
        if (id && activeTab === 'schedules') {
            getBatchSchedules(id);
        }
    }, [id, activeTab]);

    useEffect(() => {
        const isEnrolled = enrollmentStatus === 'ENROLLED' || enrollmentStatus === 'COMPLETED';
        if (isEnrolled) { getModules(); getProgress(); }
    }, [enrollmentStatus]);

    const isFullyEnrolled = enrollmentStatus === 'ENROLLED' || enrollmentStatus === 'COMPLETED';

    const handleTabChange = (tab) => {
        if (tab === 'overview') { setActiveTab(tab); return; }
        if (!isFullyEnrolled) {
            Alert.alert(
                '🔒 Premium Access Required',
                enrollmentStatus === 'PENDING' ? 'Complete your payment to unlock this section.' : 'Enroll and pay to access premium content.',
                enrollmentStatus === 'PENDING' && myEnrollmentId
                    ? [{ text: '💳 Pay Now', onPress: () => handlePayment(myEnrollmentId) }, { text: 'Cancel', style: 'cancel' }]
                    : [{ text: 'Enroll Now', onPress: handleEnroll }, { text: 'Cancel', style: 'cancel' }]
            );
            return;
        }
        if (tab === 'community') { router.push(`/community/${id}`); return; }
        setActiveTab(tab);
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        const result = await enrollInBatch(id, null);
        setEnrolling(false);

        if (result.success) {
            setMyEnrollmentId(result.enrollment.id);
            setEnrollmentStatus('PENDING');
            Alert.alert('✅ Enrolled!', 'Proceed to payment to unlock full access.', [
                { text: '💳 Pay Now', onPress: () => handlePayment(result.enrollment.id) },
                { text: 'Later' }
            ]);
        } else if (result.isDuplicate) {
            // Already enrolled case
            setMyEnrollmentId(result.enrollmentId);
            setEnrollmentStatus(result.status || 'PENDING');

            if (result.status === 'ENROLLED') {
                Alert.alert('Already Enrolled', 'You already have full access to this batch.');
            } else {
                Alert.alert('Already Enrolled', 'You are already enrolled. Proceed to payment to unlock full access?', [
                    { text: '💳 Pay Now', onPress: () => handlePayment(result.enrollmentId) },
                    { text: 'Later' }
                ]);
            }
        } else {
            Alert.alert('Enrollment Failed', result.error || 'Please try again.');
        }
    };

    const handlePayment = async (enrollmentId) => {
        setEnrolling(true);
        try {
            // Step 1 & 2: Proactively initiate and redirect
            const result = await initiatePayment(enrollmentId);
            if (result.success && result.payment?.checkoutUrl) {
                // Open Chapa immediately
                await Linking.openURL(result.payment.checkoutUrl);
                // Step 3: Navigate to payment screen for return handling (verify/show success)
                router.push({
                    pathname: `/payment/${enrollmentId}`,
                    params: { autoOpened: 'true' }
                });
            } else {
                // Fallback to manual flow in payment screen
                router.push(`/payment/${enrollmentId}`);
            }
        } catch (error) {
            console.log('Payment Error:', error);
            router.push(`/payment/${enrollmentId}`);
        } finally {
            setEnrolling(false);
        }
    };

    const handleJoinMeeting = async (scheduleId) => {
        setJoining(scheduleId);
        const result = await getMeetingLink(scheduleId);
        setJoining(null);
        if (result.success && result.data?.meetingLink) {
            Linking.openURL(result.data.meetingLink);
        } else {
            console.log("Join Class Error:", result.error);
            if (result.error?.includes('not paid') || result.error?.includes('payment')) {
                Alert.alert(
                    "Payment Required",
                    "Your enrollment for this batch is not fully active. Complete your payment to join live classes.",
                    [
                        { text: "Later", style: "cancel" },
                        {
                            text: "💳 Pay Now",
                            onPress: () => {
                                if (myEnrollmentId && myEnrollmentId !== 'premium-access') {
                                    handlePayment(myEnrollmentId);
                                } else {
                                    Alert.alert("Error", "Could not find your enrollment ID. Please try re-enrolling.");
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.error || 'Session might not be active yet.');
            }
        }
    };

    // ── Loading
    if (isLoading && !currentBatch) {
        return (
            <View style={styles.fullCenter}>
                <LinearGradient colors={['#0A1628', '#0D2137', '#0A1628']} style={StyleSheet.absoluteFillObject} />
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>Loading batch...</Text>
            </View>
        );
    }

    if (!currentBatch) {
        return (
            <View style={styles.fullCenter}>
                <LinearGradient colors={['#0A1628', '#0D2137', '#0A1628']} style={StyleSheet.absoluteFillObject} />
                <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
                <Text style={styles.loadingText}>Batch not found.</Text>
            </View>
        );
    }

    const statusColor = STATUS_COLORS[currentBatch.status] || STATUS_COLORS.DEFAULT;
    const levelIcon = LEVEL_ICONS[currentBatch.level] || 'school-outline';

    // ─────────────── TAB CONTENT ───────────────
    const renderOverview = () => (
        <View>
            {/* Courses */}
            {currentBatch.courses?.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📚 Included Courses</Text>
                    {currentBatch.courses.map((item, index) => (
                        <View key={item.id || index} style={styles.courseCard}>
                            <LinearGradient colors={['#1A2744', '#0F1B33']} style={StyleSheet.absoluteFillObject} borderRadius={16} />
                            <View style={styles.courseNumBadge}>
                                <Text style={styles.courseNum}>{index + 1}</Text>
                            </View>
                            <View style={styles.courseBody}>
                                <Text style={styles.courseName}>{item.course?.name || 'Course'}</Text>
                                <Text style={styles.courseDesc} numberOfLines={2}>{item.course?.description || '—'}</Text>
                                {item.instructors?.length > 0 && (
                                    <View style={styles.instructorRow}>
                                        <Ionicons name="person-circle-outline" size={14} color="#F59E0B" />
                                        <Text style={styles.instructorName}>
                                            {item.instructors[0].user?.firstName} {item.instructors[0].user?.lastName}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Pricing */}
            <View style={styles.pricingCard}>
                <LinearGradient colors={['#1A2744', '#0A1628']} style={StyleSheet.absoluteFillObject} borderRadius={20} />
                <View style={styles.pricingHeader}>
                    <View>
                        <Text style={styles.pricingLabel}>Batch Fee</Text>
                        <Text style={styles.pricingValue}>
                            {currentBatch.feeAmount > 0 ? `${currentBatch.feeAmount}` : 'Free'}
                            {currentBatch.feeAmount > 0 && <Text style={styles.pricingCurrency}> ETB</Text>}
                        </Text>
                    </View>
                    {isFullyEnrolled && (
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.paidBadge}>
                            <Ionicons name="checkmark-circle" size={15} color="#fff" />
                            <Text style={styles.paidText}>PAID</Text>
                        </LinearGradient>
                    )}
                </View>
                <Text style={styles.pricingNote}>Includes lessons, quizzes, live sessions & AI tools</Text>

                {/* What's included */}
                <View style={styles.includedGrid}>
                    {[
                        { icon: 'book-outline', label: 'Lessons' },
                        { icon: 'help-circle-outline', label: 'Quizzes' },
                        { icon: 'videocam-outline', label: 'Live Classes' },
                        { icon: 'chatbubbles-outline', label: 'Community' },
                    ].map((f, i) => (
                        <View key={i} style={styles.includedItem}>
                            <Ionicons name={f.icon} size={20} color="#F59E0B" />
                            <Text style={styles.includedLabel}>{f.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* About */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About this Batch</Text>
                <View style={styles.aboutCard}>
                    <LinearGradient colors={['#0F1B33', '#0A1628']} style={StyleSheet.absoluteFillObject} borderRadius={16} />
                    <Text style={styles.aboutText}>{currentBatch.description || 'No description provided.'}</Text>

                    <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
                            <Text style={styles.metaLabel}>Start</Text>
                            <Text style={styles.metaValue}>{currentBatch.startDate ? new Date(currentBatch.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar" size={16} color="#EF4444" />
                            <Text style={styles.metaLabel}>End</Text>
                            <Text style={styles.metaValue}>{currentBatch.endDate ? new Date(currentBatch.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="people-outline" size={16} color="#8B5CF6" />
                            <Text style={styles.metaLabel}>Capacity</Text>
                            <Text style={styles.metaValue}>{currentBatch.maxStudents ?? '∞'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name={levelIcon} size={16} color="#10B981" />
                            <Text style={styles.metaLabel}>Level</Text>
                            <Text style={styles.metaValue}>{currentBatch.level}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Progress banner */}
            {isFullyEnrolled && (
                <View style={styles.progressCard}>
                    <LinearGradient colors={['#1A2744', '#0A1628']} style={StyleSheet.absoluteFillObject} borderRadius={20} />
                    <View style={styles.progressTop}>
                        <View>
                            <Text style={styles.progressTitle}>Your Progress</Text>
                            <Text style={styles.progressSub}>{completedLessons} of {totalLessons || '?'} lessons complete</Text>
                        </View>
                        <ProgressRing pct={completionPct} />
                    </View>
                    <View style={styles.progressBarBg}>
                        <LinearGradient
                            colors={['#F59E0B', '#F97316']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={[styles.progressBarFill, { width: `${Math.max(completionPct, 2)}%` }]}
                        />
                    </View>
                    <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/(tabs)/Modules')}>
                        <Text style={styles.continueBtnText}>Continue Learning</Text>
                        <Ionicons name="arrow-forward" size={15} color="#1A1A2E" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderSchedules = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>📅 Upcoming Sessions</Text>
                <TouchableOpacity onPress={() => getBatchSchedules(id)} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={18} color="#F59E0B" />
                </TouchableOpacity>
            </View>
            {schedules?.length > 0 ? schedules.map((item, index) => (
                <View key={item.id || index} style={styles.scheduleCard}>
                    <LinearGradient colors={['#1A2744', '#0F1B33']} style={StyleSheet.absoluteFillObject} borderRadius={16} />
                    <View style={styles.scheduleLeft}>
                        <View style={styles.scheduleIconWrap}>
                            <Ionicons name="calendar" size={22} color="#F59E0B" />
                        </View>
                        <View>
                            <Text style={styles.scheduleDay}>{item.schedule?.dayOfWeek}</Text>
                            <Text style={styles.scheduleTime}>{item.schedule?.startTime} – {item.schedule?.endTime}</Text>
                            {item.attendances?.length > 0 && (
                                <View style={styles.attendanceBadge}>
                                    <Text style={styles.attendanceText}>{item.attendances[0].status}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.joinBtn, joining === item.id && styles.joinBtnLoading]}
                        onPress={() => handleJoinMeeting(item.id)}
                        disabled={joining === item.id}
                    >
                        {joining === item.id
                            ? <ActivityIndicator size="small" color="#1A1A2E" />
                            : <>
                                <Ionicons name="videocam" size={14} color="#1A1A2E" />
                                <Text style={styles.joinBtnText}>Join</Text>
                            </>
                        }
                    </TouchableOpacity>
                </View>
            )) : (
                <View style={styles.emptyBox}>
                    <Ionicons name="calendar-outline" size={48} color="#1E2D44" />
                    <Text style={styles.emptyTitle}>No Sessions Yet</Text>
                    <Text style={styles.emptyDesc}>Schedules will appear here when the instructor sets them up.</Text>
                </View>
            )}
        </View>
    );

    const handleGenerateVideos = async () => {
        setGenerating(true);
        await generateAiVideos(currentBatch.language, currentBatch.level);
        setGenerating(false);
    };

    const renderResources = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ AI Recommended Resources</Text>
            {generatedVideos?.length > 0 ? (
                <View>
                    <Text style={styles.resourcesSub}>Curated for {currentBatch.language} · {currentBatch.level}</Text>
                    {generatedVideos.map((video, index) => (
                        <TouchableOpacity key={index} style={styles.videoCard} onPress={() => setSelectedVideo(video)} activeOpacity={0.85}>
                            <LinearGradient colors={['#1A2744', '#0F1B33']} style={StyleSheet.absoluteFillObject} borderRadius={16} />
                            <View style={styles.videoThumb}>
                                <LinearGradient colors={['#000', '#1A1A2E']} style={StyleSheet.absoluteFillObject} borderRadius={12} />
                                <Ionicons name="play-circle" size={40} color="#F59E0B" />
                            </View>
                            <View style={styles.videoBody}>
                                <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                                <View style={styles.videoDurationRow}>
                                    <Ionicons name="time-outline" size={12} color="#6B7280" />
                                    <Text style={styles.videoDuration}>{video.duration}</Text>
                                </View>
                                <Text style={styles.watchText}>Tap to Watch →</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.refreshVideosBtn} onPress={handleGenerateVideos} disabled={generating}>
                        <Ionicons name="refresh" size={16} color="#F59E0B" />
                        <Text style={styles.refreshVideosBtnText}>{generating ? 'Refreshing...' : 'Refresh Recommendations'}</Text>
                    </TouchableOpacity>

                    {/* Video Modal */}
                    <Modal visible={!!selectedVideo} animationType="slide" transparent={false} onRequestClose={() => setSelectedVideo(null)}>
                        <SafeAreaView style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setSelectedVideo(null)} style={styles.modalCloseBtn}>
                                    <Ionicons name="close" size={26} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle} numberOfLines={1}>{selectedVideo?.title}</Text>
                            </View>
                            {Platform.OS === 'web' ? (
                                <iframe
                                    src={getEmbedUrl(selectedVideo?.url || selectedVideo?.videoUrl)}
                                    width="100%" height="100%" frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen style={{ border: 'none' }}
                                />
                            ) : (
                                <WebView
                                    style={{ flex: 1 }}
                                    javaScriptEnabled domStorageEnabled
                                    source={{ uri: getEmbedUrl(selectedVideo?.url || selectedVideo?.videoUrl) }}
                                />
                            )}
                        </SafeAreaView>
                    </Modal>
                </View>
            ) : (
                <View style={styles.emptyBox}>
                    <LinearGradient colors={['#0F1B33', '#0A1628']} style={StyleSheet.absoluteFillObject} borderRadius={20} />
                    <Ionicons name="videocam-outline" size={56} color="#1E3A5F" />
                    <Text style={styles.emptyTitle}>No Resources Yet</Text>
                    <Text style={styles.emptyDesc}>Let our AI find the best supplementary videos for this batch's level and language.</Text>
                    <TouchableOpacity style={styles.aiGenerateBtn} onPress={handleGenerateVideos} disabled={generating}>
                        {generating
                            ? <ActivityIndicator color="#1A1A2E" />
                            : <><Ionicons name="sparkles" size={18} color="#1A1A2E" /><Text style={styles.aiGenerateBtnText}>Generate with AI</Text></>
                        }
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: '#0A1628' },
                headerTintColor: '#fff',
                title: '',
                headerShadowVisible: false,
            }} />

            <LinearGradient colors={['#0A1628', '#0D2137', '#0A1628']} style={StyleSheet.absoluteFillObject} />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ── HERO HEADER ── */}
                <View style={styles.hero}>
                    {/* Language pill + status */}
                    <View style={styles.heroTopRow}>
                        <View style={styles.langPill}>
                            <Ionicons name="globe-outline" size={12} color="#F59E0B" />
                            <Text style={styles.langText}>{currentBatch.language}</Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: statusColor + '22', borderColor: statusColor + '66' }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <Text style={[styles.statusText, { color: statusColor }]}>{currentBatch.status}</Text>
                        </View>
                    </View>

                    <Text style={styles.heroTitle}>{currentBatch.name}</Text>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <StatPill icon={levelIcon} label={currentBatch.level} color="#10B981" />
                        {currentBatch.feeAmount > 0 && (
                            <StatPill icon="card-outline" label={`${currentBatch.feeAmount} ETB`} color="#F59E0B" />
                        )}
                        {currentBatch.maxStudents && (
                            <StatPill icon="people-outline" label={`${currentBatch.maxStudents} seats`} color="#8B5CF6" />
                        )}
                        {currentBatch.courses?.length > 0 && (
                            <StatPill icon="book-outline" label={`${currentBatch.courses.length} courses`} color="#3B82F6" />
                        )}
                    </View>

                    {/* Enrollment status chip */}
                    {isFullyEnrolled && (
                        <View style={styles.enrolledChip}>
                            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                            <Text style={styles.enrolledChipText}>You're enrolled · Premium access active</Text>
                        </View>
                    )}
                    {enrollmentStatus === 'PENDING' && (
                        <View style={[styles.enrolledChip, { borderColor: '#F59E0B55', backgroundColor: '#F59E0B11' }]}>
                            <Ionicons name="time-outline" size={14} color="#F59E0B" />
                            <Text style={[styles.enrolledChipText, { color: '#F59E0B' }]}>Payment pending · Complete to unlock</Text>
                        </View>
                    )}
                </View>

                {/* ── TAB BAR ── */}
                <TabBar activeTab={activeTab} isFullyEnrolled={isFullyEnrolled} onTabPress={handleTabChange} />

                {/* ── TAB CONTENT ── */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'schedules' && renderSchedules()}
                    {activeTab === 'resources' && renderResources()}
                </Animated.View>
            </ScrollView>

            {/* ── FOOTER ── */}
            <View style={styles.footer}>
                {isFullyEnrolled ? (
                    <View style={styles.enrolledFooter}>
                        <View style={styles.enrolledFooterLeft}>
                            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                            <View>
                                <Text style={styles.enrolledFooterTitle}>Enrolled & Active</Text>
                                <Text style={styles.enrolledFooterSub}>{completionPct}% complete · {completedLessons} lessons done</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.studyBtn} onPress={() => router.push('/(tabs)/Modules')}>
                            <Text style={styles.studyBtnText}>Study</Text>
                            <Ionicons name="arrow-forward" size={14} color="#1A1A2E" />
                        </TouchableOpacity>
                    </View>
                ) : enrollmentStatus === 'PENDING' ? (
                    <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => myEnrollmentId && handlePayment(myEnrollmentId)}
                        disabled={enrolling}
                        activeOpacity={0.85}
                    >
                        <LinearGradient colors={['#F59E0B', '#F97316']} style={StyleSheet.absoluteFillObject} borderRadius={14} />
                        {enrolling ? <ActivityIndicator color="#1A1A2E" /> : (
                            <><Ionicons name="card" size={18} color="#1A1A2E" /><Text style={styles.payBtnText}>Complete Payment</Text></>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.payBtn, enrolling && styles.payBtnDisabled]}
                        onPress={handleEnroll}
                        disabled={enrolling}
                        activeOpacity={0.85}
                    >
                        <LinearGradient colors={enrolling ? ['#1E2D44', '#1E2D44'] : ['#F59E0B', '#F97316']} style={StyleSheet.absoluteFillObject} borderRadius={14} />
                        {enrolling ? <ActivityIndicator color="#fff" /> : (
                            <><Ionicons name="add-circle-outline" size={18} color="#1A1A2E" /><Text style={styles.payBtnText}>Enroll & Pay</Text></>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

