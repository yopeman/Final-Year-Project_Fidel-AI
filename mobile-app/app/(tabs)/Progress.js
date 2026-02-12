import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useLearningStore } from '../../src/stores/learningStore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
    const { progress, getProgress, isLoading } = useLearningStore();

    useEffect(() => {
        getProgress();
    }, []);

    const completionPercentage = progress?.completionPercentage || 0;
    const completedLessons = progress?.completedLessons || 0;
    const totalLessons = progress?.totalLessons || 0;
    const streakDays = progress?.streakDays || 0;
    const xp = progress?.xp || 0;
    const hoursSpent = progress?.hoursSpent || 0;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={getProgress} tintColor="#FFD700" />
            }
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Progress</Text>
            </View>

            {/* Main Progress Ring / Card */}
            <View style={styles.mainCard}>
                <View style={styles.ringContainer}>
                    <View style={styles.ring}>
                        <Text style={styles.ringText}>{completionPercentage}%</Text>
                        <Text style={styles.ringLabel}>Complete</Text>
                    </View>
                </View>
                <Text style={styles.mainCardFooter}>
                    You've completed {completedLessons} out of {totalLessons} lessons.
                </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={[styles.iconBg, { backgroundColor: '#FFEBEE' }]}>
                        <Ionicons name="flame" size={24} color="#F44336" />
                    </View>
                    <Text style={styles.statValue}>{streakDays}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.iconBg, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="flash" size={24} color="#2196F3" />
                    </View>
                    <Text style={styles.statValue}>{xp}</Text>
                    <Text style={styles.statLabel}>Total XP</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.iconBg, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="time" size={24} color="#FF9800" />
                    </View>
                    <Text style={styles.statValue}>{hoursSpent.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Hours Spent</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.iconBg, { backgroundColor: '#E8F5E9' }]}>
                        <Ionicons name="trophy" size={24} color="#4CAF50" />
                    </View>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Achievements</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    mainCard: {
        margin: 20,
        padding: 30,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    ringContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 10,
        borderColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    ring: {
        alignItems: 'center',
    },
    ringText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
    },
    ringLabel: {
        fontSize: 14,
        color: '#888',
    },
    mainCardFooter: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        gap: 15,
        paddingTop: 0,
    },
    statCard: {
        width: (width - 55) / 2,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
    },
});
