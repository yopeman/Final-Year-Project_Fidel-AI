import { create } from 'zustand';

const usePerformanceStore = create((set, get) => ({
  studentEvaluations: [], // { studentId, batchId, scores: { reading, writing, speaking, listening }, remarks }
  feedbackHistory: [],
  loading: false,
  error: null,

  // Actions
  setEvaluations: (evaluations) => set({ studentEvaluations: evaluations }),
  
  setFeedbackHistory: (history) => set({ feedbackHistory: history }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Evaluation Management
  updateEvaluation: (studentId, batchId, scores, remarks) => set((state) => {
    const existing = state.studentEvaluations.find(e => e.studentId === studentId && e.batchId === batchId);
    const updated = existing
      ? state.studentEvaluations.map(e => e.studentId === studentId && e.batchId === batchId ? { ...e, scores, remarks, updatedAt: new Date().toISOString() } : e)
      : [...state.studentEvaluations, { studentId, batchId, scores, remarks, createdAt: new Date().toISOString() }];
    
    return { studentEvaluations: updated };
  }),

  // Computed: Get average progress for a batch
  getBatchProgress: (batchId) => {
    const { studentEvaluations } = get();
    const batchEvals = studentEvaluations.filter(e => e.batchId === batchId);
    if (batchEvals.length === 0) return 0;
    
    const totalScore = batchEvals.reduce((sum, evalItem) => {
      const avg = (evalItem.scores.reading + evalItem.scores.writing + evalItem.scores.speaking + evalItem.scores.listening) / 4;
      return sum + avg;
    }, 0);
    
    return totalScore / batchEvals.length;
  }
}));

export default usePerformanceStore;
