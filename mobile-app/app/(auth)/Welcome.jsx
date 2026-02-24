import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0A2540', '#0D1B2A', '#080C14']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Decorative glow blobs */}
                <View style={[styles.glowBlob, { top: -50, right: -50, backgroundColor: 'rgba(16,185,129,0.15)' }]} />
                <View style={[styles.glowBlob, { bottom: -100, left: -100, backgroundColor: 'rgba(99,102,241,0.1)' }]} />

                <View style={styles.content}>
                    <View style={styles.topSection}>
                        <LinearGradient
                            colors={['rgba(255,193,7,0.2)', 'rgba(255,193,7,0.05)']}
                            style={styles.logoBadge}
                        >
                            <Ionicons name="school" size={40} color={COLORS.primary} />
                        </LinearGradient>
                        <Text style={styles.appTitle}>Fidel AI</Text>
                        <Text style={styles.tagline}>Your Personal English Master</Text>
                    </View>

                    <View style={styles.middleSection}>
                        <Text style={styles.description}>
                            Master English with a personalized roadmap generated and taught by advanced AI.
                        </Text>

                        <View style={styles.featureRow}>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIconWrap}>
                                    <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                                </View>
                                <Text style={styles.featureText}>Custom Path</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIconWrap}>
                                    <Ionicons name="chatbubbles" size={16} color="#10B981" />
                                </View>
                                <Text style={styles.featureText}>AI Tutor</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIconWrap}>
                                    <Ionicons name="stats-chart" size={16} color="#6366F1" />
                                </View>
                                <Text style={styles.featureText}>Progress</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.getStartedBtn}
                            onPress={() => router.push('/(auth)/Register')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, '#059669']}
                                style={styles.btnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.getStartedText}>Get Started</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginBtn}
                            onPress={() => router.push('/(auth)/Login')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Log In</Text></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    gradient: {
        flex: 1,
    },
    glowBlob: {
        position: 'fixed',
        // width: 300,
        // height: 300,
        borderRadius: 150,
        opacity: 0.6,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: height * 0.15,
        paddingBottom: 50,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topSection: {
        alignItems: 'center',
    },
    logoBadge: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,193,7,0.3)',
    },
    appTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: 8,
        letterSpacing: 0.5,
    },
    middleSection: {
        alignItems: 'center',
        width: '100%',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    featureRow: {
        flexDirection: 'row',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        gap: 6,
    },
    featureIconWrap: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
    },
    getStartedBtn: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    getStartedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    loginBtn: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    loginText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontWeight: '600',
    },
    loginLink: {
        color: COLORS.primary,
        fontWeight: '800',
    },
});
