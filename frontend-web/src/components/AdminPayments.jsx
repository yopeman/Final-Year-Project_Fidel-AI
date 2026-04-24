import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';
import { GET_PAYMENTS, CANCEL_PAYMENT, DELETE_PAYMENT } from '../graphql/payment';

import useFinanceStore from '../store/financeStore';

const AdminPayments = ({ 
  onPaymentAction, 
  onEditPayment, 
  onViewPayment, 
  onDeletePayment 
}) => {
  const { 
    filters, 
    setFilters, 
    getFilteredTransactions, 
    getPaymentStats,
    setTransactions 
  } = useFinanceStore();
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PAYMENTS, {
    variables: { 
      enrollmentId: null,
      status: filters.status === 'all' ? null : filters.status 
    }
  });

  const [cancelPayment] = useMutation(CANCEL_PAYMENT);
  const [deletePayment] = useMutation(DELETE_PAYMENT);

  const payments = data?.payments || [];

  // Sync payments to store
  useEffect(() => {
    if (payments.length > 0) {
      setTransactions(payments);
    }
  }, [payments, setTransactions]);

  const filteredPayments = getFilteredTransactions()
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });


  // Get unique batches for filter

  // Get unique batches for filter
  const batches = [...new Map(payments.map(p => [p.enrollment.batch.id, p.enrollment.batch])).values()];

  const handlePaymentAction = async (paymentId, action) => {
    try {
      switch (action) {
        case 'cancel':
          await cancelPayment({ variables: { id: paymentId } });
          break;
        case 'delete':
          await deletePayment({ variables: { id: paymentId } });
          break;
      }
      refetch();
    } catch (err) {
      console.error('Error performing action:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'FAILED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-white/10 text-white border border-white/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'ETB'
    }).format(amount);
  };

  // Stats calculation removed (moved to effect)

  const stats = getPaymentStats();

  if (loading) {
    return (
      <div className="glass-premium rounded-3xl border border-white/10 p-10 shadow-2xl bg-white/5">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin"></div>
          <p className="text-accent-muted font-bold uppercase tracking-widest text-xs">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-premium rounded-3xl border border-white/10 p-10 shadow-2xl bg-white/5">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Error Loading Payments</h3>
          <p className="text-accent-secondary mb-4">Please try again.</p>
          <button 
            onClick={() => refetch()}
            className="bg-brand-yellow text-black px-5 py-3 rounded-2xl font-black hover:scale-105 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="glass-premium rounded-3xl border border-white/10 p-8 shadow-2xl bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-brand-yellow/10 transition-all duration-1000"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <CreditCard className="w-8 h-8 text-brand-yellow" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Payments</h2>
              <p className="text-accent-secondary mt-1 font-medium flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-yellow mr-2 animate-pulse"></span>
                Track transactions, fees, and receipt activity
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
            <span className="text-sm font-black text-white uppercase tracking-[0.2em]">
              {filteredPayments.length} Records
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6"
      >
        {[
          {
            label: 'Total Payments',
            value: stats.totalPayments,
            icon: CreditCard,
            accent: 'text-blue-400',
            glow: 'bg-blue-500/10 border-blue-500/20'
          },
          {
            label: 'Completed',
            value: stats.completedPayments,
            icon: CheckCircle,
            accent: 'text-green-400',
            glow: 'bg-green-500/10 border-green-500/20'
          },
          {
            label: 'Pending',
            value: stats.pendingPayments,
            icon: Clock,
            accent: 'text-yellow-400',
            glow: 'bg-yellow-500/10 border-yellow-500/20'
          },
          {
            label: 'Failed',
            value: stats.failedPayments,
            icon: XCircle,
            accent: 'text-red-400',
            glow: 'bg-red-500/10 border-red-500/20'
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue, 'ETB'),
            icon: DollarSign,
            accent: 'text-brand-yellow',
            glow: 'bg-brand-yellow/10 border-brand-yellow/20'
          }
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="glass-premium rounded-3xl border border-white/10 p-6 shadow-xl bg-white/5 backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">{item.label}</p>
                  <p className="text-2xl font-black text-white mt-3 tracking-tight">{item.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.glow}`}>
                  <Icon className={`w-6 h-6 ${item.accent}`} />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-premium rounded-3xl border border-white/10 p-6 shadow-xl bg-white/5 backdrop-blur-md"
      >
        <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-accent-muted w-5 h-5 group-focus-within:text-brand-yellow transition-colors" />
              <input
                type="text"
                placeholder="Search payments by user or batch..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-accent-muted focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 transition-all font-bold tracking-tight"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
                <Filter className="w-5 h-5 text-accent-muted ml-2" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ status: e.target.value })}
                  className="bg-transparent text-white font-bold px-4 py-2 focus:outline-none cursor-pointer appearance-none min-w-[150px]"
                >
                  <option value="all" className="bg-[#080C14] text-white">All Status</option>
                  <option value="COMPLETED" className="bg-[#080C14] text-white">Completed</option>
                  <option value="PENDING" className="bg-[#080C14] text-white">Pending</option>
                  <option value="FAILED" className="bg-[#080C14] text-white">Failed</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
                <Users className="w-5 h-5 text-accent-muted ml-2" />
                <select
                  value={filters.batch}
                  onChange={(e) => setFilters({ batch: e.target.value })}
                  className="bg-transparent text-white font-bold px-4 py-2 focus:outline-none cursor-pointer appearance-none min-w-[160px]"
                >
                  <option value="all" className="bg-[#080C14] text-white">All Batches</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id} className="bg-[#080C14] text-white">{batch.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-premium rounded-3xl border border-white/10 shadow-2xl bg-white/5 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <h3 className="text-xl font-bold text-white">Payment Records</h3>
          <p className="text-sm text-accent-secondary mt-1">{filteredPayments.length} payments found</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">User</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">Batch</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">Amount</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">Date</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-accent-muted uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-accent-secondary font-medium">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {payment.enrollment.profile.user.firstName} {payment.enrollment.profile.user.lastName}
                        </div>
                        <div className="text-sm text-accent-muted">{payment.enrollment.profile.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">{payment.enrollment.batch.name}</div>
                      <div className="text-sm text-accent-muted">Fee: {formatCurrency(payment.enrollment.batch.feeAmount, 'ETB')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-secondary">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowPaymentDetails(true);
                          }}
                          className="p-2.5 bg-white/5 hover:bg-brand-yellow/20 text-accent-muted hover:text-brand-yellow rounded-xl transition-all border border-white/5"
                          title="View payment"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payment.status === 'PENDING' && (
                          <button
                            onClick={() => handlePaymentAction(payment.id, 'cancel')}
                            className="p-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-xl transition-all border border-yellow-500/20"
                            title="Cancel payment"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePaymentAction(payment.id, 'delete')}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20"
                          title="Delete payment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {payment.receiptUrl && (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all border border-blue-500/20"
                            title="Open receipt"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="glass-premium bg-gradient-to-br from-[#080C14] to-[#0D1B2A]/90 rounded-[2.5rem] p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center border border-brand-yellow/20">
                  <CreditCard className="w-8 h-8 text-brand-yellow" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Payment Details</h3>
                  <p className="text-accent-secondary">Transaction #{selectedPayment.transactionId}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentDetails(false);
                  setSelectedPayment(null);
                }}
                className="p-2 rounded-xl text-accent-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-bold text-white mb-3">Payment Information</h4>
                <div className="space-y-2 text-sm text-accent-secondary">
                  <div className="flex justify-between gap-4">
                    <span>Amount:</span>
                    <span className="font-bold text-white">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Method:</span>
                    <span className="text-white">{selectedPayment.method || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Paid At:</span>
                    <span className="text-right text-white">{selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleString() : 'Not paid'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-bold text-white mb-3">User Information</h4>
                <div className="space-y-2 text-sm text-accent-secondary">
                  <div className="flex justify-between gap-4">
                    <span>Name:</span>
                    <span className="text-right text-white">{selectedPayment.enrollment.profile.user.firstName} {selectedPayment.enrollment.profile.user.lastName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Email:</span>
                    <span className="text-right text-white">{selectedPayment.enrollment.profile.user.email}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Batch:</span>
                    <span className="text-right text-white">{selectedPayment.enrollment.batch.name}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Enrollment Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPayment.enrollment.status === 'ENROLLED' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : selectedPayment.enrollment.status === 'APPLIED'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}>
                      {selectedPayment.enrollment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-bold text-white mb-3">Transaction Details</h4>
                <div className="space-y-2 text-sm text-accent-secondary">
                  <div className="flex justify-between gap-4">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-xs text-white text-right">{selectedPayment.transactionId}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Created:</span>
                    <span className="text-right text-white">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Updated:</span>
                    <span className="text-right text-white">{new Date(selectedPayment.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="font-bold text-white mb-3">Links</h4>
                <div className="space-y-2">
                  {selectedPayment.receiptUrl && (
                    <a
                      href={selectedPayment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-3 bg-green-500/10 text-green-400 rounded-2xl hover:bg-green-500/20 border border-green-500/20 transition-all font-bold"
                    >
                      View Receipt
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowPaymentDetails(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 px-4 py-3 bg-white/5 text-white rounded-2xl hover:bg-white/10 border border-white/10 transition-all font-bold"
              >
                Close
              </button>
              {selectedPayment.status === 'PENDING' && (
                <button
                  onClick={() => {
                    handlePaymentAction(selectedPayment.id, 'cancel');
                    setShowPaymentDetails(false);
                    setSelectedPayment(null);
                  }}
                  className="flex-1 px-4 py-3 bg-yellow-500/90 text-black rounded-2xl hover:bg-yellow-400 transition-all font-black"
                >
                  Cancel Payment
                </button>
              )}
              <button
                onClick={() => {
                  handlePaymentAction(selectedPayment.id, 'delete');
                  setShowPaymentDetails(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 px-4 py-3 bg-red-500/90 text-white rounded-2xl hover:bg-red-500 transition-all font-black"
              >
                Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;