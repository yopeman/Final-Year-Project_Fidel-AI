import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, StatusBar, Animated, RefreshControl, Linking
} from 'react-native';
import { useMaterialStore } from '../../src/stores/materialStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../src/constants/theme';
import { API_BASE_URL } from '../../src/constants';
import { useBatchStore } from '../../src/stores/batchStore';
import PremiumMenu from '../../src/components/PremiumMenu';
import styles, { DARK_BG, DARK_CARD, DARK_BORDER, ACCENT, GOLD, INDIGO } from '../styles/resourcesStyle';

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
function MaterialCard({ material, index, courseAccent, onFilePress }) {
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

    const maxH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 500] });
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

                    {/* Expandable description and files */}
                    <Animated.View style={{ maxHeight: maxH, opacity, overflow: 'hidden' }}>
                        <View style={styles.matDescWrap}>
                            {material.description ? (
                                <Text style={styles.matDesc}>{material.description}</Text>
                            ) : (
                                <Text style={[styles.matDesc, { fontStyle: 'italic', color: '#4B5563' }]}>
                                    No description provided.
                                </Text>
                            )}

                            {material.files?.length > 0 && (
                                <View style={styles.fileList}>
                                    {material.files.map((file, i) => (
                                        <TouchableOpacity
                                            key={`${file.id}-${i}`}
                                            style={[styles.fileItem, { borderLeftColor: accent }]}
                                            onPress={() => onFilePress(file)}
                                        >
                                            <View style={styles.fileIconWrapper}>
                                                <Ionicons
                                                    name={file.fileExtension?.includes('pdf') ? 'document-text' : 'document'}
                                                    size={18}
                                                    color={accent}
                                                />
                                            </View>
                                            <View style={styles.fileInfo}>
                                                <Text style={styles.fileName} numberOfLines={1}>{file.fileName}</Text>
                                                <Text style={styles.fileSize}>
                                                    {file.fileExtension?.toUpperCase()} • {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Tap to open'}
                                                </Text>
                                            </View>
                                            <Ionicons name="eye-outline" size={18} color="rgba(255,255,255,0.3)" />
                                        </TouchableOpacity>
                                    ))}
                                </View>
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
    const { activeBatchId } = useBatchStore();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        getCourses(activeBatchId);
    }, [activeBatchId]);

    useEffect(() => {
        if (selectedCourse) getMaterials(selectedCourse.id);
        else getMaterials(null);
    }, [selectedCourse]);

    const onRefresh = async () => {
        await getCourses(activeBatchId);
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

            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

            {/* ── Hero Banner ── */}
            <LinearGradient colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.heroBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {/* Glow blob */}
                <View style={styles.glowBlob} />
                <View style={styles.glowBlob2} />

                {/* Header Row with Menu */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={() => setMenuVisible(true)}
                        style={{
                            width: 40, height: 40, borderRadius: 12,
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="menu" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>

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
                                key={`${course.id}-${i}`}
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
                                    key={`${mat.id}-${i}`}
                                    material={mat}
                                    index={i}
                                    courseAccent={selectedPalette.accent}
                                    onFilePress={(file) => {
                                        if (file.filePath) {
                                            const baseUrl = API_BASE_URL.replace('/graphql', '');
                                            Linking.openURL(`${baseUrl}/${file.filePath}`);
                                        }
                                    }}
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

