import { create } from 'zustand';

const useContentStore = create((set, get) => ({
  courses: [],
  selectedCourse: null,
  modules: [],
  lessons: [],
  versions: [],
  filters: {
    status: 'all',
    search: '',
  },
  loading: false,
  error: null,

  // Actions
  setCourses: (courses) => set({ courses }),
  
  setSelectedCourse: (course) => set({ 
    selectedCourse: course,
    modules: course?.modules || [],
    lessons: course?.lessons || []
  }),

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Computed: Get filtered courses
  getFilteredCourses: () => {
    const { courses, filters } = get();
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           course.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesDeleted = filters.status === 'all' || 
        (filters.status === 'DELETED' && course.isDeleted) ||
        (filters.status === 'ACTIVE' && !course.isDeleted);
      return matchesSearch && matchesDeleted;
    });
  },

  setModules: (modules) => set({ modules }),
  
  setLessons: (lessons) => set({ lessons }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Content Approval & Versioning
  approveContent: (contentId, type) => set((state) => {
    // Logic to update approval status based on type (course/module/lesson)
    return state; 
  }),

  addVersion: (contentId, version) => set((state) => ({
    versions: [...state.versions, { contentId, ...version }]
  })),

  // Assign to batches
  assignToBatch: (courseId, batchId) => {
    // Business logic for assignment state if needed
  }
}));

export default useContentStore;
