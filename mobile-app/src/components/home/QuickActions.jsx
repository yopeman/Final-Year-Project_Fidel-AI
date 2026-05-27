import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../app/styles/homeStyle';

const QUICK_ACTIONS = [
    { label: 'AI Tutor', icon: 'chatbubbles', color: '#6366F1', bg: 'rgba(99,102,241,0.15)', route: '/(tabs)/AIConversation' },
    { label: 'Library', icon: 'library', color: '#10B981', bg: 'rgba(16,185,129,0.15)', route: '/(tabs)/Modules' },
    { label: 'My Batch', icon: 'people', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', id: 'my-batch' },
    { label: 'Profile', icon: 'person-circle', color: '#EC4899', bg: 'rgba(236,72,153,0.15)', route: '/(tabs)/Profile' },
];

const QuickActions = ({ onActionPress, onBatchPress }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                {QUICK_ACTIONS.map((a) => (
                    <TouchableOpacity
                        key={a.label}
                        style={[styles.actionTile, { backgroundColor: a.bg }]}
                        onPress={() => {
                            if (a.id === 'my-batch') {
                                onBatchPress();
                            } else {
                                onActionPress(a.route);
                            }
                        }}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.actionIconCircle, { backgroundColor: a.color + '25' }]}>
                            <Ionicons name={a.icon} size={24} color={a.color} />
                        </View>
                        <Text style={styles.actionLabel}>{a.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default QuickActions;