import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CreateProfile" options={{ headerShown: false }} />
            <Stack.Screen name="GeneratePlan" options={{ headerShown: false }} />
            <Stack.Screen name="ReviewPlan" options={{ headerShown: false }} />
        </Stack>
    );
}
