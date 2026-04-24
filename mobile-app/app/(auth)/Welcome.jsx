import { View, Text, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/welcomeStyle';

const { width, height } = Dimensions.get('window');

const Welcome = () => {
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

export default Welcome;
