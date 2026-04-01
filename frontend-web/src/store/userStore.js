import { create } from 'zustand';

const useUserStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  filters: {
    role: 'all',
    status: 'all',
    search: '',
  },
  loading: false,
  error: null,

  // Actions
  setUsers: (users) => set({ users }),
  
  setSelectedUser: (user) => set({ selectedUser: user }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Computed: Get filtered users
  getFilteredUsers: () => {
    const { users, filters } = get();
    return users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesRole = filters.role === 'all' || user.role.toLowerCase() === filters.role.toLowerCase();
      const matchesStatus = filters.status === 'all' || 
                           (filters.status === 'verified' && user.isVerified) ||
                           (filters.status === 'unverified' && !user.isVerified);
      return matchesSearch && matchesRole && matchesStatus;
    });
  },

  // User Actions (Status/Role)
  updateUserStatus: (userId, isVerified) => set((state) => ({
    users: state.users.map(user => 
      user.id === userId ? { ...user, isVerified } : user
    )
  })),

  // Security & System Control
  lockAccount: (userId) => set((state) => ({
    users: state.users.map(user => 
      user.id === userId ? { ...user, isLocked: true } : user
    )
  })),

  unlockAccount: (userId) => set((state) => ({
    users: state.users.map(user => 
      user.id === userId ? { ...user, isLocked: false } : user
    )
  })),

  resetFilters: () => set({
    filters: {
      role: 'all',
      status: 'all',
      search: '',
    }
  })
}));

export default useUserStore;
