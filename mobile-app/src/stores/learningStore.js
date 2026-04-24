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

    // Recomputes completionPercentage from local modules data
    // Called immediately after optimistic updates so the bar moves right away
    _computeProgress: () => {
        const modules = get().modules;
        const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
        const completedLessons = modules.reduce(
            (sum, m) => sum + (m.lessons?.filter(l => l.isCompleted).length || 0), 0
        );
        const completionPercentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
        const current = get().progress || {};
        set({
            progress: {
                ...current,
                completedLessons,
                totalLessons,
                completionPercentage,
            }
        });
    },

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
                const mods = response.data.modules;
                set({ modules: mods, isLoading: false });
                get()._computeProgress();
                return { success: true, modules: mods };
            }

            const response = await lessonsAPI.getModules(profileId);
            const mods = response.data.modules;
            set({ modules: mods, isLoading: false });
            // Immediately recompute progress from the returned modules
            get()._computeProgress();
            return { success: true, modules: mods };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch modules';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    getQuiz: async (lessonId) => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await learningAPI.getQuiz(lessonId);
            set({ isLoading: false });
            return { success: true, quiz: data.quiz };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
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
            // Optimistic update — mark lesson completed in local state
            const modules = get().modules.map(m => ({
                ...m,
                lessons: m.lessons.map(l => l.id === lessonId ? { ...l, isCompleted: true } : l)
            }));
            set({ modules });

            // Immediately recompute progress from updated modules (0→100% moves instantly)
            get()._computeProgress();

            await progressAPI.completeLesson(lessonId);

            // Also refresh from server to sync any server-side fields (streak, etc.)
            get().getProgress();

            return { success: true };
        } catch (error) {
            console.log('Complete lesson failed', error);
            return { success: false };
        }
    },

    getProgress: async () => {
        try {
            const response = await progressAPI.myProgress();
            const apiProgress = response.data.progress;
            // Merge API result with local computed values
            // If the API returns completionPercentage, trust it; otherwise use local computation
            const localProgress = get().progress || {};
            const merged = {
                ...localProgress,
                ...apiProgress,
            };
            // If API returned 0% or no completionPercentage, prefer the locally computed value
            if (!apiProgress?.completionPercentage && localProgress.completionPercentage) {
                merged.completionPercentage = localProgress.completionPercentage;
            }
            set({ progress: merged });
            return { success: true, progress: merged };
        } catch (error) {
            // API failed — keep the locally computed progress, don't reset to null
            return { success: false };
        }
    },

    // Video Management
    getVideos: async (lessonId) => {
        try {
            set({ isLoading: true, error: null });
            const response = await lessonsAPI.getVideos(lessonId);
            set({ isLoading: false });
            return { success: true, videos: response.data.videos };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    updateVideo: async (id, input) => {
        try {
            set({ isLoading: true, error: null });
            const response = await lessonsAPI.updateVideo(id, input);
            set({ isLoading: false });
            return { success: true, video: response.data.updateVideo };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    deleteVideo: async (id) => {
        try {
            set({ isLoading: true, error: null });
            await lessonsAPI.deleteVideo(id);
            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    clearError: () => set({ error: null }),
}));
