import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function Card({
    children,
    variant = 'default', // default, outlined, elevated
    style,
    onPress,
    padding = true
}) {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[
                styles.card,
                styles[variant],
                padding && styles.padding,
                style,
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {children}
        </Container>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    padding: {
        padding: SPACING.md,
    },
    default: {
        // Just background
    },
    outlined: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: 'transparent',
    },
    elevated: {
        ...SHADOWS.md,
        backgroundColor: COLORS.surface, // Ensure bg is set for shadow
    },
});
