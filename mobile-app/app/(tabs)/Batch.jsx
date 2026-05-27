import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
    View, Text, TouchableOpacity,
    RefreshControl, StatusBar, Animated, ScrollView,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBatchStore } from '../../src/stores/batchStore';
import { COLORS, SPACING } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumMenu from '../../src/components/PremiumMenu';
import FeaturedCard from '../../src/components/batch/FeaturedCard';
import BatchCard from '../../src/components/batch/BatchCard';
import BatchListHeader from '../../src/components/batch/BatchListHeader';
import styles from '../styles/batchStyle';

export default function BatchScreen() {
    const router = useRouter();
    const { batches, isLoading, getBatches, enrollments, premiumUnlocked } = useBatchStore();
    const [filter, setFilter] = useState('All');
    const [menuVisible, setMenuVisible] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');

    useEffect(() => { getBatches(); }, []);
    const onRefresh = useCallback(() => getBatches(), []);

    const filtered = batches.filter(b =>
        filter === 'All' ? true : b.status === filter || b.level === filter
    );

    const featuredBatch = batches.find(b => b.status === 'ACTIVE') || batches[0] || null;
    const listBatches = filtered.filter(b => b.id !== featuredBatch?.id);

    const totalActive = batches.filter(b => b.status === 'ACTIVE').length;
    const totalUpcoming = batches.filter(b => b.status === 'UPCOMING').length;
    const totalStudents = batches.reduce((s, b) => s + (b.enrollments?.length || 0), 0);

    // Header parallax
    const headerTranslate = scrollY.interpolate({ inputRange: [0, 120], outputRange: [0, -30], extrapolate: 'clamp' });
    const headerOpacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0.6], extrapolate: 'clamp' });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View style={styles.root}>
                <StatusBar barStyle="light-content" />
                <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

                {/* ── Hero Banner (Home-style) ── */}
                <LinearGradient
                    colors={['#0A2540', '#0D1B2A', '#080C14']}
                    style={styles.heroBanner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Glow blob */}
                    <View style={styles.glowBlob} />

                    <Animated.View style={{ transform: [{ translateY: headerTranslate }], opacity: headerOpacity }}>
                        {/* Top Row with Menu */}
                        <View style={styles.headerTopRow}>
                            {isPremium && (
                                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                                    <Ionicons name="menu" size={26} color="#fff" />
                                </TouchableOpacity>
                            )}
                            {/* <View style={styles.heroEyebrow}>
                                <View style={styles.liveIndicator}>
                                    <View style={styles.livePulse} />
                                    <Text style={styles.liveText}>{totalActive} LIVE</Text>
                                </View>
                            </View> */}
                        </View>

                        <Text style={styles.heroTitle}>Batches</Text>
                        <Text style={styles.heroSub}>
                            Join a structured cohort with AI tutoring, live sessions & certification.
                        </Text>

                        {/* Stats row */}
                        <View style={styles.heroStatsRow}>
                            {[
                                { num: batches.length, label: 'Total', color: '#fff' },
                                { num: totalActive, label: 'Live', color: '#10B981' },
                                { num: totalUpcoming, label: 'Soon', color: '#60A5FA' },
                                { num: `${totalStudents}+`, label: 'Students', color: COLORS.primary },
                            ].map((s, i, arr) => (
                                <React.Fragment key={s.label}>
                                    <View style={styles.heroStat}>
                                        <Text style={[styles.heroStatNum, { color: s.color }]}>{s.num}</Text>
                                        <Text style={styles.heroStatLabel}>{s.label}</Text>
                                    </View>
                                    {i < arr.length - 1 && <View style={styles.heroStatDivider} />}
                                </React.Fragment>
                            ))}
                        </View>
                    </Animated.View>
                </LinearGradient>

                {/* ── Scrollable content ── */}
                <Animated.ScrollView
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                        />
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                    style={styles.scrollView}
                >
                    <BatchListHeader
                        filter={filter}
                        onFilterChange={setFilter}
                        totalBatches={batches.length}
                    />

                    {/* Content */}
                    {isLoading && batches.length === 0 ? (
                        <View style={styles.loadingBox}>
                            <View style={styles.loadingSpinner}>
                                <Ionicons name="sparkles" size={28} color={COLORS.primary} />
                            </View>
                            <Text style={styles.loadingText}>Finding best batches…</Text>
                        </View>
                    ) : (
                        <View style={styles.listWrap}>
                            {/* Featured */}
                            {filter === 'All' && featuredBatch && (
                                <View style={{ marginBottom: SPACING.xl }}>
                                    <View style={styles.sectionLabel}>
                                        <Ionicons name="star" size={14} color={COLORS.primary} />
                                        <Text style={styles.sectionLabelText}>Featured Batch</Text>
                                    </View>
                                    <FeaturedCard
                                        item={featuredBatch}
                                        onPress={() => router.push(`batch/${featuredBatch.id}`)}
                                    />
                                </View>
                            )}

                            {/* List */}
                            {listBatches.length > 0 && (
                                <View>
                                    {filter === 'All' && (
                                        <View style={styles.sectionLabel}>
                                            <Ionicons name="grid-outline" size={14} color="#6B7280" />
                                            <Text style={styles.sectionLabelText}>All Batches</Text>
                                            <View style={styles.sectionCount}>
                                                <Text style={styles.sectionCountText}>{listBatches.length}</Text>
                                            </View>
                                        </View>
                                    )}
                                    {listBatches.map((b, i) => (
                                        <BatchCard
                                            key={b.id}
                                            item={b}
                                            isLast={i === listBatches.length - 1}
                                            onPress={() => router.push(`batch/${b.id}`)}
                                        />
                                    ))}
                                </View>
                            )}

                            {filtered.length === 0 && (
                                <View style={styles.empty}>
                                    <Text style={{ fontSize: 48 }}></Text>
                                    <Text style={styles.emptyTitle}>No batches found</Text>
                                    <Text style={styles.emptyText}>Try a different filter</Text>
                                    <TouchableOpacity style={styles.clearBtn} onPress={() => setFilter('All')}>
                                        <Text style={styles.clearText}>Show All</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </Animated.ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}