import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import ScreenContainer from '../../src/components/ScreenContainer';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';

export default function Welcome() {
    const router = useRouter();

    return (
        <ScreenContainer>
            <View style={styles.content}>
                {/* Logo/Illustration */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>📚</Text>
                    <Text style={styles.appTitle}>LearnAI</Text>
                </View>

                {/* Value Proposition */}
                <Text style={styles.tagline}>
                    Learn English with an AI-Generated Course
                </Text>
                <Text style={styles.description}>
                    Your personal English roadmap, created and taught by AI.
                </Text>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <Button
                        title="Get Started"
                        onPress={() => router.push('/(auth)/Register')}
                        size="large"
                    />
                    <Button
                        title="Log In"
                        variant="outline"
                        onPress={() => router.push('/(auth)/Login')}
                        style={styles.loginButton}
                        size="large"
                    />
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    logo: {
        fontSize: 80,
        marginBottom: SPACING.md,
    },
    appTitle: {
        fontSize: FONTS.sizes.xxxl + 8,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    tagline: {
        fontSize: FONTS.sizes.xl,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    description: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xxl,
        paddingHorizontal: SPACING.md,
    },
    buttonContainer: {
        width: '100%',
        gap: SPACING.md,
    },
    loginButton: {
        marginTop: SPACING.sm,
    },
});
