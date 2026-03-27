import { create } from 'zustand';

const useSystemStore = create((set, get) => ({
  activeTab: 'overview',
  activityLogs: [],
  notifications: [],
  feedback: [],
  schedules: [],
  filters: {
    search: '',
    read: 'all',
    rating: 'all',
    day: 'all',
  },
  analytics: {
    activeUsers: 0,
    engagementRate: 0,
    growth: 0,
  },
  loading: false,
  error: null,

  // Actions
  setActivityLogs: (logs) => set({ activityLogs: logs }),
  
  setNotifications: (notifications) => set({ notifications }),
  
  setFeedback: (feedback) => set({ feedback }),
  
  setSchedules: (schedules) => set({ schedules }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Computed: Get filtered feedback
  getFilteredFeedback: () => {
    const { feedback, filters } = get();
    return feedback.filter(f => {
      const matchesSearch = f.content?.toLowerCase().includes(filters.search.toLowerCase()) ||
                           f.user?.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
                           f.user?.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
                           f.context?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesRead = filters.read === 'all' || 
                         (filters.read === 'read' && f.isRead) ||
                         (filters.read === 'unread' && !f.isRead);
      
      const matchesRating = filters.rating === 'all' || 
                           f.rate?.toString() === filters.rating;

      return matchesSearch && matchesRead && matchesRating;
    });
  },

  // Computed: Get filtered schedules
  getFilteredSchedules: () => {
    const { schedules, filters } = get();
    return schedules.filter(schedule => {
      const matchesSearch = schedule.dayOfWeek.toLowerCase().includes(filters.search.toLowerCase()) ||
                           schedule.startTime.toLowerCase().includes(filters.search.toLowerCase()) ||
                           schedule.endTime.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesFilter = filters.day === 'all' || schedule.dayOfWeek === filters.day;
      
      return matchesSearch && matchesFilter;
    });
  },
  
  setAnalytics: (analytics) => set({ analytics }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Communication & Moderation
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),

  moderateContent: (contentId, action) => {
    // Logic for content moderation (e.g., hide/delete)
  },

  resolveComplaint: (complaintId) => set((state) => ({
    feedback: state.feedback.map(f => 
      f.id === complaintId ? { ...f, status: 'RESOLVED' } : f
    )
  }))
}));

export default useSystemStore;
