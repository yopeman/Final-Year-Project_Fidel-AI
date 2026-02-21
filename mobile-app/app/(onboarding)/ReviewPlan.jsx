import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewPlan() {
    const router = useRouter();
    const { learningPlan, updateLearningPlan, installLearningPlan, getModules, isLoading, error } = useLearningStore();
    const { refreshUser } = useAuthStore();
    const [isImproving, setIsImproving] = useState(false);
    const [improvementText, setImprovementText] = useState('');

    const handleInstall = async () => {
        const result = await installLearningPlan();
        if (result.success) {
            await refreshUser();
            await getModules();
            router.replace('/(tabs)/Home');
        }
    };

    const handleImprove = async () => {
        if (!improvementText.trim()) {
            setIsImproving(false);
            return;
        }
        const result = await updateLearningPlan(improvementText);
        if (result.success) {
            setIsImproving(false);
            setImprovementText('');
        }
    };

    if (!learningPlan && !isLoading) {
        return (
            <View style={styles.container}>
                <View style={[styles.content, { justifyContent: 'center' }]}>
                    <Text style={styles.errorText}>No plan generated. Please try again.</Text>
                    <TouchableOpacity style={styles.button} onPress={() => router.replace('/(onboarding)/GeneratePlan')}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // A very basic markdown-lite renderer for the plan text
    const renderPlan = (text) => {
        if (!text) return null;

        const lines = text.split('\n');
        return lines.map((line, index) => {
            if (line.startsWith('###')) {
                return <Text key={index} style={styles.h3}>{line.replace('###', '').trim()}</Text>;
            } else if (line.startsWith('####')) {
                return <Text key={index} style={styles.h4}>{line.replace('####', '').trim()}</Text>;
            } else if (line.startsWith('**')) {
                return <Text key={index} style={styles.boldLine}>{line.replace(/\*\*/g, '').trim()}</Text>;
            } else if (line.startsWith('-')) {
                return <Text key={index} style={styles.bullet}>{line}</Text>;
            }
            return <Text key={index} style={styles.textLine}>{line}</Text>;
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.heroBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.glowBlob} />
                <View style={styles.header}>
                    <Text style={styles.title}>Your Personal Plan</Text>
                    <Text style={styles.subtitle}>Review your curriculum before starting.</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.planContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                {isLoading && !isImproving ? (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Refining your curriculum...</Text>
                    </View>
                ) : (
                    <View style={styles.planCard}>
                        {renderPlan(learningPlan)}
                    </View>
                )}
            </ScrollView>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {isImproving ? (
                <View style={styles.improveContainer}>
                    <TextInput
                        style={styles.improveInput}
                        placeholder="What would you like to change? (e.g. More focus on business, slower pace)"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        multiline
                        value={improvementText}
                        onChangeText={setImprovementText}
                        autoFocus
                    />
                    <View style={styles.improveButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setIsImproving(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitImproveButton} onPress={handleImprove} disabled={isLoading} activeOpacity={0.8}>
                            <LinearGradient
                                colors={[COLORS.primary, '#059669']}
                                style={styles.improveBtnGrad}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitImproveButtonText}>Update Plan</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setIsImproving(true)}
                        disabled={isLoading}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="options-outline" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.secondaryButtonText}>Improve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleInstall}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, '#059669']}
                            style={styles.primaryButtonGrad}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.primaryButtonText}>Install & Start</Text>
                                    <Ionicons name="rocket" size={20} color="#fff" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#080C14',
    },
    heroBanner: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 30,
        overflow: 'hidden',
    },
    glowBlob: {
        position: 'absolute', top: -30, right: -30,
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(16,185,129,0.1)',
    },
    header: {
        gap: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
    planContainer: {
        flex: 1,
    },
    planCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: 24,
        margin: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    h3: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: 24,
        marginBottom: 12,
    },
    h4: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    textLine: {
        fontSize: 15,
        lineHeight: 24,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 6,
    },
    boldLine: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
    },
    bullet: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 24,
        marginLeft: 10,
        marginBottom: 6,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 60,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
    improveContainer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#080C14',
    },
    improveInput: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        height: 120,
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.05)',
        textAlignVertical: 'top',
    },
    improveButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    cancelButtonText: {
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
        fontSize: 15,
    },
    submitImproveButton: {
        borderRadius: 14,
        overflow: 'hidden',
        minWidth: 140,
    },
    improveBtnGrad: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    submitImproveButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 15,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
        flexDirection: 'row',
        gap: 16,
        backgroundColor: '#080C14',
    },
    primaryButton: {
        flex: 2,
        borderRadius: 18,
        overflow: 'hidden',
    },
    primaryButtonGrad: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    secondaryButtonText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 15,
        fontWeight: '700',
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '600',
    },
});
