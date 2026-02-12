import { Stack, useSegments, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function Layout() {
    const { initAuth, isAuthenticated, hasProfile, hasPlan, isLoading } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        initAuth();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboardingGroup = segments[0] === '(onboarding)';
        const inTabsGroup = segments[0] === '(tabs)';

        if (!isAuthenticated) {
            // Not Logged In → Welcome
            if (!inAuthGroup || segments[1] !== 'Welcome') {
                router.replace('/(auth)/Welcome');
            }
        } else if (!hasProfile) {
            // Logged In, No Profile → Create Profile
            if (segments[1] !== 'CreateProfile') {
                router.replace('/(onboarding)/CreateProfile');
            }
        } else if (!hasPlan) {
            // Profile, No Plan → Generate Plan (allows ReviewPlan)
            const onboardingPath = segments[1];
            if (onboardingPath !== 'GeneratePlan' && onboardingPath !== 'ReviewPlan') {
                router.replace('/(onboarding)/GeneratePlan');
            }
        } else {
            // Plan Installed → Dashboard
            if (inAuthGroup || inOnboardingGroup || segments[0] === 'index' || !segments[0]) {
                router.replace('/(tabs)/Home');
            }
        }
    }, [isAuthenticated, hasProfile, hasPlan, isLoading, segments]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="learn" />
            <Stack.Screen name="chat" />
        </Stack>
    );
}
