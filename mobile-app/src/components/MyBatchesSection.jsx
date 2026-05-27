import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import styles from '../../app/styles/homeStyle';

const { width } = Dimensions.get('window');

const MyBatchesSection = ({
    enrolledBatches,
    groupedBatches,
    availableMonths,
    selectedMonth,
    onMonthSelect,
    onBatchPress,
    onSeeAllPress
}) => {
    const filteredMonths = React.useMemo(() => {
        if (selectedMonth === 'all') {
            return Object.entries(groupedBatches);
        }
        return Object.entries(groupedBatches).filter(([month]) =>
            month.toLowerCase().includes(selectedMonth.toLowerCase())
        );
    }, [groupedBatches, selectedMonth]);

    if (enrolledBatches.length === 0) {
        return (
            <View style={[styles.section, { marginBottom: 40, alignItems: 'center' }]}>
                <View style={[styles.batchCard, { width: '100%', marginRight: 0 }]}>
                    <LinearGradient
                        colors={['rgba(245,158,11,0.1)', 'rgba(245,158,11,0.02)']}
                        style={[styles.batchGradient, { alignItems: 'center', padding: 24 }]}
                    >
                        <Ionicons name="school-outline" size={48} color="#F59E0B" style={{ marginBottom: 12 }} />
                        <Text style={[styles.batchName, { textAlign: 'center' }]}>No Batches Yet</Text>
                        <Text style={[styles.heroStatText, { textAlign: 'center', marginBottom: 16 }]}>
                            Join a batch to start learning with live classes
                        </Text>
                        <TouchableOpacity
                            style={[styles.batchLevelPill, { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary }]}
                            onPress={onSeeAllPress}
                        >
                            <Text style={[styles.batchLevelText, { color: COLORS.primary }]}>
                                Browse Batches →
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.section, { marginBottom: 40 }]}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>My Batches ({enrolledBatches.length})</Text>
                <TouchableOpacity onPress={onSeeAllPress}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            {/* Month Filter */}
            {availableMonths.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <TouchableOpacity
                        style={[
                            styles.batchLevelPill,
                            { marginRight: 8 },
                            selectedMonth === 'all' && { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary }
                        ]}
                        onPress={() => onMonthSelect('all')}
                    >
                        <Text style={[
                            styles.batchLevelText,
                            selectedMonth === 'all' && { color: COLORS.primary }
                        ]}>All</Text>
                    </TouchableOpacity>

                    {availableMonths.map((month) => (
                        <TouchableOpacity
                            key={month}
                            style={[
                                styles.batchLevelPill,
                                { marginRight: 8 },
                                selectedMonth === month && { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary }
                            ]}
                            onPress={() => onMonthSelect(month)}
                        >
                            <Text style={[
                                styles.batchLevelText,
                                selectedMonth === month && { color: COLORS.primary }
                            ]}>
                                {month.charAt(0).toUpperCase() + month.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Batches Horizontal Scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.batchScroll}>
                {filteredMonths.length > 0 ? (
                    filteredMonths.map(([monthYear, monthBatches]) =>
                        monthBatches.map((batch) => (
                            <TouchableOpacity
                                key={batch.id}
                                style={styles.batchCard}
                                onPress={() => onBatchPress(batch.id)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.05)']}
                                    style={styles.batchGradient}
                                >
                                    <View style={styles.batchIconWrap}>
                                        <Ionicons name="school" size={20} color="#F59E0B" />
                                    </View>
                                    <Text style={styles.batchName} numberOfLines={2}>{batch.name}</Text>
                                    <View style={styles.batchLevelPill}>
                                        <Text style={styles.batchLevelText}>{batch.level || 'BEGINNER'}</Text>
                                    </View>
                                    <Text style={[styles.heroStatText, { marginTop: 8, fontSize: 10 }]}>
                                        {new Date(batch.startDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))
                    )
                ) : (
                    <View style={{ paddingVertical: 20, alignItems: 'center', width: width - 40 }}>
                        <Text style={styles.heroStatText}>No batches for this month</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default MyBatchesSection;