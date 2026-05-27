import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { LEVEL, STATUS, FILTERS } from '../../constants/batchConfig';
import styles from '../../../app/styles/batchStyle';

const BatchListHeader = ({ filter, onFilterChange, totalBatches }) => {
    return (
        <View>
            {/* Trust chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trustRow}
            >
                {['✅ Certified Instructors', '🤖 AI Tutor 24/7', '📜 Certificate', '💬 Live Classes'].map(t => (
                    <View key={t} style={styles.trustChip}>
                        <Text style={styles.trustText}>{t}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Filter strip */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
            >
                {FILTERS.map(f => {
                    const act = filter === f.key;
                    const accent = LEVEL[f.key]?.color || STATUS[f.key]?.color || COLORS.primary;
                    return (
                        <TouchableOpacity
                            key={f.key}
                            style={[styles.filterChip, act && { backgroundColor: accent + '22', borderColor: accent }]}
                            onPress={() => onFilterChange(f.key)}
                        >
                            <Ionicons name={f.icon} size={14} color={act ? accent : '#6B7280'} />
                            <Text style={[styles.filterLabel, act && { color: accent, fontWeight: '700' }]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default BatchListHeader;