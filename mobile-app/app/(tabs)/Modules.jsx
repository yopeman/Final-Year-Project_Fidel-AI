import React, { useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, StatusBar, Dimensions
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { useAuthStore } from '../../src/stores/authStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumMenu from '../../src/components/PremiumMenu';

const { width } = Dimensions.get('window');

const LESSON_TYPE_META = {
    QUIZ: { icon: 'help-circle', label: 'Quiz' },
    VIDEO: { icon: 'play-circle', label: 'Video' },
    DEFAULT: { icon: 'book-outline', label: 'Lesson' },
};

function getLessonMeta(type) {
    return LESSON_TYPE_META[type] || LESSON_TYPE_META.DEFAULT;
}

export default function ModulesScreen() {
    const router = useRouter();
    const { modules, getModules, isLoading } = useLearningStore();
    const { enrollments, premiumUnlocked } = useBatchStore();
    const { hasFeature } = useAuthStore();
    const [menuVisible, setMenuVisible] = React.useState(false);

    const isPremium = hasFeature('modules') || premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');

    useFocusEffect(
        useCallback(() => { getModules(); }, [])
    );

    const renderLesson = (lesson, lessonIndex) => {
        const isCompleted = lesson.isCompleted;
        const isLocked = lesson.isLocked && !isPremium;
        const meta = getLessonMeta(lesson.type);

        let iconColor = '#fff';
        let iconName = meta.icon;
        let iconBg = ['#4F46E5', '#6366F1'];

        if (isCompleted) {
            iconBg = [COLORS.primary, '#059669'];
            iconName = 'checkmark-circle';
        } else if (isLocked) {
            iconBg = ['#1F2937', '#374151'];
            iconColor = '#4B5563';
            iconName = 'lock-closed';
        } else if (lesson.type === 'QUIZ') {
            iconBg = ['#D97706', '#F59E0B'];
        }

        return (
            <TouchableOpacity
                key={lesson.id || lessonIndex}
                style={[styles.lessonItem, isLocked && styles.lessonLocked]}
                onPress={() => {
                    if (isLocked) return;
                    if (lesson.type === 'QUIZ') {
                        router.push(`/learn/quiz/${lesson.id}`);
                    } else {
                        router.push(`/learn/${lesson.id}`);
                    }
                }}
                activeOpacity={isLocked ? 1 : 0.75}
            >
                {/* Connector line */}
                {lessonIndex > 0 && <View style={styles.connectorLine} />}

                <View style={styles.lessonRow}>
                    {/* Icon */}
                    <LinearGradient colors={iconBg} style={styles.lessonIconWrap}>
                        <Ionicons name={iconName} size={17} color={iconColor} />
                    </LinearGradient>

                    {/* Text */}
                    <View style={styles.lessonTextWrap}>
                        <Text style={[styles.lessonTitle, isLocked && styles.lockedText]} numberOfLines={1}>
                            {lesson.title}
                        </Text>
                        <View style={styles.lessonMetaRow}>
                            <Text style={styles.lessonTypeTag}>{meta.label}</Text>
                            <View style={styles.dotSep} />
                            <Ionicons name="time-outline" size={11} color="#6B7280" />
                            <Text style={styles.lessonDur}>10 min</Text>
                        </View>
                    </View>

                    {/* Right state */}
                    {isCompleted && (
                        <View style={styles.completedBadge}>
                            <Text style={styles.completedBadgeText}>Done</Text>
                        </View>
                    )}
                    {!isCompleted && !isLocked && (
                        <Ionicons name="chevron-forward" size={16} color="#4B5563" />
                    )}
                    {isLocked && !isPremium && (
                        <View style={styles.lockPill}>
                            <Text style={styles.lockPillText}>Premium</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderModule = ({ item, index }) => {
        const completedCount = item.lessons?.filter(l => l.isCompleted).length || 0;
        const totalCount = item.lessons?.length || 0;
        const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        const moduleColors = [
            ['#4F46E5', '#6366F1'],
            ['#0EA5E9', '#2563EB'],
            ['#D97706', '#F59E0B'],
            ['#16A34A', '#10B981'],
            ['#DB2777', '#9333EA'],
            ['#F59E0B', '#EF4444'],
        ];
        const [c1, c2] = moduleColors[index % moduleColors.length];

        return (
            <View style={styles.moduleCard}>
                {/* Module header */}
                <LinearGradient
                    colors={[c1 + '28', c2 + '10']}
                    style={styles.moduleHeader}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.moduleHeaderLeft}>
                        <LinearGradient colors={[c1, c2]} style={styles.moduleNumberBadge}>
                            <Text style={styles.moduleNumber}>{index + 1}</Text>
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.moduleLabel}>MODULE {index + 1}</Text>
                            <Text style={styles.moduleName} numberOfLines={1}>{item.name}</Text>
                        </View>
                    </View>
                    <View style={styles.moduleProgressInfo}>
                        <Text style={[styles.moduleProgressText, { color: c1 }]}>
                            {completedCount}/{totalCount}
                        </Text>
                        <Text style={styles.moduleDoneLabel}>done</Text>
                    </View>
                </LinearGradient>

                {/* Progress bar */}
                <View style={styles.moduleBarBg}>
                    <LinearGradient
                        colors={[c1, c2]}
                        style={[styles.moduleBarFill, { width: `${pct}%` }]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    />
                </View>

                {/* Lessons */}
                <View style={styles.lessonList}>
                    {item.lessons?.map((lesson, li) => renderLesson(lesson, li))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

            {/* Header */}
            <LinearGradient
                colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.heroBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.glowBlob} />
                <View style={styles.headerTopRow}>
                    {isPremium && (
                        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                            <Ionicons name="menu" size={26} color="#fff" />
                        </TouchableOpacity>
                    )}
                    <View style={{ flex: 1, marginLeft: isPremium ? 12 : 0 }}>
                        <Text style={styles.headerTitle}>Curriculum</Text>
                        <Text style={styles.headerSubtitle}>All your lessons in one place</Text>
                    </View>
                </View>
                {isPremium && (
                    <View style={styles.premiumBanner}>
                        <Ionicons name="sparkles" size={13} color={COLORS.primary} />
                        <Text style={styles.premiumBannerText}>All content unlocked</Text>
                    </View>
                )}
            </LinearGradient>

            <FlatList
                data={modules}
                renderItem={renderModule}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={getModules}
                        tintColor={COLORS.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrap}>
                            <Ionicons name="library-outline" size={44} color="#374151" />
                        </View>
                        <Text style={styles.emptyTitle}>No modules yet</Text>
                        <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
                        <TouchableOpacity style={styles.reloadBtn} onPress={getModules}>
                            <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.reloadBtnGrad}>
                                <Text style={styles.reloadBtnText}>Reload</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080C14' },

    // Hero / Header
    heroBanner: {
        paddingTop: 48,
        paddingHorizontal: 20,
        paddingBottom: 24,
        overflow: 'hidden',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    glowBlob: {
        position: 'absolute', top: -30, right: -30,
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(16,185,129,0.1)',
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 },
    premiumBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: 12, alignSelf: 'flex-start',
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    },
    premiumBannerText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

    // List
    listContent: { paddingVertical: 20, paddingBottom: 40 },

    // Module Card
    moduleCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    },
    moduleHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    moduleHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    moduleNumberBadge: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    moduleNumber: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    moduleLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    moduleName: { color: '#fff', fontWeight: '700', fontSize: 15, marginTop: 2 },
    moduleProgressInfo: { alignItems: 'flex-end' },
    moduleProgressText: { fontSize: 18, fontWeight: '800' },
    moduleDoneLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },

    // Module progress bar
    moduleBarBg: {
        height: 3, backgroundColor: 'rgba(255,255,255,0.05)',
    },
    moduleBarFill: { height: '100%' },

    // Lessons
    lessonList: { paddingTop: 4, paddingBottom: 8 },
    lessonItem: {
        paddingHorizontal: 16, paddingVertical: 12,
        position: 'relative',
    },
    lessonLocked: { opacity: 0.55 },
    connectorLine: {
        position: 'absolute', top: 0, left: 36,
        width: 1, height: 12,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    lessonIconWrap: {
        width: 34, height: 34, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    lessonTextWrap: { flex: 1 },
    lessonTitle: { color: '#E5E7EB', fontSize: 14, fontWeight: '600' },
    lockedText: { color: '#4B5563' },
    lessonMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
    lessonTypeTag: { color: '#6B7280', fontSize: 11, fontWeight: '600' },
    dotSep: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#374151' },
    lessonDur: { color: '#6B7280', fontSize: 11 },
    completedBadge: {
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
    },
    completedBadgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
    lockPill: {
        backgroundColor: 'rgba(245,158,11,0.1)',
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
    },
    lockPillText: { color: '#F59E0B', fontSize: 10, fontWeight: '700' },

    // Empty state
    emptyState: {
        paddingTop: 80, paddingHorizontal: 40, alignItems: 'center',
    },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.04)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
    emptySubtitle: { color: '#6B7280', fontSize: 14, marginBottom: 28 },
    reloadBtn: { borderRadius: 50, overflow: 'hidden' },
    reloadBtnGrad: { paddingHorizontal: 32, paddingVertical: 14 },
    reloadBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
