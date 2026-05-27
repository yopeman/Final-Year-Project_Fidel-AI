import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import styles from '../../../app/styles/homeStyle';

const UpNextSection = ({ currentPosition, onViewAll, onContinue }) => {
    return (
        <View style={styles.upNextSection}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Up Next</Text>
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={onContinue}>
                <LinearGradient
                    colors={['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.06)']}
                    style={styles.upNextCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.upNextIconWrapper}>
                        <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.upNextIcon}>
                            <Ionicons name="play" size={22} color="#fff" />
                        </LinearGradient>
                    </View>
                    <View style={styles.upNextInfo}>
                        <Text style={styles.upNextModule}>NEXT LESSON</Text>
                        <Text style={styles.upNextLesson} numberOfLines={1}>
                            {currentPosition?.lessonTitle || 'Ready to start!'}
                        </Text>
                    </View>
                    <View style={styles.upNextChevron}>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

export default UpNextSection;
