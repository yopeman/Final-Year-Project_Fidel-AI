import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function Button({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, ghost
    size = 'medium', // small, medium, large
    disabled = false,
    loading = false,
    icon = null,
    style,
    textStyle,
}) {
    const getVariantStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primary;
            case 'secondary':
                return styles.secondary;
            case 'outline':
                return styles.outline;
            case 'ghost':
                return styles.ghost;
            case 'danger':
                return styles.danger;
            default:
                return styles.primary;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryText;
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            case 'ghost':
                return styles.ghostText;
            case 'danger':
                return styles.dangerText;
            default:
                return styles.primaryText;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.base,
                getVariantStyle(),
                styles[size],
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.textInverse} />
            ) : (
                <>
                    {icon && icon}
                    <Text style={[styles.text, getTextStyle(), textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    // Variants
    primary: {
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    primaryText: {
        color: COLORS.textInverse,
        fontWeight: '700',
    },
    secondary: {
        backgroundColor: COLORS.surfaceLight,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    secondaryText: {
        color: COLORS.text,
        fontWeight: '600',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    outlineText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    danger: {
        backgroundColor: COLORS.error,
    },
    dangerText: {
        color: COLORS.text,
        fontWeight: '700',
    },
    // Sizes
    small: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    medium: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        height: 48,
    },
    large: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        height: 56,
    },
    // States
    disabled: {
        opacity: 0.5,
        backgroundColor: COLORS.disabled,
        borderColor: COLORS.disabled,
    },
    text: {
        fontSize: FONTS.sizes.md,
        ...FONTS.medium,
    },
});
