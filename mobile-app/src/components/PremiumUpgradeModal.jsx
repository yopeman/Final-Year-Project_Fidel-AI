import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    Animated, Dimensions, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const PREMIUM_FEATURES = [
    {
        icon: 'videocam',
        title: 'Live Classes',
        desc: 'Interactive real-time sessions with expert instructors',
        color: '#3B82F6'
    },
    {
        icon: 'chatbubbles',
        title: 'Batch Lounge',
        desc: 'Private community for your cohort to discuss and collaborate',
        color: '#10B981'
    },
    {
        icon: 'book',
        title: 'Premium Resources',
        desc: 'AI-curated depth lessons, vocabulary sheets, and more',
        color: '#F59E0B'
    },
    {
        icon: 'analytics',
        title: 'Personalized Roadmap',
        desc: 'Custom-built learning path based on your goals',
        color: '#8B5CF6'
    }
];

export default function PremiumUpgradeModal({ visible, onClose }) {
    const router = useRouter();
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const handleUnlock = () => {
        onClose();
        // Give time for modal to close
        setTimeout(() => {
            router.push('/(tabs)/Batch');
        }, 100);
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View style={[
                    styles.modalContainer,
                    {
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}>
                    <LinearGradient
                        colors={['#111827', '#0F172A']}
                        style={styles.gradientBg}
                    >
                        {/* Header Image/Icon Section */}
                        <View style={styles.headerIconSection}>
                            <LinearGradient
                                colors={['#F59E0B', '#F97316']}
                                style={styles.iconCircle}
                            >
                                <Ionicons name="sparkles" size={32} color="#fff" />
                            </LinearGradient>
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                <Ionicons name="close" size={24} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.title}>Unlock Premium</Text>
                        <Text style={styles.subtitle}>
                            Join a batch and get full access to all professional features.
                        </Text>

                        <ScrollView
                            style={styles.featuresList}
                            showsVerticalScrollIndicator={false}
                        >
                            {PREMIUM_FEATURES.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <View style={[styles.featureIconWrap, { backgroundColor: feature.color + '20' }]}>
                                        <Ionicons name={feature.icon} size={20} color={feature.color} />
                                    </View>
                                    <View style={styles.featureText}>
                                        <Text style={styles.featureTitle}>{feature.title}</Text>
                                        <Text style={styles.featureDesc}>{feature.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        {/* CTA Footer */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.ctaButton}
                                onPress={handleUnlock}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#F59E0B', '#D97706']}
                                    style={styles.ctaGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.ctaText}>Explore Batches</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#0F172A" />
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.laterBtn} onPress={onClose}>
                                <Text style={styles.laterText}>Maybe Later</Text>
                            </TouchableOpacity>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    gradientBg: {
        padding: 24,
    },
    headerIconSection: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    featuresList: {
        maxHeight: 300,
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 16,
    },
    featureIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 18,
    },
    footer: {
        gap: 12,
    },
    ctaButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    ctaText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: 'bold',
    },
    laterBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    laterText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '600',
    }
});
