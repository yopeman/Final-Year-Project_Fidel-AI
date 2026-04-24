import { create } from 'zustand';

const useFinanceStore = create((set, get) => ({
  transactions: [],
  filters: {
    status: 'all',
    batch: 'all',
    search: '',
  },
  stats: {
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    totalRevenue: 0,
    tutorEarnings: 0,
    pendingWithdrawals: 0,
  },
  withdrawalRequests: [], // { id, amount, status, date }
  loading: false,
  error: null,

  // Actions
  setTransactions: (transactions) => set({ transactions }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  setStats: (stats) => set({ stats }),

  // Computed: Get filtered transactions
  getFilteredTransactions: () => {
    const { transactions, filters } = get();
    return transactions.filter(payment => {
      const matchesSearch = 
        payment.enrollment.profile.user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.enrollment.profile.user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.enrollment.profile.user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.enrollment.batch.name.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesBatch = filters.batch === 'all' || payment.enrollment.batch.id === filters.batch;
      const matchesStatus = filters.status === 'all' || payment.status === filters.status;
      
      return matchesSearch && matchesBatch && matchesStatus;
    });
  },
  
  // Computed: Get payment stats
  getPaymentStats: () => {
    const { transactions } = get();
    return {
      totalPayments: transactions.length,
      completedPayments: transactions.filter(p => p.status === 'COMPLETED').length,
      pendingPayments: transactions.filter(p => p.status === 'PENDING').length,
      failedPayments: transactions.filter(p => p.status === 'FAILED').length,
      totalRevenue: transactions
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0)
    };
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  setWithdrawalRequests: (requests) => set({ withdrawalRequests: requests }),

  requestWithdrawal: (amount) => set((state) => ({
    withdrawalRequests: [...state.withdrawalRequests, {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      status: 'PENDING',
      date: new Date().toISOString()
    }]
  })),

  // Financial Actions
  handleRefund: (transactionId) => set((state) => ({
    transactions: state.transactions.map(t => 
      t.id === transactionId ? { ...t, status: 'REFUNDED' } : t
    )
  })),

  resolveDispute: (disputeId, resolution) => {
    // Logic for dispute resolution state
  }
}));

export default useFinanceStore;
