import React, { useRef, useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    StatusBar, Animated, Dimensions, TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../src/stores/chatStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { COLORS, SPACING } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumMenu from '../../src/components/PremiumMenu';
import styles from '../styles/aiConversationStyle';

const { width } = Dimensions.get('window');

const topics = [
    { id: '1', emoji: '☕', title: 'Coffee Shop', color: ['#4F46E5', '#7C3AED'], desc: 'Order & chat' },
    { id: '2', emoji: '✈️', title: 'Airport', color: ['#0EA5E9', '#2563EB'], desc: 'Check-in flow' },
    { id: '3', emoji: '💼', title: 'Interview', color: ['#D97706', '#DC2626'], desc: 'Ace the talk' },
    { id: '4', emoji: '🍔', title: 'Restaurant', color: ['#16A34A', '#059669'], desc: 'Dine & order' },
    { id: '5', emoji: '👋', title: 'Greetings', color: ['#DB2777', '#9333EA'], desc: 'Make friends' },
    { id: '6', emoji: '💬', title: 'Free Talk', color: ['#F59E0B', '#EF4444'], desc: 'Open practice' },
];

function PulseCircle() {
    const pulse = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulse, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(opacity, { toValue: 0.2, duration: 1000, useNativeDriver: true }),
                    Animated.timing(opacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
                ]),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }], opacity }]} />
    );
}

export default function AIConversationScreen() {
    const router = useRouter();
    const { conversations, setCurrentConversation } = useChatStore();
    const { enrollments, premiumUnlocked } = useBatchStore();
    const [customTopic, setCustomTopic] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');

    const startConversation = (topic) => {
        router.push({ pathname: '/chat', params: { topic: topic.title } });
    };

    const resumeConversation = (conv) => {
        setCurrentConversation(conv);
        router.push({ pathname: '/chat', params: { topic: conv.startingTopic } });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

            {/* Hero Banner — matches Home screen */}
            <LinearGradient
                colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.heroBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.glowBlob} />
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        {isPremium && (
                            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                                <Ionicons name="menu" size={26} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <View>
                            <Text style={styles.headerTitle}>AI Tutor</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.statusText}>Online · Ready to practice</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.historyBtn}>
                        <Ionicons name="time-outline" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Card */}
                <View style={styles.heroWrapper}>
                    <LinearGradient
                        colors={['rgba(16,185,129,0.18)', 'rgba(16,185,129,0.04)', 'transparent']}
                        style={styles.heroCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.aiAvatarLarge}>
                            <PulseCircle />
                            <LinearGradient
                                colors={[COLORS.primary, '#059669']}
                                style={styles.avatarInner}
                            >
                                <Ionicons name="sparkles" size={32} color="#fff" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.heroHeading}>Practice Real Conversations</Text>
                        <Text style={styles.heroSubtext}>
                            Talk with your AI tutor in a safe, stress-free space. Pick a topic and start speaking naturally.
                        </Text>
                    </LinearGradient>
                </View>

                {/* Custom Topic Input */}
                <View style={styles.customTopicCard}>
                    <View style={styles.customTopicLabelRow}>
                        <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.customTopicLabel}>Or talk about anything you want</Text>
                    </View>
                    <View style={styles.customInputRow}>
                        <TextInput
                            style={styles.customInput}
                            value={customTopic}
                            onChangeText={setCustomTopic}
                            placeholder="Type any topic... e.g. Climate Change"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            returnKeyType="go"
                            onSubmitEditing={() => customTopic.trim() && startConversation({ title: customTopic.trim() })}
                        />
                        <TouchableOpacity
                            style={[styles.goButton, !customTopic.trim() && styles.goButtonDisabled]}
                            onPress={() => customTopic.trim() && startConversation({ title: customTopic.trim() })}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={customTopic.trim() ? [COLORS.primary, '#059669'] : ['#1F2937', '#111827']}
                                style={styles.goButtonGradient}
                            >
                                <Ionicons name="arrow-forward" size={18} color={customTopic.trim() ? '#fff' : '#4B5563'} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Conversations */}
                {conversations.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Practice</Text>
                            <Text style={styles.sectionCount}>{conversations.length} sessions</Text>
                        </View>
                        {conversations.slice(0, 3).map((conv) => (
                            <TouchableOpacity
                                key={conv.id}
                                style={styles.historyCard}
                                onPress={() => resumeConversation(conv)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.05)']}
                                    style={styles.historyIconBg}
                                >
                                    <Ionicons name="chatbubbles" size={20} color={COLORS.primary} />
                                </LinearGradient>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyTitle}>{conv.startingTopic}</Text>
                                    <Text style={styles.historyDate}>
                                        {new Date(conv.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                                <View style={styles.resumeChip}>
                                    <Text style={styles.resumeText}>Resume</Text>
                                    <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Topic Grid */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Choose a Topic</Text>
                    </View>
                    <View style={styles.grid}>
                        {topics.map((topic) => (
                            <TouchableOpacity
                                key={topic.id}
                                style={styles.topicCard}
                                onPress={() => startConversation(topic)}
                                activeOpacity={0.75}
                            >
                                <LinearGradient
                                    colors={topic.color}
                                    style={styles.topicGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                                    <Text style={styles.topicTitle}>{topic.title}</Text>
                                    <Text style={styles.topicDesc}>{topic.desc}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Bottom Tip */}
                <View style={styles.tipCard}>
                    <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
                    <Text style={styles.tipText}>
                        Tip: Try speaking out loud for the best practice experience.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
