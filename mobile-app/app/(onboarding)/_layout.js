import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CreateProfile" options={{ title: 'Create Profile', headerShown: true }} />
            <Stack.Screen name="GeneratePlan" options={{ title: 'Generating Plan' }} />
            <Stack.Screen name="ReviewPlan" options={{ title: 'Review Plan', headerShown: true }} />
        </Stack>
    );
}
