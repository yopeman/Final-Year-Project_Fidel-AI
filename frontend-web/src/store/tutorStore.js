import { create } from 'zustand';

const useTutorStore = create((set, get) => ({
  profile: null,
  verificationDocs: [],
  availability: [], // { day, slots: [{ start, end }] }
  loading: false,
  error: null,

  // Actions
  setProfile: (profile) => set({ profile }),
  
  setVerificationDocs: (docs) => set({ verificationDocs: docs }),
  
  setAvailability: (availability) => set({ availability }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Availability Management
  addSlot: (day, slot) => set((state) => ({
    availability: state.availability.map(item => 
      item.day === day 
        ? { ...item, slots: [...item.slots, slot] }
        : item
    )
  })),

  removeSlot: (day, slotId) => set((state) => ({
    availability: state.availability.map(item => 
      item.day === day 
        ? { ...item, slots: item.slots.filter(s => s.id !== slotId) }
        : item
    )
  })),

  // Profile Onboarding
  updateProfileStep: (updates) => set((state) => ({
    profile: { ...state.profile, ...updates }
  }))
}));

export default useTutorStore;
