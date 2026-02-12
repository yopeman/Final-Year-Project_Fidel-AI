import { Stack } from 'expo-router';

export default function LearnLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="[moduleId]" options={{ title: 'Lessons' }} />
            <Stack.Screen name="lesson/[id]" options={{ title: 'Lesson', headerShown: false }} />
        </Stack>
    );
}
