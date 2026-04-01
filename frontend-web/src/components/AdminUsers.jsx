import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  User,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';

import useUserStore from '../store/userStore';

const AdminUsers = ({ 
  users, 
  loading, 
  onUserAction, 
  onEditUser, 
  onViewUser, 
  onDeleteUser,
  selectedUser,
  showUserDetails,
  setShowUserDetails
}) => {
  const { filters, setFilters, getFilteredUsers, setUsers } = useUserStore();

  // Sync users from props to store
  React.useEffect(() => {
    setUsers(users);
  }, [users, setUsers]);

  const filteredUsers = getFilteredUsers();

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'TUTOR': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (isVerified) => {
    return isVerified 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-12 pr-4 py-3 glass-premium border border-white/10 rounded-xl text-white placeholder:text-accent-muted focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filters.role}
            onChange={(e) => setFilters({ role: e.target.value })}
            className="flex-1 lg:flex-none px-4 py-3 glass-premium border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="tutor">Tutors</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="flex-1 lg:flex-none px-4 py-3 glass-premium border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </motion.div>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-2xl"
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">Active Users</h3>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-accent-secondary">
            {filteredUsers.length} total
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-accent-secondary font-medium">Synchronizing user data...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <UserX className="w-8 h-8 text-accent-muted" />
              </div>
              <p className="text-accent-secondary font-medium">No users match your filters.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-colors">
                      <User className="w-6 h-6 text-accent-secondary group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h4 className="text-base font-bold text-white">
                          {user.firstName} {user.lastName}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'ADMIN' ? 'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30' :
                          user.role === 'TUTOR' ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' :
                          'bg-primary/20 text-primary border border-primary/30'
                        }`}>
                          {user.role}
                        </span>
                        {user.isVerified && (
                          <CheckCircle className="w-3.5 h-3.5 text-brand-green" />
                        )}
                      </div>
                      <p className="text-sm text-accent-secondary font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => onViewUser(user)}
                      className="p-2.5 bg-white/5 border border-white/10 text-accent-secondary rounded-xl hover:text-white hover:bg-white/10 transition-all"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEditUser(user)}
                      className="p-2.5 bg-white/5 border border-white/10 text-accent-secondary rounded-xl hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      className="p-2.5 bg-white/5 border border-white/10 text-accent-secondary rounded-xl hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 transition-all"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="glass-premium rounded-2xl p-8 w-full max-w-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 yellow-glow">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-accent-secondary font-medium">{selectedUser.email}</p>
                  <div className="flex items-center flex-wrap gap-3 mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      selectedUser.role === 'ADMIN' ? 'bg-brand-indigo/20 text-brand-indigo' :
                      selectedUser.role === 'TUTOR' ? 'bg-brand-green/20 text-brand-green' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      selectedUser.isVerified ? 'bg-brand-green/20 text-brand-green' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {selectedUser.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowUserDetails(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-accent-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Identity</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-accent-secondary">Internal ID</span>
                    <span className="font-mono text-xs text-white bg-white/5 px-2 py-1 rounded">#{selectedUser.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-accent-secondary">Full Name</span>
                    <span className="text-white font-medium">{selectedUser.firstName} {selectedUser.lastName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-accent-secondary">Role</span>
                    <span className="text-white font-medium">{selectedUser.role}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Security</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-accent-secondary">Status</span>
                    <span className="text-white font-medium">{selectedUser.isVerified ? 'Fully Verified' : 'Standard User'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-accent-secondary">Joined</span>
                    <span className="text-white font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-accent-secondary">Activity</span>
                    <span className="text-white font-medium">Last updated {new Date(selectedUser.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  onEditUser(selectedUser);
                }}
                className="flex-1 px-6 py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/10 flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modify Permissions</span>
              </button>
              <button
                onClick={() => setShowUserDetails(false)}
                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminUsers;