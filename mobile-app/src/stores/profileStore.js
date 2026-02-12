import { create } from 'zustand';
import { profileAPI } from '../services/api';

export const useProfileStore = create((set, get) => ({
    profile: null,
    isLoading: false,
    error: null,

    // Create profile
    createProfile: async (data) => {
        try {
            set({ isLoading: true, error: null });
            const response = await profileAPI.createProfile(data);
            set({ profile: response.data.profile, isLoading: false });
            return { success: true, profile: response.data.profile };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to create profile';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Get profile
    getProfile: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await profileAPI.getProfile();
            set({ profile: response.data.profile, isLoading: false });
            return { success: true, profile: response.data.profile };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch profile';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Update profile
    updateProfile: async (data) => {
        try {
            set({ isLoading: true, error: null });
            const response = await profileAPI.updateProfile(data);
            set({ profile: response.data.profile, isLoading: false });
            return { success: true, profile: response.data.profile };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update profile';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Delete profile
    deleteProfile: async () => {
        try {
            set({ isLoading: true, error: null });
            await profileAPI.deleteProfile();
            set({ profile: null, isLoading: false });
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete profile';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Set profile (for navigation guards)
    setProfile: (profile) => set({ profile }),

    // Clear error
    clearError: () => set({ error: null }),
}));
