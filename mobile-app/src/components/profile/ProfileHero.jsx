import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { PROFICIENCY_LEVELS } from '../../constants/index';
import styles from '../../../app/styles/profileStyle';

const ProfileHero = ({ user, profile, isPremium, onMenuPress }) => {
    return (
        <LinearGradient
            colors={['#0A2540', '#0D1B2A', '#080C14']}
            style={styles.heroBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.glowBlob} />

            {isPremium && (
                <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                    <Ionicons name="menu" size={26} color="#fff" />
                </TouchableOpacity>
            )}

            {/* Avatar */}
            <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                    <Text style={styles.avatarText}>{user?.firstName?.[0]?.toUpperCase() || 'U'}</Text>
                </View>
            </LinearGradient>

            <Text style={styles.heroName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.heroEmail}>{user?.email}</Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
                <View style={styles.statPill}>
                    <Ionicons name="school-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.statPillText}>
                        {PROFICIENCY_LEVELS[profile?.proficiency] || 'Beginner'}
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
};

export default ProfileHero;