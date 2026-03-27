import { create } from 'zustand';

const useBatchStore = create((set, get) => ({
  batches: [],
  selectedBatch: null,
  filters: {
    status: 'all',
    level: 'all',
    search: '',
  },
  loading: false,
  error: null,

  // Actions
  setBatches: (batches) => set({ batches }),
  
  setSelectedBatch: (batch) => set({ selectedBatch: batch }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Computed: Get filtered batches
  getFilteredBatches: () => {
    const { batches, filters } = get();
    return batches.filter(batch => {
      const matchesSearch = batch.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           batch.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'all' || batch.status === filters.status;
      const matchesLevel = filters.level === 'all' || batch.level === filters.level;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  },

  // Management Actions
  updateBatchStatus: (batchId, status) => set((state) => ({
    batches: state.batches.map(b => b.id === batchId ? { ...b, status } : b)
  })),

  assignTutor: (batchId, tutorId) => set((state) => ({
    batches: state.batches.map(b => b.id === batchId ? { ...b, tutorId } : b)
  })),

  updateCapacity: (batchId, capacity) => set((state) => ({
    batches: state.batches.map(b => b.id === batchId ? { ...b, maxStudents: capacity } : b)
  }))
}));

export default useBatchStore;
