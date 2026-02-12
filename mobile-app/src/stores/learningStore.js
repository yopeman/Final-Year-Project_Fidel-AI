import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { learningPlanAPI, progressAPI, lessonsAPI } from '../services/api';
import { useAuthStore } from './authStore';

export const useLearningStore = create((set, get) => ({
    learningPlan: null,
    isPlanActive: false,
    modules: [],
    currentLesson: null,
    progress: null, // StudentProgress
    isLoading: false,
    error: null,

    initLearning: async () => {
        const planStatus = await AsyncStorage.getItem('planStatus');
        set({ isPlanActive: planStatus === 'active' });
    },

    // Get current position in the course
    getCurrentPosition: () => {
        const modules = get().modules;
        if (!modules || modules.length === 0) return null;

        for (const module of modules) {
            const firstIncomplete = module.lessons?.find(l => !l.isCompleted);
            if (firstIncomplete) {
                return {
                    moduleTitle: module.title || module.name,
                    lessonTitle: firstIncomplete.title,
                    lessonId: firstIncomplete.id
                };
            }
        }
        return { moduleTitle: 'Course Complete', lessonTitle: 'All lessons done!', lessonId: null };
    },

    generateLearningPlan: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await learningPlanAPI.generateLearningPlan();
            await AsyncStorage.setItem('planStatus', 'draft');
            set({ learningPlan: response.data.plan, isPlanActive: false, isLoading: false });
            return { success: true, plan: response.data.plan };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to generate plan';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    updateLearningPlan: async (improvements) => {
        try {
            set({ isLoading: true, error: null });
            const response = await learningPlanAPI.updateLearningPlan({ improvements });
            set({ learningPlan: response.data.plan, isLoading: false });
            return { success: true, plan: response.data.plan };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update plan';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    installLearningPlan: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await learningPlanAPI.installLearningPlan();
            await AsyncStorage.setItem('planStatus', 'active');
            set({ learningPlan: response.data.plan, isPlanActive: true, isLoading: false });

            // Refresh modules after install
            get().getModules();

            return { success: true, plan: response.data.plan };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to install plan';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    getModules: async () => {
        try {
            set({ isLoading: true, error: null });

            // Get user from authStore
            const user = useAuthStore.getState().user;
            const profileId = user?.profile?.id;

            if (!profileId) {
                // If profile is missing on user object, try refreshing user
                const userRes = await useAuthStore.getState().refreshUser();
                if (!userRes.success || !userRes.user?.profile?.id) {
                    throw new Error('Student profile not found');
                }
                const newProfileId = userRes.user.profile.id;
                const response = await lessonsAPI.getModules(newProfileId);
                set({ modules: response.data.modules, isLoading: false });
                return { success: true, modules: response.data.modules };
            }

            const response = await lessonsAPI.getModules(profileId);
            set({ modules: response.data.modules, isLoading: false });
            return { success: true, modules: response.data.modules };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch modules';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    getLesson: async (lessonId) => {
        try {
            set({ isLoading: true, error: null });
            const response = await lessonsAPI.getLesson(lessonId);
            set({ currentLesson: response.data.lesson, isLoading: false });
            return { success: true, lesson: response.data.lesson };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch lesson';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    completeLesson: async (lessonId) => {
        try {
            // Optimistic update
            const modules = get().modules.map(m => ({
                ...m,
                lessons: m.lessons.map(l => l.id === lessonId ? { ...l, isCompleted: true } : l)
            }));
            set({ modules });

            await progressAPI.completeLesson(lessonId);

            // Refresh progress
            get().getProgress();

            return { success: true };
        } catch (error) {
            // Revert on failure would be ideal here
            console.error('Complete lesson failed', error);
            return { success: false };
        }
    },

    getProgress: async () => {
        try {
            const response = await progressAPI.myProgress();
            set({ progress: response.data.progress });
            return { success: true, progress: response.data.progress };
        } catch (error) {
            return { success: false };
        }
    },

    clearError: () => set({ error: null }),
}));
