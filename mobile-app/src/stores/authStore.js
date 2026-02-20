import { create } from 'zustand';
import storage from '../utils/storage';
import { authAPI, profileAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    hasProfile: false,
    hasPlan: false,
    subscription: null,
    isPremium: false,
    features: [],
    isLoading: true,
    error: null,

    hasFeature: (feature) => {
        const { features, isPremium } = get();
        return isPremium && features.includes(feature);
    },

    initAuth: async () => {
        try {
            const token = await storage.getItem('accessToken', true);
            const refreshToken = await storage.getItem('refreshToken', true);
            const userStr = await storage.getItem('user');

            if (token) {
                let user = null;
                if (userStr) {
                    try {
                        user = JSON.parse(userStr);
                    } catch (e) {
                        await storage.removeItem('user');
                    }
                }

                set({
                    token,
                    refreshToken,
                    user,
                    isAuthenticated: !!user,
                    hasProfile: !!user?.profile,
                    hasPlan: !!user?.profile?.aiLearningPlan,
                    subscription: user?.subscription || null,
                    isPremium: user?.subscription?.status === 'active',
                    features: user?.subscription?.features || [],
                    isLoading: false
                });

                if (user) {
                    get().refreshUser();
                }
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Init auth error:', error);
            set({ isLoading: false });
        }
    },

    refreshUser: async () => {
        try {
            const response = await authAPI.me();
            const user = response.data;

            if (user) {
                await storage.setItem('user', JSON.stringify(user));
                set({
                    user,
                    isAuthenticated: true,
                    hasProfile: !!user?.profile,
                    hasPlan: !!user?.profile?.aiLearningPlan,
                    subscription: user?.subscription || null,
                    isPremium: user?.subscription?.status === 'active',
                    features: user?.subscription?.features || []
                });
                return { success: true, user };
            }
            return { success: false, error: 'No user data' };
        } catch (error) {
            // Error handling in interceptor should handle 401s
            return { success: false, error: error.message };
        }
    },

    register: async (input) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authAPI.register(input);
            set({ isLoading: false });
            return { success: response.data };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    verify: async (input) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authAPI.verify(input);
            set({ isLoading: false });
            return { success: response.data };
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
            const response = await authAPI.login(input);
            const { accessToken, refreshToken, user } = response.data;

            await storage.setItem('accessToken', accessToken, true);
            await storage.setItem('refreshToken', refreshToken, true);
            await storage.setItem('user', JSON.stringify(user));

            set({
                token: accessToken,
                refreshToken,
                user,
                isAuthenticated: true,
                subscription: user?.subscription || null,
                isPremium: user?.subscription?.status === 'active',
                features: user?.subscription?.features || [],
                isLoading: false
            });

            return { success: true, user };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Login failed';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    setTokens: async (accessToken, refreshToken) => {
        await storage.setItem('accessToken', accessToken, true);
        await storage.setItem('refreshToken', refreshToken, true);
        set({ token: accessToken, refreshToken });
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

    logout: async () => {
        try {
            // await authAPI.logout(); 
        } catch (e) {
            console.warn('Logout failed', e);
        }

        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
        await storage.removeItem('user');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, error: null });
    },

    clearError: () => set({ error: null }),
}));
