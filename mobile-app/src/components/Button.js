import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
}) {
    return (
        <TouchableOpacity
            style={[
                styles.base,
                styles[variant],
                styles[size],
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? COLORS.primary : '#FFFFFF'} />
            ) : (
                <Text style={[styles.text, styles[`${variant}Text`]]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: COLORS.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    danger: {
        backgroundColor: COLORS.error,
    },
    small: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    medium: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
    },
    large: {
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#FFFFFF',
    },
    outlineText: {
        color: COLORS.primary,
    },
    dangerText: {
        color: '#FFFFFF',
    },
});
