import { create } from 'zustand';
import { coursesAPI, materialsAPI } from '../services/api';

export const useMaterialStore = create((set, get) => ({
    courses: [],
    materials: [],
    currentMaterial: null,
    selectedCourseId: null,
    isLoading: false,
    error: null,

    // ── Courses ──────────────────────────────────────────────────────────────
    getCourses: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await coursesAPI.getCourses();
            const courses = response.data.courses || [];
            set({ courses, isLoading: false });
            return { success: true, courses };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch courses';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // ── Materials ─────────────────────────────────────────────────────────────
    getMaterials: async (courseId = null) => {
        try {
            set({ isLoading: true, error: null, selectedCourseId: courseId });
            const response = await materialsAPI.getMaterials(courseId);
            const materials = response.data.materials || [];
            set({ materials, isLoading: false });
            return { success: true, materials };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch materials';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    getMaterial: async (id) => {
        try {
            set({ isLoading: true, error: null });
            const response = await materialsAPI.getMaterial(id);
            const material = response.data.material;
            set({ currentMaterial: material, isLoading: false });
            return { success: true, material };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch material';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    setSelectedCourse: (courseId) => set({ selectedCourseId: courseId }),
    clearError: () => set({ error: null }),
}));
