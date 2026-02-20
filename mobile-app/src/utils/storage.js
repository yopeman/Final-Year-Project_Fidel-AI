import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Enhanced storage utility that uses Expo SecureStore for sensitive data on mobile
 * and falls back to AsyncStorage for non-sensitive data or web platform.
 */
const storage = {
    /**
     * Store item securely on mobile, or in localStorage on web
     */
    async setItem(key, value, secure = false) {
        if (!value) return;

        try {
            if (secure && Platform.OS !== 'web') {
                await SecureStore.setItemAsync(key, value);
            } else {
                await AsyncStorage.setItem(key, value);
            }
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    },

    /**
     * Get item from secure storage on mobile, or from localStorage on web
     */
    async getItem(key, secure = false) {
        try {
            if (secure && Platform.OS !== 'web') {
                return await SecureStore.getItemAsync(key);
            } else {
                return await AsyncStorage.getItem(key);
            }
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return null;
        }
    },

    /**
     * Remove item from both storage types to be safe
     */
    async removeItem(key) {
        try {
            if (Platform.OS !== 'web') {
                await SecureStore.deleteItemAsync(key);
            }
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
        }
    },

    /**
     * Clear all non-system items
     */
    async clear() {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
};

export default storage;
