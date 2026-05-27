import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LEVEL, STATUS } from '../../constants/batchConfig';
import styles from '../../../app/styles/batchStyle';

const FeaturedCard = ({ item, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const lv = LEVEL[item.level] || LEVEL.BEGINNER;
    const st = STATUS[item.status] || STATUS.UPCOMING;
    const spotsLeft = Math.max(0, (item.maxStudents || 30) - (item.enrollments?.length || 0));

    const onIn = () => Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 24 }).start();
    const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={styles.featuredOuter}>
                <LinearGradient colors={[lv.gradT, lv.gradB, '#080C14']} style={styles.featuredCard}>
                    {/* Accent glow */}
                    <View style={[styles.featuredGlow, { backgroundColor: lv.color + '15' }]} />

                    {/* Top row */}
                    <View style={styles.featuredTopRow}>
                        <View style={[styles.statusChip, { backgroundColor: st.glow }]}>
                            <View style={[styles.liveDot, { backgroundColor: st.dot }]} />
                            <Text style={[styles.statusChipText, { color: st.color }]}>{st.label}</Text>
                        </View>
                    </View>

                    <Text style={styles.featuredName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.featuredTagline}>{lv.tagline}</Text>

                    {/* Stats */}
                    <View style={styles.featuredStats}>
                        <View style={styles.statBlock}>
                            <Text style={[styles.statNum, { color: lv.color }]}>{item.maxStudents}</Text>
                            <Text style={styles.statLabel}>Max seats</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBlock}>
                            <Text style={[styles.statNum, { color: spotsLeft < 5 ? '#F87171' : '#fff' }]}>{spotsLeft}</Text>
                            <Text style={styles.statLabel}>Spots left</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBlock}>
                            <Text style={[styles.statNum, { color: '#fff' }]}>{item.language}</Text>
                            <Text style={styles.statLabel}>Language</Text>
                        </View>
                    </View>

                    <View style={[styles.featuredDivider, { backgroundColor: lv.color + '33' }]} />

                    {/* Footer */}
                    <View style={styles.featuredFooter}>
                        <View>
                            <Text style={styles.featuredPriceLabel}>Batch Fee</Text>
                            <Text style={[styles.featuredPrice, { color: lv.color }]}>
                                {item.feeAmount > 0 ? `${item.feeAmount} ETB` : 'Free'}
                            </Text>
                        </View>
                        <LinearGradient
                            colors={[lv.color, lv.color + 'bb']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.featuredBtn}
                        >
                            <Text style={styles.featuredBtnText}>Enroll Now</Text>
                            <Ionicons name="arrow-forward-circle" size={18} color="#000" />
                        </LinearGradient>
                    </View>

                    {/* FEATURED ribbon */}
                    <View style={[styles.ribbon, { backgroundColor: lv.color }]}>
                        <Text style={styles.ribbonText}>⭐ FEATURED</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default FeaturedCard;