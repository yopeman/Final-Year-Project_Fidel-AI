import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, profileAPI } from '../services/api';
import { useBatchStore } from './batchStore';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    hasProfile: false,
    hasPlan: false,
    isLoading: true,
    error: null,

    initAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const refreshToken = await AsyncStorage.getItem('refreshToken');

            if (token) {
                const userStr = await AsyncStorage.getItem('user');
                let user = null;

                if (userStr) {
                    try {
                        user = JSON.parse(userStr);
                    } catch (e) {
                        await AsyncStorage.removeItem('user');
                    }
                }

                set({
                    token,
                    refreshToken,
                    user,
                    isAuthenticated: !!user,
                    hasProfile: !!user?.profile,
                    hasPlan: !!user?.profile?.aiLearningPlan,
                    isLoading: false
                });

                if (user) {
                    if (user.profile) {
                        useBatchStore.getState().syncWithProfile(user.profile);
                    }
                    get().refreshUser();
                }
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.log('Init auth error:', error);
            set({ isLoading: false });
        }
    },

    refreshUser: async () => {
        try {
            const response = await authAPI.me();
            const user = response.data; // api.js returns { data: res.data.me }

            if (user) {
                await AsyncStorage.setItem('user', JSON.stringify(user));
                if (user.profile) {
                    useBatchStore.getState().syncWithProfile(user.profile);
                }
                set({
                    user,
                    isAuthenticated: true,
                    hasProfile: !!user?.profile,
                    hasPlan: !!user?.profile?.aiLearningPlan
                });
                return { success: true, user };
            }
            return { success: false, error: 'No user data' };
        } catch (error) {
            if (error.response?.status === 401) {
                get().logout();
            }
            return { success: false, error: error.message };
        }
    },

    register: async (input) => {
        try {
            set({ isLoading: true, error: null });
            // Input: { firstName, lastName, email, password, role }
            const response = await authAPI.register(input);
            set({ isLoading: false });
            return { success: response.data }; // api.js returns { data: res.data.register } which is Boolean
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    verify: async (input) => {
        try {
            set({ isLoading: true, error: null });
            // Input: { email, verificationCode }
            const response = await authAPI.verify(input);
            set({ isLoading: false });
            return { success: response.data }; // Returns Boolean
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Verification failed';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    resendVerification: async (email) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authAPI.resendVerification(email);
            set({ isLoading: false });
            return { success: response.data };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to resend code';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    login: async (input) => {
        try {
            set({ isLoading: true, error: null });
            // Input: { email, password }
            const response = await authAPI.login(input);
            // api.js returns { data: { token, user } }
            const { token, user } = response.data;

            await AsyncStorage.setItem('accessToken', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            set({
                token,
                user,
                isAuthenticated: true,
                isLoading: false
            });

            if (user?.profile) {
                useBatchStore.getState().syncWithProfile(user.profile);
            }

            return { success: true, user };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Login failed';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    createProfile: async (input) => {
        try {
            set({ isLoading: true, error: null });
            const response = await profileAPI.createProfile(input);
            const profile = response.data.profile;

            await get().refreshUser();

            set({ isLoading: false });
            return { success: true, profile };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || JSON.stringify(error) || 'Failed to create profile';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    updateMe: async (data) => {
        try {
            // set({ isLoading: true, error: null });
            const response = await authAPI.updateMe(data);
            const updatedUser = response.data.user;

            if (updatedUser) {
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                set({
                    user: updatedUser,
                    // isLoading: false
                });
                return { success: true, user: updatedUser };
            }
            return { success: false, error: 'No user data returned' };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update account';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    logout: async () => {
        try {
            // await authAPI.logout(); 
        } catch (e) {
            console.warn('Logout failed', e);
        }

        // Clear all relevant storage keys
        await Promise.all([
            AsyncStorage.removeItem('accessToken'),
            AsyncStorage.removeItem('refreshToken'),
            AsyncStorage.removeItem('user'),
            AsyncStorage.removeItem('planStatus')
        ]);

        // Clear batch store persistence
        const batchStore = useBatchStore.getState();
        if (batchStore.clearPersistedData) {
            await batchStore.clearPersistedData();
        }

        set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            hasProfile: false,
            hasPlan: false,
            error: null
        });

        console.log('[AuthStore] Logout complete, storage cleared');
    },

    clearError: () => set({ error: null }),
}));
