import React, { useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    RefreshControl, StatusBar, Dimensions
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumMenu from '../../src/components/PremiumMenu';
import PremiumUpgradeModal from '../../src/components/PremiumUpgradeModal';
import styles from '../styles/modulesStyle';

const { width } = Dimensions.get('window');

const LESSON_TYPE_META = {
    QUIZ: { icon: 'help-circle', label: 'Quiz' },
    VIDEO: { icon: 'play-circle', label: 'Video' },
    DEFAULT: { icon: 'book-outline', label: 'Lesson' },
};

function getLessonMeta(type) {
    return LESSON_TYPE_META[type] || LESSON_TYPE_META.DEFAULT;
}

const ModulesScreen = () => {
    const router = useRouter();
    const { modules, getModules, isLoading } = useLearningStore();
    const { enrollments, premiumUnlocked } = useBatchStore();
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [upgradeModalVisible, setUpgradeModalVisible] = React.useState(false);

    const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');

    useFocusEffect(
        useCallback(() => { getModules(); }, [])
    );

    const renderLesson = (lesson, lessonIndex, moduleIndex, currentModule) => {
        const isCompleted = lesson.isCompleted;
        let isLocked = false;

        if (isCompleted) {
            isLocked = false;
        } else if (moduleIndex === 0 && lessonIndex === 0) {
            isLocked = false;
        } else if (lessonIndex > 0) {
            isLocked = !currentModule.lessons[lessonIndex - 1].isCompleted;
        } else if (moduleIndex > 0) {
            const prevModule = modules[moduleIndex - 1];
            if (prevModule && prevModule.lessons && prevModule.lessons.length > 0) {
                isLocked = !prevModule.lessons[prevModule.lessons.length - 1].isCompleted;
            }
        }
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
                        <Ionicons name={isLocked ? 'lock-closed' : iconName} size={17} color={isLocked ? '#4B5563' : iconColor} />
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
                    {isLocked && (
                        <View style={styles.lockPill}>
                            <Text style={styles.lockPillText}>Next Up</Text>
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
                    {item.lessons?.map((lesson, li) => renderLesson(lesson, li, index, item))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
            <PremiumUpgradeModal visible={upgradeModalVisible} onClose={() => setUpgradeModalVisible(false)} />

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
                {isPremium ? (
                    <View style={styles.premiumBanner}>
                        <Ionicons name="sparkles" size={13} color={COLORS.primary} />
                        <Text style={styles.premiumBannerText}>All content unlocked</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.premiumBanner, { borderColor: '#F59E0B' }]}
                        onPress={() => setUpgradeModalVisible(true)}
                    >
                        <Ionicons name="lock-closed" size={13} color="#F59E0B" />
                        <Text style={[styles.premiumBannerText, { color: '#F59E0B' }]}>Unlock Premium Content</Text>
                    </TouchableOpacity>
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

export default ModulesScreen;
