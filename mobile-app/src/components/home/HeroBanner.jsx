import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/theme';
import styles from '../../../app/styles/homeStyle';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const HeroBanner = ({
    user,
    overallProgress,
    streakDays,
    completedLessons,
    unreadCount,
    onMenuPress,
    onNotificationPress,
    onProfilePress
}) => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: overallProgress / 100,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [overallProgress]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const getTimeOfDay = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Morning';
        if (h < 17) return 'Afternoon';
        return 'Evening';
    };

    return (
        <LinearGradient
            colors={['#0A2540', '#0D1B2A', '#080C14']}
            style={styles.heroBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Decorative glow blob */}
            <View style={styles.glowBlob} />

            {/* Top bar */}
            <View style={styles.topBar}>
                <View style={styles.topBarLeft}>
                    <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                        <Ionicons name="menu" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
                        <Text style={styles.userName}>{user?.firstName || 'Learner'}</Text>
                        <Text style={styles.subGreeting}>Keep up the great work!</Text>
                    </View>
                </View>
                <View style={styles.topBarRight}>
                    <TouchableOpacity style={styles.notifBtn} onPress={onNotificationPress}>
                        <Ionicons name="notifications-outline" size={20} color="#fff" />
                        {unreadCount > 0 && <View style={styles.notifDot} />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onProfilePress}>
                        <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.avatarRing}>
                            <View style={styles.avatarInner}>
                                <Text style={styles.avatarText}>
                                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Progress hero card */}
            <View style={styles.heroProgressCard}>
                <View style={styles.heroProgressLeft}>
                    <Text style={styles.heroProgressLabel}>OVERALL PROGRESS</Text>
                    <Text style={styles.heroProgressValue}>{Math.round(overallProgress)}%</Text>
                    <View style={styles.heroStatRow}>
                        <Ionicons name="flame" size={14} color="#F59E0B" />
                        <Text style={styles.heroStatText}>{streakDays || 1} day streak</Text>
                        <View style={styles.dotSep} />
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                        <Text style={styles.heroStatText}>{completedLessons || 0} lessons</Text>
                    </View>
                </View>
                <View style={styles.circleProgressWrapper}>
                    <CircleProgress value={overallProgress} />
                </View>
            </View>

            {/* Progress bar */}
            <View style={styles.heroBarBg}>
                <Animated.View style={[styles.heroBarFill, { width: progressWidth }]} />
            </View>
        </LinearGradient>
    );
};

/* ── CircleProgress Sub-component ── */
function CircleProgress({ value, loading = false }) {
    const size = 56;
    const strokeWidth = 4;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!loading) {
            Animated.timing(animatedValue, {
                toValue: value,
                duration: 1000,
                useNativeDriver: false,
            }).start();
        }
    }, [value, loading]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    if (loading) {
        return (
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle cx={center} cy={center} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="transparent" />
                    <AnimatedCircle cx={center} cy={center} r={radius} stroke={COLORS.primary} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference * 0.7} strokeLinecap="round" fill="transparent" />
                </Svg>
                <View style={{ position: 'absolute' }}>
                    <Ionicons name="sync" size={16} color={COLORS.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx={center} cy={center} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="transparent" />
                <AnimatedCircle cx={center} cy={center} r={radius} stroke={COLORS.primary} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" />
            </Svg>
            <View style={{ position: 'absolute' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{Math.round(value)}%</Text>
            </View>
        </View>
    );
}

export default HeroBanner;