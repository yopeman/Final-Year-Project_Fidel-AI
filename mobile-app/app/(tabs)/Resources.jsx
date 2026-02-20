import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, StatusBar, Animated, RefreshControl,
} from 'react-native';
import { useMaterialStore } from '../../src/stores/materialStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../src/constants/theme';

// ─── Design tokens (consistent with app theme) ────────────────────────────────
const DARK_BG = '#080C14';
const DARK_CARD = 'rgba(255,255,255,0.04)';
const DARK_BORDER = 'rgba(255,255,255,0.07)';
const ACCENT = '#10B981';   // emerald green
const GOLD = '#F59E0B';   // amber
const INDIGO = '#6366F1';

// Per-course palette cycling
const COURSE_COLORS = [
    { accent: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: 'library' },
    { accent: '#6366F1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', icon: 'school' },
    { accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: 'bookmark' },
    { accent: '#EC4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)', icon: 'color-palette' },
    { accent: '#14B8A6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.2)', icon: 'globe' },
    { accent: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: 'rocket' },
];

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, index, onSelect, isSelected }) {
    const scale = useRef(new Animated.Value(1)).current;
    const palette = COURSE_COLORS[index % COURSE_COLORS.length];
    const matCount = course.materials?.length || 0;

    const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 22 }).start();
    const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22 }).start();

    return (
        <Animated.View style={[styles.courseCardWrapper, { transform: [{ scale }] }]}>
            <TouchableOpacity activeOpacity={1} onPress={() => onSelect(course)}
                onPressIn={onIn} onPressOut={onOut}>
                <LinearGradient
                    colors={isSelected
                        ? [palette.accent + '28', palette.accent + '10']
                        : ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
                    style={[
                        styles.courseCard,
                        { borderColor: isSelected ? palette.accent + '66' : DARK_BORDER },
                    ]}>
                    {/* Icon circle */}
                    <View style={[styles.courseIconCircle,
                    { backgroundColor: palette.bg, borderColor: palette.border }]}>
                        <Ionicons name={palette.icon} size={24} color={palette.accent} />
                    </View>

                    {/* Text */}
                    <View style={styles.courseCardBody}>
                        <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
                        {course.description ? (
                            <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>
                        ) : null}
                        <View style={styles.courseFooter}>
                            <View style={[styles.matCountBadge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                                <Ionicons name="documents-outline" size={12} color={palette.accent} />
                                <Text style={[styles.matCountText, { color: palette.accent }]}>
                                    {matCount} {matCount === 1 ? 'material' : 'materials'}
                                </Text>
                            </View>
                            {isSelected && (
                                <View style={[styles.selectedBadge, { backgroundColor: palette.accent + '22' }]}>
                                    <Ionicons name="checkmark-circle" size={14} color={palette.accent} />
                                    <Text style={[styles.selectedText, { color: palette.accent }]}>Viewing</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Chevron */}
                    <Ionicons name="chevron-forward" size={18}
                        color={isSelected ? palette.accent : '#374151'} />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Material Card ────────────────────────────────────────────────────────────
function MaterialCard({ material, index, courseAccent }) {
    const scale = useRef(new Animated.Value(1)).current;
    const [open, setOpen] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;
    const fileCount = material.files?.length || 0;

    const toggle = () => {
        Animated.spring(anim, {
            toValue: open ? 0 : 1, useNativeDriver: false, speed: 16, bounciness: 4,
        }).start();
        setOpen(v => !v);
    };

    const maxH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 80] });
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const accent = courseAccent || ACCENT;

    const onIn = () => Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 22 }).start();
    const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }], marginBottom: 10 }}>
            <TouchableOpacity activeOpacity={1} onPress={toggle} onPressIn={onIn} onPressOut={onOut}>
                <View style={[styles.matCard, { borderLeftColor: accent }]}>
                    {/* Header */}
                    <View style={styles.matHeader}>
                        <View style={[styles.matIndexBadge, { backgroundColor: accent + '22' }]}>
                            <Text style={[styles.matIndexText, { color: accent }]}>{index + 1}</Text>
                        </View>
                        <View style={styles.matHeaderText}>
                            <Text style={styles.matName} numberOfLines={1}>{material.name}</Text>
                            <View style={styles.matMeta}>
                                <Ionicons name="attach-outline" size={12} color="#6B7280" />
                                <Text style={styles.matMetaText}>{fileCount} file{fileCount !== 1 ? 's' : ''}</Text>
                                <Text style={styles.matDot}>·</Text>
                                <Text style={styles.matMetaText}>
                                    {new Date(material.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                    })}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
                    </View>

                    {/* Expandable description */}
                    <Animated.View style={{ maxHeight: maxH, opacity, overflow: 'hidden' }}>
                        <View style={styles.matDescWrap}>
                            {material.description ? (
                                <Text style={styles.matDesc}>{material.description}</Text>
                            ) : (
                                <Text style={[styles.matDesc, { fontStyle: 'italic', color: '#4B5563' }]}>
                                    No description provided.
                                </Text>
                            )}
                        </View>
                    </Animated.View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ResourcesScreen() {
    const { courses, materials, isLoading, getCourses, getMaterials } = useMaterialStore();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => { getCourses(); }, []);
    useEffect(() => {
        if (selectedCourse) getMaterials(selectedCourse.id);
        else getMaterials(null);
    }, [selectedCourse]);

    const onRefresh = async () => {
        await getCourses();
        if (selectedCourse) getMaterials(selectedCourse.id);
    };

    const handleSelectCourse = (course) => {
        setSelectedCourse(prev => prev?.id === course.id ? null : course);
    };

    // Find accent for selected course
    const selectedIdx = courses.findIndex(c => c.id === selectedCourse?.id);
    const selectedPalette = COURSE_COLORS[(selectedIdx >= 0 ? selectedIdx : 0) % COURSE_COLORS.length];

    const headerTranslate = scrollY.interpolate({
        inputRange: [0, 100], outputRange: [0, -20], extrapolate: 'clamp',
    });
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 80], outputRange: [1, 0.7], extrapolate: 'clamp',
    });

    const totalMaterials = courses.reduce((s, c) => s + (c.materials?.length || 0), 0);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* ── Hero Banner ── */}
            <LinearGradient colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.heroBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {/* Glow blob */}
                <View style={styles.glowBlob} />
                <View style={styles.glowBlob2} />

                <Animated.View style={{ transform: [{ translateY: headerTranslate }], opacity: headerOpacity }}>
                    {/* Eyebrow */}
                    <View style={styles.heroEyebrow}>
                        <View style={styles.premiumBadge}>
                            <Ionicons name="diamond" size={12} color={GOLD} />
                            <Text style={styles.premiumText}>PREMIUM RESOURCES</Text>
                        </View>
                    </View>

                    <Text style={styles.heroTitle}>Course{'\n'}Library</Text>
                    <Text style={styles.heroSub}>
                        Explore curated materials, guides & references for every course.
                    </Text>

                    {/* Stats row */}
                    <View style={styles.heroStatsRow}>
                        {[
                            { num: courses.length, label: 'Courses', color: '#fff' },
                            { num: totalMaterials, label: 'Materials', color: ACCENT },
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
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={ACCENT} />
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                style={styles.scrollView}>

                {/* ── Course list section ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                            <View style={styles.sectionHeaderIcon}>
                                <Ionicons name="library-outline" size={16} color={ACCENT} />
                            </View>
                            <Text style={styles.sectionTitle}>All Courses</Text>
                        </View>
                        <View style={styles.sectionCount}>
                            <Text style={styles.sectionCountText}>{courses.length}</Text>
                        </View>
                    </View>

                    {isLoading && courses.length === 0 ? (
                        <View style={styles.loadingBox}>
                            <View style={styles.loadingSpinner}>
                                <Ionicons name="sparkles" size={28} color={GOLD} />
                            </View>
                            <Text style={styles.loadingText}>Loading courses…</Text>
                        </View>
                    ) : courses.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="library-outline" size={36} color={ACCENT} />
                            </View>
                            <Text style={styles.emptyTitle}>No courses yet</Text>
                            <Text style={styles.emptyText}>Courses will appear here once available.</Text>
                        </View>
                    ) : (
                        courses.map((course, i) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                index={i}
                                isSelected={selectedCourse?.id === course.id}
                                onSelect={handleSelectCourse}
                            />
                        ))
                    )}
                </View>

                {/* ── Materials section (shown when course selected) ── */}
                {selectedCourse && (
                    <View style={styles.section}>
                        <View style={styles.materialsSectionHeader}>
                            <View style={styles.sectionHeaderLeft}>
                                <View style={[styles.sectionHeaderIcon,
                                { backgroundColor: selectedPalette.bg, borderColor: selectedPalette.border }]}>
                                    <Ionicons name="documents-outline" size={16} color={selectedPalette.accent} />
                                </View>
                                <View>
                                    <Text style={styles.sectionTitle}>Materials</Text>
                                    <Text style={styles.sectionSubtitle}>{selectedCourse.name}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedCourse(null)}>
                                <Ionicons name="close" size={14} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {isLoading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={selectedPalette.accent} />
                                <Text style={styles.loadingText}>Loading materials…</Text>
                            </View>
                        ) : materials.length === 0 ? (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIcon,
                                { backgroundColor: selectedPalette.bg, borderColor: selectedPalette.border }]}>
                                    <Ionicons name="document-outline" size={36} color={selectedPalette.accent} />
                                </View>
                                <Text style={styles.emptyTitle}>No materials yet</Text>
                                <Text style={styles.emptyText}>
                                    No materials have been added to this course yet.
                                </Text>
                            </View>
                        ) : (
                            materials.map((mat, i) => (
                                <MaterialCard
                                    key={mat.id}
                                    material={mat}
                                    index={i}
                                    courseAccent={selectedPalette.accent}
                                />
                            ))
                        )}
                    </View>
                )}

                {/* ── Help tip ── */}
                {!selectedCourse && courses.length > 0 && (
                    <View style={styles.tipCard}>
                        <Ionicons name="information-circle-outline" size={18} color={INDIGO} style={{ marginRight: 10 }} />
                        <Text style={styles.tipText}>
                            Tap a course to browse its materials and resources.
                        </Text>
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: DARK_BG },
    scrollView: { flex: 1 },

    // ── Hero Banner ───────────────────────────────────────────────────────────
    heroBanner: {
        paddingTop: 52, paddingHorizontal: 20,
        paddingBottom: 24, overflow: 'hidden',
    },
    glowBlob: {
        position: 'absolute', top: -60, right: -60,
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(16,185,129,0.07)',
    },
    glowBlob2: {
        position: 'absolute', bottom: -40, left: -40,
        width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(245,158,11,0.04)',
    },
    heroEyebrow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    premiumBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(245,158,11,0.12)',
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
    },
    premiumText: {
        color: GOLD, fontWeight: '800', fontSize: 10, letterSpacing: 1.5,
    },
    heroTitle: {
        fontSize: 38, fontWeight: '900', color: '#fff',
        letterSpacing: -1.5, marginBottom: 8, lineHeight: 44,
    },
    heroSub: {
        color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 21, marginBottom: 20,
    },
    heroStatsRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    },
    heroStat: { flex: 1, alignItems: 'center' },
    heroStatNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
    heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '600', letterSpacing: 0.5 },
    heroStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.08)' },

    // ── Section ───────────────────────────────────────────────────────────────
    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14,
    },
    materialsSectionHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14,
    },
    sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionHeaderIcon: {
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
    sectionSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 1 },
    sectionCount: {
        backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 10, paddingVertical: 3,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    sectionCountText: { color: ACCENT, fontWeight: '700', fontSize: 12 },
    clearBtn: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
    },

    // ── Course Card ───────────────────────────────────────────────────────────
    courseCardWrapper: { marginBottom: 10 },
    courseCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        borderRadius: 16, padding: 16,
        borderWidth: 1,
    },
    courseIconCircle: {
        width: 50, height: 50, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },
    courseCardBody: { flex: 1 },
    courseName: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
    courseDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 8 },
    courseFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    matCountBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
        borderWidth: 1,
    },
    matCountText: { fontSize: 11, fontWeight: '700' },
    selectedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    },
    selectedText: { fontSize: 11, fontWeight: '700' },

    // ── Material Card ─────────────────────────────────────────────────────────
    matCard: {
        backgroundColor: DARK_CARD, borderRadius: 14,
        borderLeftWidth: 4, borderWidth: 1, borderColor: DARK_BORDER,
        paddingHorizontal: 14, paddingTop: 14, paddingBottom: 14,
    },
    matHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    matIndexBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    matIndexText: { fontSize: 12, fontWeight: '800' },
    matHeaderText: { flex: 1 },
    matName: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 },
    matMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    matMetaText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
    matDot: { color: '#374151', fontSize: 11 },
    matDescWrap: {
        marginTop: 10, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    },
    matDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },

    // ── States ────────────────────────────────────────────────────────────────
    loadingBox: { paddingTop: 40, alignItems: 'center', gap: 12 },
    loadingSpinner: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: 'rgba(245,158,11,0.08)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)', marginBottom: 4,
    },
    loadingText: { color: '#6B7280', fontSize: 13 },
    emptyState: { paddingTop: 40, alignItems: 'center', gap: 8, paddingBottom: 20 },
    emptyIcon: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: 'rgba(16,185,129,0.08)', alignItems: 'center', justifyContent: 'center',
        marginBottom: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)',
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#9CA3AF' },
    emptyText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },

    // Tip
    tipCard: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginTop: 8, marginBottom: 20,
        backgroundColor: 'rgba(99,102,241,0.06)',
        borderRadius: 14, padding: 14,
        borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)',
    },
    tipText: { flex: 1, fontSize: 13, color: '#9CA3AF', lineHeight: 18 },
});
