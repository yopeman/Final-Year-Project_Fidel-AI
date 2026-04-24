import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useBatchStore } from '../stores/batchStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

export default function PremiumMenu({ visible, onClose }) {
    const router = useRouter();
    const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const {
        enrollments,
        batches,
        activeBatchId,
        setActiveBatchId,
        premiumUnlocked
    } = useBatchStore();

    // Get active/completed enrollments
    const enrolledBatches = React.useMemo(() => {
        return enrollments
            .filter(e => e.status === 'ENROLLED' || e.status === 'COMPLETED')
            .map(e => {
                const batchDetails = batches.find(b => b.id === e.batch?.id);
                return {
                    id: e.batch?.id,
                    name: e.batch?.name || batchDetails?.name || 'Unnamed Batch',
                    level: e.batch?.level || batchDetails?.level || 'N/A'
                };
            });
    }, [enrollments, batches]);

    const activeBatch = enrolledBatches.find(b => b.id === activeBatchId) || enrolledBatches[0];

    useEffect(() => {
        // Auto-select first batch if none active
        if (enrolledBatches.length > 0 && !activeBatchId) {
            setActiveBatchId(enrolledBatches[0].id);
        }
    }, [enrolledBatches, activeBatchId]);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -MENU_WIDTH,
                    duration: 250,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ]).start();
        }
    }, [visible]);

    const handleNavigation = (route) => {
        onClose();
        // Small delay to allow menu to close before navigating
        setTimeout(() => {
            router.push(`${route}${route.includes('?') ? '&' : '?'}batchId=${activeBatchId}`);
        }, 300);
    };

    if (!visible) return null;

    const MENU_ITEMS = premiumUnlocked && activeBatchId ? [
        {
            icon: 'videocam-outline',
            label: 'Live Classes',
            route: '/(tabs)/LiveClasses',
            color: '#3B82F6',
            desc: 'Join ongoing sessions'
        },
        {
            icon: 'book-outline',
            label: 'Premium Resources',
            route: '/(tabs)/Resources',
            color: '#F59E0B',
            desc: 'Exclusive learning materials'
        },
        {
            icon: 'chatbubbles-outline',
            label: 'Community Chat',
            route: '/(tabs)/Community',
            color: '#10B981',
            desc: 'Connect with peers'
        },
    ] : [
        {
            icon: 'school-outline',
            label: 'Browse Batches',
            route: '/(tabs)/Batch',
            color: COLORS.primary,
            desc: 'Find your perfect tutor'
        }
    ];

    return (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
            <View style={styles.overlay}>
                {/* Backdrop */}
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1}>
                    <Animated.View style={[styles.backdropFill, { opacity: fadeAnim }]} />
                </TouchableOpacity>

                {/* Sidebar */}
                <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
                    <LinearGradient
                        colors={[COLORS.surface, '#0F1B33']}
                        style={styles.menuGradient}
                    >
                        {/* Header */}
                        <View style={styles.menuHeader}>
                            <View style={styles.premiumBadge}>
                                <LinearGradient
                                    colors={premiumUnlocked ? ['#F59E0B', '#F97316'] : ['#4B5563', '#374151']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.premiumBadgeGradient}
                                >
                                    <Ionicons name={premiumUnlocked ? "star" : "lock-closed"} size={14} color="#FFF" />
                                    <Text style={styles.premiumText}>{premiumUnlocked ? 'PREMIUM' : 'FREE'}</Text>
                                </LinearGradient>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.menuTitle}>{premiumUnlocked ? 'Premium Access' : 'Unlock More'}</Text>
                        <Text style={styles.menuSubtitle}>
                            {premiumUnlocked
                                ? 'Everything you need to master your skills.'
                                : 'Join a batch to access live classes and community.'}
                        </Text>

                        {/* Batch Selector (Only if premium and has batches) */}
                        {premiumUnlocked && enrolledBatches.length > 0 && (
                            <View style={styles.batchSelector}>
                                <Text style={styles.sectionLabel}>ACTIVE BATCH</Text>
                                <View style={styles.batchList}>
                                    {enrolledBatches.map((batch) => (
                                        <TouchableOpacity
                                            key={batch.id}
                                            style={[
                                                styles.batchItem,
                                                activeBatchId === batch.id && styles.batchItemActive
                                            ]}
                                            onPress={() => setActiveBatchId(batch.id)}
                                        >
                                            <View style={[
                                                styles.batchDot,
                                                activeBatchId === batch.id && { backgroundColor: COLORS.primary }
                                            ]} />
                                            <Text style={[
                                                styles.batchName,
                                                activeBatchId === batch.id && { color: '#FFF', fontWeight: 'bold' }
                                            ]}>
                                                {batch.name}
                                            </Text>
                                            {activeBatchId === batch.id && (
                                                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Menu Items */}
                        <View style={styles.itemsContainer}>
                            {MENU_ITEMS.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.menuItem}
                                    onPress={() => handleNavigation(item.route)}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: item.color + '22' }]}>
                                        <Ionicons name={item.icon} size={22} color={item.color} />
                                    </View>
                                    <View style={styles.itemContent}>
                                        <Text style={styles.itemLabel}>{item.label}</Text>
                                        <Text style={styles.itemDesc}>{item.desc}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.footerText}>Secure & Verified Access</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1,
    },
    backdropFill: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    menuContainer: {
        width: MENU_WIDTH,
        height: '100%',
        zIndex: 2,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 },
            android: { elevation: 20 },
        }),
    },
    menuGradient: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: SPACING.lg,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    premiumBadge: {
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
    },
    premiumBadgeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    premiumText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    menuSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 40,
        lineHeight: 20,
    },
    itemsContainer: {
        gap: SPACING.lg,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    itemContent: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    // Batch Selector Styles
    batchSelector: {
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        letterSpacing: 1,
        marginBottom: 12,
    },
    batchList: {
        gap: 8,
    },
    batchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 12,
    },
    batchItemActive: {
        backgroundColor: 'rgba(16,185,129,0.05)',
        borderColor: 'rgba(16,185,129,0.2)',
    },
    batchDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    batchName: {
        fontSize: 14,
        color: COLORS.textSecondary,
        flex: 1,
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: 0.7,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
});
