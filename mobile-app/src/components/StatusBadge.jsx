import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function StatusBadge({ status, text, style }) {
    const getStatusStyle = () => {
        switch (status) {
            case 'success':
                return { backgroundColor: COLORS.successBackground, borderColor: COLORS.success };
            case 'error':
                return { backgroundColor: COLORS.errorBackground, borderColor: COLORS.error };
            case 'warning':
                return { backgroundColor: COLORS.warningBackground, borderColor: COLORS.warning };
            case 'info':
            default:
                return { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: COLORS.info };
        }
    };

    const getTextStyle = () => {
        switch (status) {
            case 'success':
                return { color: COLORS.success };
            case 'error':
                return { color: COLORS.error };
            case 'warning':
                return { color: COLORS.warning };
            case 'info':
            default:
                return { color: COLORS.info };
        }
    };

    return (
        <View style={[styles.badge, getStatusStyle(), style]}>
            <Text style={[styles.text, getTextStyle()]}>
                {text || status?.toUpperCase()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: FONTS.sizes.xs,
        ...FONTS.medium,
        textTransform: 'capitalize',
    },
});
