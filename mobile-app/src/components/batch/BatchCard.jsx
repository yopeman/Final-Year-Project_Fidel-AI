import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../constants/theme';
import { LEVEL, STATUS, formatDate, daysUntil } from '../../constants/batchConfig';
import styles from '../../../app/styles/batchStyle';    

const BatchCard = ({ item, onPress, isLast }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const lv = LEVEL[item.level] || LEVEL.BEGINNER;
    const st = STATUS[item.status] || STATUS.UPCOMING;
    const enrollCount = item.enrollments?.length || 0;
    const spotsLeft = Math.max(0, item.maxStudents - enrollCount);
    const fillPct = Math.min((enrollCount / item.maxStudents) * 100, 100);
    const isFull = spotsLeft === 0;
    const isUrgent = !isFull && spotsLeft <= 5;
    const isDisabled = isFull || item.status === 'CANCELLED';
    const startDate = formatDate(item.startDate);
    const days = daysUntil(item.startDate);

    const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 20 }).start();
    const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

    return (
        <Animated.View style={[{ transform: [{ scale }] }, !isLast && { marginBottom: SPACING.md }]}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={!isDisabled ? onPress : undefined}
                onPressIn={!isDisabled ? onIn : undefined}
                onPressOut={!isDisabled ? onOut : undefined}
            >
                <View style={[styles.card, isDisabled && styles.cardDisabled]}>
                    {/* Accent bar */}
                    <View style={[styles.accentBar, { backgroundColor: lv.color }]} />

                    <View style={styles.cardInner}>
                        {/* Top row */}
                        <View style={styles.cardTop}>
                            <View style={styles.cardTopMid}>
                                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                                <View style={styles.cardMeta}>
                                    <Ionicons name="globe-outline" size={12} color={COLORS.textSecondary} />
                                    <Text style={styles.cardMetaText}>{item.language}</Text>
                                    <Text style={styles.cardMetaDot}>·</Text>
                                    <View style={[styles.miniLevelBadge, { backgroundColor: lv.color + '22' }]}>
                                        <Text style={[styles.miniLevelText, { color: lv.color }]}>{lv.label}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.statusPill, { backgroundColor: st.glow }]}>
                                <View style={[styles.statusPillDot, { backgroundColor: st.dot }]} />
                                <Text style={[styles.statusPillText, { color: st.color }]}>{st.label}</Text>
                            </View>
                        </View>

                        {item.description ? (
                            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                        ) : null}

                        {/* Date / urgency */}
                        <View style={styles.cardDateRow}>
                            {startDate && (
                                <View style={styles.dateTag}>
                                    <Ionicons name="calendar-outline" size={12} color={COLORS.primary} />
                                    <Text style={styles.dateTagText}>Starts {startDate}</Text>
                                    {days !== null && days > 0 && days <= 14 && (
                                        <Text style={styles.dateSoon}> · {days}d away!</Text>
                                    )}
                                </View>
                            )}
                            {isUrgent && (
                                <View style={styles.urgencyTag}>
                                    <Ionicons name="flame" size={12} color="#F87171" />
                                    <Text style={styles.urgencyText}>Only {spotsLeft} left!</Text>
                                </View>
                            )}
                        </View>

                        {/* Fill bar */}
                        <View style={styles.fillRow}>
                            <View style={styles.fillBg}>
                                <LinearGradient
                                    colors={isFull ? ['#EF4444', '#B91C1C'] : [lv.color, lv.color + 'aa']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={[styles.fillBar, { width: `${Math.max(fillPct, 2)}%` }]}
                                />
                            </View>
                            <Text style={styles.fillText}>
                                {isFull ? 'Full' : `${spotsLeft}/${item.maxStudents} open`}
                            </Text>
                        </View>

                        {/* Bottom */}
                        <View style={styles.cardBottom}>
                            <View>
                                <Text style={styles.priceSmallLabel}>Fee</Text>
                                <Text style={[styles.priceVal, { color: lv.color }]}>
                                    {item.feeAmount > 0 ? `${item.feeAmount} ETB` : 'FREE'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.cardCTA,
                                    isDisabled
                                        ? item.status === 'CANCELLED' ? styles.cardCTACancelled : styles.cardCTAFull
                                        : { backgroundColor: lv.color },
                                ]}
                                onPress={!isDisabled ? onPress : undefined}
                                disabled={isDisabled}
                            >
                                {isDisabled ? (
                                    <Text style={styles.cardCTATextDim}>
                                        {item.status === 'CANCELLED' ? 'Cancelled' : 'Full'}
                                    </Text>
                                ) : (
                                    <>
                                        <Text style={styles.cardCTAText}>View</Text>
                                        <Ionicons name="chevron-forward" size={14} color="#000" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default BatchCard;