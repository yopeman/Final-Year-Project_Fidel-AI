import { create } from 'zustand';
import { feedbackAPI } from '../services/api';

export const useFeedbackStore = create((set) => ({
    isLoading: false,
    error: null,

    submitFeedback: async (content, rate, context = null) => {
        try {
            set({ isLoading: true, error: null });
            await feedbackAPI.submitFeedback(content, rate, context);
            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to submit feedback';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    submitAnonymously: async (content, rate, context = null) => {
        try {
            set({ isLoading: true, error: null });
            await feedbackAPI.submitAnonymously(content, rate, context);
            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to submit feedback anonymously';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    clearError: () => set({ error: null }),
}));
