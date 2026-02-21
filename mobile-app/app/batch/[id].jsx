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
        currentBatch, getBatchById, enrollInBatch, getCourseSchedules,
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
        if (id && activeTab === 'schedules' && currentBatch?.courses) {
            currentBatch.courses.forEach(c => getCourseSchedules(c.id));
        }
    }, [id, activeTab, currentBatch]);

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

    const handlePayment = (enrollmentId) => {
        router.push({ pathname: `/payment/${enrollmentId}` });
    };

    const handleJoinMeeting = async (scheduleId) => {
        setJoining(scheduleId);
        const result = await getMeetingLink(scheduleId);
        setJoining(null);
        if (result.success && result.data?.meetingLink) Linking.openURL(result.data.meetingLink);
        else Alert.alert('Error', result.error || 'Session might not be active yet.');
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
                <TouchableOpacity onPress={() => currentBatch.courses?.forEach(c => getCourseSchedules(c.id))} style={styles.refreshBtn}>
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

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    fullCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
    loadingText: { color: '#9CA3AF', marginTop: 8 },
    scroll: { paddingBottom: 120 },

    // Hero
    hero: { padding: SPACING.lg, paddingTop: SPACING.xl },
    heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
    langPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F59E0B22', borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.sm, paddingVertical: 4,
        borderWidth: 1, borderColor: '#F59E0B44',
    },
    langText: { color: '#F59E0B', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    heroTitle: { fontSize: 30, fontWeight: 'bold', color: '#fff', lineHeight: 36, marginBottom: SPACING.md },

    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
    enrolledChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#10B98111', borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.md, paddingVertical: 6,
        borderWidth: 1, borderColor: '#10B98133', alignSelf: 'flex-start',
    },
    enrolledChipText: { color: '#10B981', fontSize: 12, fontWeight: '600' },

    // Tabs
    section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: SPACING.md },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F59E0B22', alignItems: 'center', justifyContent: 'center' },

    // Course cards
    courseCard: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.md,
        borderWidth: 1, borderColor: '#1E2D44', overflow: 'hidden',
    },
    courseNumBadge: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: '#F59E0B22',
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F59E0B44',
    },
    courseNum: { color: '#F59E0B', fontWeight: 'bold', fontSize: 15 },
    courseBody: { flex: 1 },
    courseName: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4 },
    courseDesc: { color: '#9CA3AF', fontSize: 13, lineHeight: 18 },
    instructorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    instructorName: { color: '#F59E0B', fontSize: 12, fontWeight: '600' },

    // Pricing
    pricingCard: {
        borderRadius: 20, padding: SPACING.lg, marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl, overflow: 'hidden',
        borderWidth: 1, borderColor: '#F59E0B33',
    },
    pricingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
    pricingLabel: { color: '#9CA3AF', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
    pricingValue: { fontSize: 40, fontWeight: 'bold', color: '#F59E0B', marginTop: 2 },
    pricingCurrency: { fontSize: 18, fontWeight: '600', color: '#F59E0BAA' },
    paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
    paidText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    pricingNote: { color: '#6B7280', fontSize: 12, marginTop: 4, marginBottom: SPACING.md },
    includedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
    includedItem: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#0A162855', borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.sm, paddingVertical: 6,
        borderWidth: 1, borderColor: '#1E2D44',
    },
    includedLabel: { color: '#D1D5DB', fontSize: 12 },

    // About
    aboutCard: { borderRadius: 16, padding: SPACING.lg, overflow: 'hidden', borderWidth: 1, borderColor: '#1E2D44' },
    aboutText: { color: '#D1D5DB', fontSize: 15, lineHeight: 24, marginBottom: SPACING.lg },
    metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    metaItem: {
        flex: 1, minWidth: '45%', backgroundColor: '#0A162855',
        borderRadius: BORDER_RADIUS.md, padding: SPACING.sm,
        alignItems: 'flex-start', gap: 3, borderWidth: 1, borderColor: '#1E2D44',
    },
    metaLabel: { color: '#6B7280', fontSize: 11, textTransform: 'uppercase' },
    metaValue: { color: '#fff', fontWeight: '600', fontSize: 13 },

    // Progress
    progressCard: {
        borderRadius: 20, padding: SPACING.lg, marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl, overflow: 'hidden', borderWidth: 1, borderColor: '#1E2D44',
    },
    progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    progressTitle: { color: '#fff', fontWeight: 'bold', fontSize: 17, marginBottom: 4 },
    progressSub: { color: '#9CA3AF', fontSize: 13 },
    progressBarBg: { height: 8, backgroundColor: '#1E2D44', borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.md },
    progressBarFill: { height: '100%', borderRadius: 4 },
    continueBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, backgroundColor: '#F59E0B', paddingVertical: 12, borderRadius: 10,
    },
    continueBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 14 },

    // Schedule
    scheduleCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.md,
        overflow: 'hidden', borderWidth: 1, borderColor: '#1E2D44',
    },
    scheduleLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
    scheduleIconWrap: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: '#F59E0B22', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#F59E0B44',
    },
    scheduleDay: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    scheduleTime: { color: '#F59E0B', fontSize: 13, marginTop: 2, fontWeight: '600' },
    attendanceBadge: {
        marginTop: 4, backgroundColor: '#3B82F622', borderRadius: 6,
        paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start',
    },
    attendanceText: { color: '#60A5FA', fontSize: 11, fontWeight: '600' },
    joinBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F59E0B', paddingHorizontal: SPACING.md,
        paddingVertical: 9, borderRadius: 10,
    },
    joinBtnLoading: { opacity: 0.6 },
    joinBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 13 },

    // Resources
    resourcesSub: { color: '#6B7280', fontSize: 13, marginBottom: SPACING.md },
    videoCard: {
        flexDirection: 'row', borderRadius: 16, overflow: 'hidden',
        marginBottom: SPACING.md, borderWidth: 1, borderColor: '#1E2D44',
    },
    videoThumb: {
        width: 110, height: 85, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    videoBody: { flex: 1, padding: SPACING.md, justifyContent: 'space-between' },
    videoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 13, lineHeight: 18 },
    videoDurationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    videoDuration: { color: '#6B7280', fontSize: 12 },
    watchText: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold' },
    refreshVideosBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10,
    },
    refreshVideosBtnText: { color: '#F59E0B', fontWeight: '600' },

    // Empty box (shared)
    emptyBox: {
        borderRadius: 20, padding: SPACING.xl, alignItems: 'center',
        gap: SPACING.sm, overflow: 'hidden', borderWidth: 1,
        borderColor: '#1E2D44', borderStyle: 'dashed', minHeight: 200, justifyContent: 'center',
    },
    emptyTitle: { color: '#9CA3AF', fontWeight: '700', fontSize: 18 },
    emptyDesc: { color: '#4B5563', textAlign: 'center', lineHeight: 20, maxWidth: 260 },
    aiGenerateBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F59E0B', paddingHorizontal: SPACING.xl,
        paddingVertical: 12, borderRadius: BORDER_RADIUS.full, marginTop: SPACING.sm,
    },
    aiGenerateBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 15 },

    // Footer
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: SPACING.md, paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md,
        backgroundColor: '#0A1628EE', borderTopWidth: 1, borderTopColor: '#1E2D44',
    },
    enrolledFooter: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#10B98111', borderRadius: 14, paddingHorizontal: SPACING.md, paddingVertical: 12,
        borderWidth: 1, borderColor: '#10B98133',
    },
    enrolledFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    enrolledFooterTitle: { color: '#10B981', fontWeight: 'bold', fontSize: 14 },
    enrolledFooterSub: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
    studyBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F59E0B', paddingHorizontal: SPACING.md,
        paddingVertical: 8, borderRadius: 10,
    },
    studyBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 13 },
    payBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 16, borderRadius: 14, overflow: 'hidden',
        shadowColor: '#F59E0B', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    payBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
    payBtnText: { color: '#1A1A2E', fontWeight: 'bold', fontSize: 17 },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#000' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: '#0A1628', gap: SPACING.sm },
    modalCloseBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { flex: 1, color: '#fff', fontSize: 15, fontWeight: 'bold' },
});

// Stat pill style
const stat = StyleSheet.create({
    pill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#0F1B33', borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.sm, paddingVertical: 5,
        borderWidth: 1, borderColor: '#1E2D44',
    },
    label: { fontSize: 12, fontWeight: '600' },
});

// Tab bar style
const tabBar = StyleSheet.create({
    container: {
        flexDirection: 'row', gap: 4,
        paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg,
    },
    item: {
        flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        paddingVertical: 10, borderRadius: 12, gap: 3,
        backgroundColor: '#0F1B33', borderWidth: 1, borderColor: '#1E2D44',
    },
    itemActive: { borderColor: '#F59E0B66', overflow: 'hidden' },
    label: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
    labelActive: { color: '#1A1A2E', fontWeight: 'bold' },
    labelLocked: { color: '#374151' },
    lock: { position: 'absolute', top: 4, right: 4 },
});
