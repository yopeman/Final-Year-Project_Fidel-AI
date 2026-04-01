import { create } from 'zustand';

const useAIStore = create((set, get) => ({
  usageStats: {
    totalRequests: 0,
    averageResponseTime: 0,
    costEstimate: 0,
  },
  limits: {
    freeLimit: 10,
    premiumLimit: 100,
  },
  learningPlans: [],
  loading: false,
  error: null,

  // Actions
  setUsageStats: (stats) => set({ usageStats: stats }),
  
  setLimits: (limits) => set({ limits }),
  
  setLearningPlans: (plans) => set({ learningPlans: plans }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // AI Control
  updatePlan: (userId, plan) => set((state) => ({
    learningPlans: state.learningPlans.map(p => 
      p.userId === userId ? { ...p, ...plan } : p
    )
  })),

  adjustLimits: (newLimits) => set((state) => ({
    limits: { ...state.limits, ...newLimits }
  }))
}));

export default useAIStore;
