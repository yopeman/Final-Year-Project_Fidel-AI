import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function Input({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    error,
    multiline = false,
    style,
    icon,
    keyboardType = 'default',
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                isFocused && styles.focused,
                error && styles.error,
                multiline && styles.multilineContainer
            ]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multilineInput,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry={secureTextEntry}
                    multiline={multiline}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType={keyboardType}
                    selectionColor={COLORS.primary}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.text,
        marginBottom: SPACING.xs,
        ...FONTS.medium,
    },
    inputContainer: {
        backgroundColor: COLORS.surfaceLight,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
    },
    focused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface, // Slightly darker on focus or keep same
    },
    error: {
        borderColor: COLORS.error,
    },
    multilineContainer: {
        alignItems: 'flex-start',
        paddingVertical: SPACING.sm,
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        paddingVertical: SPACING.md,
        ...FONTS.regular,
        height: 48,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingVertical: 0,
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONTS.sizes.xs,
        marginTop: SPACING.xs,
        ...FONTS.regular,
    },
});
