import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Linking, Platform, AppState, Modal, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { useBatchStore } from '../../src/stores/batchStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function BatchDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const {
        currentBatch,
        selectBatch,
        enrollInBatch,
        getCourseSchedules,
        schedules,
        getMeetingLink,
        isLoading,
        checkEnrollmentStatus,
        initiatePayment,
        checkPaymentStatus // Ensure this is available in store
    } = useBatchStore();

    const [enrolling, setEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, schedules, community
    const [joining, setJoining] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState(null); // 'PENDING', 'COMPLETED', or null
    const [myEnrollmentId, setMyEnrollmentId] = useState(null);
    const appState = useRef(AppState.currentState);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Helper to extract YouTube ID and return embed URL
    const getEmbedUrl = (url) => {
        if (!url) return null;
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    // Fetch batch details
    useEffect(() => {
        if (id) {
            selectBatch(id);
        }
    }, [id]);

    // Check enrollment status whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (id) {
                checkAccess();
            }
        }, [id])
    );

    // Listen for AppState changes to verify payment on return
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App has come to the foreground
                if (enrollmentStatus === 'PENDING' && myEnrollmentId) {
                    console.log('App active, checking payment status...');
                    checkAccess();
                    // Optionally call checkPaymentStatus(myEnrollmentId) specifically if checkAccess is cached or slow
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [enrollmentStatus, myEnrollmentId]);

    // Deep Link Handler
    useEffect(() => {
        const handleDeepLink = (event) => {
            let data = Linking.parse(event.url);
            // Handle specific deep link paths if backend redirects to Mobile-app://payment-success
            if (enrollmentStatus === 'PENDING' && myEnrollmentId) {
                checkAccess();
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        return () => subscription.remove();
    }, [enrollmentStatus, myEnrollmentId]);


    const checkAccess = async () => {
        const result = await checkEnrollmentStatus(id);
        if (result.isEnrolled) {
            setEnrollmentStatus(result.status);
            setMyEnrollmentId(result.enrollmentId);
            // If status became COMPLETED, maybe show success alert
            if (result.status === 'COMPLETED' && enrollmentStatus === 'PENDING') {
                Alert.alert("Success", "Payment confirmed! You now have full access.");
            }
        } else {
            // Check if we have a locally stored pending enrollment? 
            // For now, trust the API.
            if (enrollmentStatus !== 'PENDING') { // Only reset if we weren't pending, or logic might be tricky 
                setEnrollmentStatus(null);
                setMyEnrollmentId(null);
            }
        }
    };

    // Load schedules if access is granted
    useEffect(() => {
        if (id && activeTab === 'schedules' && enrollmentStatus === 'COMPLETED') {
            if (currentBatch?.courses) {
                currentBatch.courses.forEach(c => getCourseSchedules(c.id));
            }
        }
    }, [id, activeTab, currentBatch, enrollmentStatus]);

    const handleTabChange = (tab) => {
        if (tab === 'overview') {
            setActiveTab(tab);
            return;
        }

        // Restrict access
        if (enrollmentStatus !== 'COMPLETED') {
            Alert.alert(
                "Access Restricted",
                enrollmentStatus === 'PENDING'
                    ? "Please complete your payment to access this feature."
                    : "You must enroll and pay to access this feature.",
                enrollmentStatus === 'PENDING' && myEnrollmentId
                    ? [{ text: "Pay Now", onPress: () => handlePayment(myEnrollmentId) }, { text: "Cancel", style: "cancel" }]
                    : [{ text: "Enroll Now", onPress: handleEnroll }, { text: "Cancel", style: "cancel" }]
            );
            return;
        }

        if (tab === 'community') {
            router.push(`/community/${id}`);
        } else {
            setActiveTab(tab);
        }
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        const result = await enrollInBatch(id, null);
        setEnrolling(false);

        if (result.success) {
            setMyEnrollmentId(result.enrollment.id);
            setEnrollmentStatus('PENDING');

            Alert.alert(
                "Enrollment Successful",
                "Proceed to payment to unlock full access.",
                [
                    { text: "Pay Now", onPress: () => handlePayment(result.enrollment.id) },
                    { text: "Later", onPress: () => { } }
                ]
            );
        } else {
            Alert.alert("Enrollment Failed", result.error || "Please try again.");
        }
    };

    const handlePayment = async (enrollmentId) => {
        setEnrolling(true);
        const result = await initiatePayment(enrollmentId);
        setEnrolling(false);

        if (result.success && result.payment.checkoutUrl) {
            // Open Chapa Checkout
            const supported = await Linking.canOpenURL(result.payment.checkoutUrl);
            if (supported) {
                await Linking.openURL(result.payment.checkoutUrl);
            } else {
                Alert.alert("Error", "Cannot open payment link: " + result.payment.checkoutUrl);
            }
        } else {
            Alert.alert("Payment Error", result.error || "Could not initiate payment.");
        }
    };

    const handleJoinMeeting = async (scheduleId) => {
        setJoining(scheduleId);
        const result = await getMeetingLink(scheduleId);
        setJoining(null);
        if (result.success && result.data?.meetingLink) {
            Linking.openURL(result.data.meetingLink);
        } else {
            Alert.alert("Error", result.error || "Could not get meeting link. Session might not be active.");
        }
    };

    if (isLoading && !currentBatch) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!currentBatch) {
        return (
            <View style={styles.centerContainer}>
                <Text style={{ color: 'white' }}>Batch not found.</Text>
            </View>
        );
    }

    const renderOverview = () => (
        <View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About this Batch</Text>
                <Text style={styles.description}>{currentBatch.description}</Text>
            </View>

            {currentBatch.courses && currentBatch.courses.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Included Courses</Text>
                    {currentBatch.courses.map((item, index) => (
                        <View key={item.id || index} style={styles.courseItem}>
                            <View style={styles.courseIcon}>
                                <Ionicons name="book-outline" size={24} color={COLORS.secondary} />
                            </View>
                            <View style={styles.courseDetails}>
                                <Text style={styles.courseName}>{item.course?.name || "Course Name"}</Text>
                                <Text style={styles.courseDesc} numberOfLines={2}>{item.course?.description || "Course Description"}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.pricingCard}>
                <View style={styles.priceRow}>
                    <View>
                        <Text style={styles.priceLabel}>Batch Fee</Text>
                        <Text style={styles.priceValue}>
                            {currentBatch.feeAmount > 0 ? `${currentBatch.feeAmount} ETB` : 'Free'}
                        </Text>
                    </View>
                    {enrollmentStatus === 'COMPLETED' && (
                        <View style={styles.paidBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                            <Text style={styles.paidText}>PAID</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.priceNote}>Includes full access to all lessons, quizzes, and live sessions.</Text>
            </View>
        </View>
    );

    const renderSchedules = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                <TouchableOpacity onPress={() => currentBatch.courses.forEach(c => getCourseSchedules(c.id))}>
                    <Ionicons name="refresh" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {schedules && schedules.length > 0 ? (
                schedules.map((item, index) => (
                    <View key={item.id || index} style={styles.scheduleCard}>
                        <View style={styles.scheduleInfo}>
                            <Text style={styles.scheduleDay}>{item.schedule?.dayOfWeek}</Text>
                            <Text style={styles.scheduleTime}>
                                {item.schedule?.startTime} - {item.schedule?.endTime}
                            </Text>
                            {/* Display attendance status if available */}
                            {item.attendances?.length > 0 && (
                                <Text style={styles.attendanceStatus}>
                                    Status: {item.attendances[0].status}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.joinButton}
                            onPress={() => handleJoinMeeting(item.id)}
                            disabled={joining === item.id}
                        >
                            <Text style={styles.joinButtonText}>
                                {joining === item.id ? "Joining..." : "Join"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))
            ) : (
                <Text style={styles.emptyText}>No schedules available yet.</Text>
            )}
        </View>
    );

    const [generating, setGenerating] = useState(false);
    const { generatedVideos, generateAiVideos } = useBatchStore();

    const handleGenerateVideos = async () => {
        setGenerating(true);
        await generateAiVideos(currentBatch.language, currentBatch.level);
        setGenerating(false);
    };

    const renderResources = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>AI Recommended Resources</Text>
            </View>

            {generatedVideos && generatedVideos.length > 0 ? (
                <View>
                    <Text style={[styles.description, { marginBottom: SPACING.md }]}>
                        Curated for {currentBatch.language} ({currentBatch.level})
                    </Text>
                    {generatedVideos.map((video, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.videoCard}
                            onPress={() => setSelectedVideo(video)}
                        >
                            <View style={styles.videoThumbnail}>
                                <Ionicons name="play-circle" size={48} color="#fff" />
                            </View>
                            <View style={styles.videoInfo}>
                                <Text style={styles.videoTitle}>{video.title}</Text>
                                <Text style={styles.videoDuration}>{video.duration}</Text>
                                <Text style={styles.watchText}>Tap to Watch</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleGenerateVideos} disabled={generating}>
                        <Text style={styles.secondaryButtonText}>{generating ? "Refreshing..." : "Refresh Recommendations"}</Text>
                    </TouchableOpacity>

                    {/* Video Modal */}
                    <Modal
                        visible={!!selectedVideo}
                        animationType="slide"
                        transparent={false}
                        onRequestClose={() => setSelectedVideo(null)}
                    >
                        <SafeAreaView style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setSelectedVideo(null)} style={styles.closeButton}>
                                    <Ionicons name="close" size={28} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle} numberOfLines={1}>{selectedVideo?.title}</Text>
                            </View>
                            <WebView
                                style={styles.webview}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                source={{ uri: getEmbedUrl(selectedVideo?.url || selectedVideo?.videoUrl) }}
                            />
                        </SafeAreaView>
                    </Modal>
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="videocam-outline" size={64} color={COLORS.primary} />
                    <Text style={styles.emptyTitle}>No Resources Yet</Text>
                    <Text style={styles.emptyDesc}>Let our AI find the best supplementary videos for this batch's level and language.</Text>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleGenerateVideos}
                        disabled={generating}
                    >
                        {generating ? (
                            <ActivityIndicator color={COLORS.secondary} />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="sparkles" size={20} color={COLORS.secondary} />
                                <Text style={styles.actionButtonText}>Generate with AI</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const isLocked = (tab) => tab !== 'overview' && enrollmentStatus !== 'COMPLETED';

    return (
        <View style={styles.container}>
            {/* ... existing header ... */}
            <Stack.Screen options={{
                headerStyle: { backgroundColor: COLORS.secondary },
                headerTintColor: '#fff',
                title: '', // Custom title in body
                headerShadowVisible: false,
            }} />

            <LinearGradient
                colors={[COLORS.secondary, '#000']}
                style={styles.background}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{currentBatch.language}</Text>
                    </View>
                    <Text style={styles.title}>{currentBatch.name}</Text>
                    <Text style={styles.level}>{currentBatch.level} Level</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    {['overview', 'schedules', 'resources', 'community'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabButton,
                                activeTab === tab && styles.activeTab,
                                isLocked(tab) && styles.lockedTab
                            ]}
                            onPress={() => handleTabChange(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                            {isLocked(tab) && (
                                <Ionicons name="lock-closed" size={12} color="#9CA3AF" style={{ marginLeft: 4 }} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'schedules' && renderSchedules()}
                {activeTab === 'resources' && renderResources()}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                {enrollmentStatus === 'COMPLETED' ? (
                    <View style={styles.enrolledFooter}>
                        <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
                        <Text style={styles.enrolledText}>You are enrolled!</Text>
                    </View>
                ) : enrollmentStatus === 'PENDING' ? (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => myEnrollmentId && handlePayment(myEnrollmentId)}
                        disabled={enrolling}
                    >
                        {enrolling ? <ActivityIndicator color={COLORS.secondary} /> : <Text style={styles.primaryButtonText}>Complete Payment</Text>}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.primaryButton, enrolling && styles.disabledButton]}
                        onPress={handleEnroll}
                        disabled={enrolling}
                    >
                        {enrolling ? <ActivityIndicator color={COLORS.secondary} /> : <Text style={styles.primaryButtonText}>Enroll & Pay</Text>}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    headerSection: {
        marginBottom: SPACING.xl,
        marginTop: SPACING.lg,
    },
    badgeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        marginBottom: SPACING.md,
    },
    badgeText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    level: {
        fontSize: 18,
        color: COLORS.primary,
        marginBottom: SPACING.md,
        fontWeight: '500',
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: SPACING.md,
    },
    description: {
        fontSize: 16,
        color: '#D1D5DB', // Light grey
        lineHeight: 24,
    },
    courseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceDark, // Dark card
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#374151',
    },
    courseIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    courseDetails: {
        flex: 1,
    },
    courseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    courseDesc: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    pricingCard: {
        backgroundColor: COLORS.surfaceDark,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginTop: SPACING.md,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    priceLabel: {
        fontSize: 14,
        color: '#D1D5DB',
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    priceValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        gap: 6,
    },
    paidText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    priceNote: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111827', // Dark Footer
        padding: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    enrolledFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.sm,
        gap: SPACING.md,
        backgroundColor: '#064E3B', // Dark Green bg
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: 16,
    },
    enrolledText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34D399', // Light Green text
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: COLORS.secondary, // Dark text on Yellow button
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#4B5563',
        shadowOpacity: 0,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.lg,
        backgroundColor: COLORS.surfaceDark,
        borderRadius: BORDER_RADIUS.lg,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    lockedTab: {
        opacity: 0.5,
    },
    tabText: {
        fontSize: 14,
        color: '#D1D5DB',
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    scheduleCard: {
        backgroundColor: COLORS.surfaceDark,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#374151',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleDay: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    scheduleTime: {
        fontSize: 14,
        color: COLORS.primary,
        marginTop: 4,
        fontWeight: '600',
    },
    attendanceStatus: {
        fontSize: 12,
        color: '#60A5FA',
        marginTop: 4,
        fontWeight: '500',
    },
    joinButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.md,
    },
    joinButtonText: {
        color: COLORS.secondary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: SPACING.xl,
    },
    // New Styles
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.surfaceDark,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: '#374151',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: SPACING.md,
    },
    emptyDesc: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: SPACING.lg,
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.full,
    },
    actionButtonText: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    videoCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surfaceDark,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#374151',
    },
    videoThumbnail: {
        width: 120,
        height: 90,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoInfo: {
        flex: 1,
        padding: SPACING.md,
        justifyContent: 'space-between',
    },
    videoTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    videoDuration: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    watchText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    secondaryButton: {
        padding: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#000',
    },
    closeButton: {
        marginRight: 15,
    },
    modalTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    webview: {
        flex: 1,
    },
});
