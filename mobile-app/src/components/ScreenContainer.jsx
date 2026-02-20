import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING } from '../constants/theme';

export default function ScreenContainer({ children, style, scrollable = false }) {
    return (
        <LinearGradient
            colors={COLORS.backgroundGradient}
            style={styles.gradient}
        >
            <StatusBar style="light" />
            <SafeAreaView style={[styles.safeArea, style]}>
                {children}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
});
