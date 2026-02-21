import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
    // Brand Colors
    primary: '#FFC107', // Hot Yellow
    primaryDark: '#FFB300', // Slightly darker yellow for pressed states
    secondary: '#64748B', // Soft Gray

    // Backgrounds
    background: '#080C14', // Very Deep Blue-Black
    backgroundGradient: ['#0A2540', '#0D1B2A', '#080C14'], // Premium gradient from Home.jsx
    surface: '#1E293B', // Slightly lighter dark surface (Slate 800)
    surfaceLight: '#334155', // Lighter surface for inputs/modals (Slate 700)

    // Text
    text: '#FFFFFF', // Primary text
    textSecondary: '#94A3B8', // Secondary text (Slate 400)
    textInverse: '#0F172A', // Text on primary color (Yellow)

    // Status
    success: '#22C55E', // Modern Green
    successBackground: 'rgba(34, 197, 94, 0.1)',
    error: '#EF4444', // Soft Red
    errorBackground: 'rgba(239, 68, 68, 0.1)',
    warning: '#F59E0B',
    warningBackground: 'rgba(245, 158, 11, 0.1)',
    info: '#3B82F6',

    // UI Elements
    border: '#334155', // Slate 700
    borderFocus: '#FFC107', // Hot Yellow
    iconActive: '#FFC107',
    iconInactive: '#64748B',
    disabled: '#475569',
    disabledText: '#94A3B8',

    // Overlay
    overlay: 'rgba(15, 23, 42, 0.8)',
};

export const FONTS = {
    regular: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        fontWeight: '400',
    },
    medium: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        fontWeight: '500',
    },
    bold: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        fontWeight: '700',
    },
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        display: 40,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
};

export const SIZES = {
    width,
    height,
};

const theme = { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, SIZES };

export default theme;
