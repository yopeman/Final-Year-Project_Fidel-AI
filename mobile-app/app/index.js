import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function Index() {
    const { isAuthenticated, hasProfile, hasPlan, isLoading } = useAuthStore();

    if (isLoading) return null;

    if (!isAuthenticated) return <Redirect href="/(auth)/Welcome" />;
    if (!hasProfile) return <Redirect href="/(onboarding)/CreateProfile" />;
    if (!hasPlan) return <Redirect href="/(onboarding)/GeneratePlan" />;

    return <Redirect href="/(tabs)/Home" />;
}
