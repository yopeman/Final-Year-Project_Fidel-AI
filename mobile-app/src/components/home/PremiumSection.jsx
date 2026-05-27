import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../app/styles/homeStyle';

const PREMIUM_ITEMS = [
    { title: 'Live Classes', icon: 'videocam', color: '#3B82F6', route: '/(tabs)/Batch' },
    { title: 'Resources', icon: 'book', color: '#F59E0B', route: '/(tabs)/Resources' },
    { title: 'Community', icon: 'chatbubbles', color: '#10B981', route: '/(tabs)/Community' },
];

const PremiumSection = ({ isPremium, onItemPress, onUpgradePress }) => {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Premium</Text>
                {isPremium ? (
                    <View style={styles.activePill}>
                        <Text style={styles.activePillText}>✦ ACTIVE</Text>
                    </View>
                ) : (
                    <View style={styles.lockedPill}>
                        <Text style={styles.lockedPillText}>🔒 LOCKED</Text>
                    </View>
                )}
            </View>
            <View style={styles.premiumRow}>
                {PREMIUM_ITEMS.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.premiumTile, !isPremium && styles.premiumTileLocked]}
                        onPress={() => isPremium ? onItemPress(item.route) : onUpgradePress()}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.premiumTileIcon, { backgroundColor: item.color + '22' }]}>
                            <Ionicons name={item.icon} size={24} color={isPremium ? item.color : '#4B5563'} />
                        </View>
                        <Text style={[styles.premiumTileLabel, !isPremium && { color: '#6B7280' }]}>
                            {item.title}
                        </Text>
                        {!isPremium && (
                            <View style={styles.lockOverlay}>
                                <Ionicons name="lock-closed" size={12} color="#6B7280" />
                            </View>
                        )}
                        {isPremium && <View style={[styles.activeDot, { backgroundColor: item.color }]} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default PremiumSection;