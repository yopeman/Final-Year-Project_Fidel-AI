import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../constants';

export default function ProgressBar({
    progress = 0, // 0-100
    height = 8,
    style,
}) {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <View style={[styles.container, { height }, style]}>
            <View
                style={[
                    styles.fill,
                    { width: `${clampedProgress}%` }
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: COLORS.border,
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.full,
    },
});
