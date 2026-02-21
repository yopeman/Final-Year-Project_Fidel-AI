import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" />
            <Stack.Screen name="Login" />
            <Stack.Screen name="Register" options={{ headerShown: false }} />
            <Stack.Screen name="Verify" options={{ headerShown: false }} />
        </Stack>
    );
}
