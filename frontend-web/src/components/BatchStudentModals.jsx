import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  FileText, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { BASE_URL } from '../lib/apollo-client';

// Enroll Student Modal Component
export const EnrollStudentModal = ({ isOpen, onClose, onSubmit, batchId, users, isEnrolling }) => {
  const [selectedUserId, setSelectedUserId] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[110]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-premium w-full max-w-md border border-white/10 shadow-2xl p-10 rounded-[2.5rem]"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-brand-yellow/20 rounded-2xl flex items-center justify-center border border-brand-yellow/30">
            <Users className="w-6 h-6 text-brand-yellow" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Enroll Candidate</h3>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.3em] ml-1">Select Student Profile</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-yellow/50 outline-none appearance-none font-bold"
            >
              <option value="" className="bg-[#080C14]">Scan student database...</option>
              {users.filter(u => u.role === 'STUDENT').map(u => (
                <option key={u.id} value={u.id} className="bg-[#080C14]">{u.firstName} {u.lastName} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Abort</button>
            <button
              onClick={() => onSubmit(batchId, selectedUserId)}
              disabled={isEnrolling || !selectedUserId}
              className="flex-1 py-4 bg-brand-yellow text-black rounded-2xl font-black hover:bg-brand-yellow-dark transition-all shadow-[0_0_30px_rgba(255,193,7,0.2)] disabled:opacity-50 text-xs uppercase tracking-widest"
            >
              {isEnrolling ? "Processing..." : "Enroll Assets"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Update Enrollment Modal Component
export const UpdateEnrollmentModal = ({ isOpen, onClose, onSubmit, enrollment, isUpdating }) => {
  const [status, setStatus] = useState(enrollment?.status || 'ACTIVE');

  // Sync status when enrollment changes
  useEffect(() => {
    if (enrollment) {
      setStatus(enrollment.status);
    }
  }, [enrollment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[110]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-premium w-full max-w-md border border-white/10 shadow-2xl p-10 rounded-[2.5rem]"
      >
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-10 h-10 bg-brand-indigo/20 rounded-xl flex items-center justify-center border border-brand-indigo/30">
            <UserCheck className="w-5 h-5 text-brand-indigo" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase">Status Override</h3>
        </div>
        <p className="text-accent-muted text-[10px] font-black uppercase tracking-[0.2em] mb-8 ml-14">
          Updating record for: <span className="text-white italic">{enrollment?.profile?.user?.firstName} {enrollment?.profile?.user?.lastName}</span>
        </p>
        
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {['ACTIVE', 'INACTIVE', 'COMPLETED', 'DROPPED'].map(s => (
              <button 
                key={s} 
                onClick={() => setStatus(s)} 
                className={`py-4 rounded-2xl font-black border transition-all text-[10px] tracking-widest ${status === s ? 'bg-brand-indigo border-brand-indigo text-white shadow-xl' : 'bg-white/5 border-white/10 text-accent-muted hover:bg-white/10'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Cancel</button>
            <button
              onClick={() => onSubmit(enrollment.id, status)}
              disabled={isUpdating}
              className="flex-1 py-4 bg-brand-indigo text-white rounded-2xl font-black hover:bg-brand-indigo-dark transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl"
            >
              {isUpdating ? "Syncing..." : "Apply Changes"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Delete Enrollment Confirmation Modal Component
export const DeleteEnrollmentConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[120]">
       <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-premium w-full max-w-sm border border-white/10 shadow-2xl p-10 text-center rounded-[2.5rem]"
      >
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-2xl">
            <UserX className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">Terminate Record?</h3>
          <p className="text-accent-secondary mb-10 font-medium">This will permanently purge this student's enrollment from the batch roadmap.</p>
          <div className="flex gap-4">
            <button onClick={onClose} disabled={isDeleting} className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Keep</button>
            <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 shadow-xl text-xs uppercase tracking-widest">
              {isDeleting ? "Purging..." : "Confirm Removal"}
            </button>
          </div>
       </motion.div>
    </div>
  );
};

// Attendance Modal Component
export const AttendanceModal = ({ isOpen, onClose, batch, selectedDate, onDateChange, attendanceData, isFetching, onOpen }) => {
  useEffect(() => { if (isOpen && onOpen) onOpen(); }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/95 backdrop-blur-2xl flex items-center justify-center p-4 z-[110]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-premium w-full max-w-5xl max-h-[90vh] border border-white/10 shadow-2xl flex flex-col overflow-hidden rounded-[3rem]"
      >
        <div className="p-10 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/5 to-transparent shrink-0">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-2xl">
              <Calendar className="w-8 h-8 text-brand-yellow" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{batch?.name} Attendance</h3>
              <p className="text-accent-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Registry Log: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <div className="relative group">
               <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => onDateChange(e.target.value)} 
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white focus:ring-2 focus:ring-brand-yellow/50 outline-none font-black text-xs uppercase tracking-widest transition-all hover:bg-white/10 cursor-pointer" 
               />
             </div>
             <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all border border-white/10 text-accent-muted hover:text-white">
               <X className="w-8 h-8" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white/[0.02]">
          <div className="glass-premium border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-accent-muted">Active Student</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-accent-muted">Network Address</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-accent-muted text-center">Temporal Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isFetching ? (
                  <tr>
                    <td colSpan="3" className="px-10 py-20 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow mx-auto mb-4"></div>
                      <p className="text-[10px] font-black text-accent-muted uppercase tracking-widest animate-pulse">Scanning Cloud Registry...</p>
                    </td>
                  </tr>
                ) : attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-10 py-20 text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-20 border border-white/10">
                        <Users className="w-8 h-8 text-accent-muted" />
                      </div>
                      <p className="text-[10px] font-black text-accent-muted uppercase tracking-widest">No candidates found for this temporal slot.</p>
                    </td>
                  </tr>
                ) : (
                  attendanceData.map(record => (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-10 py-6 text-white font-black tracking-tight text-base group-hover:text-brand-yellow transition-colors">{record.user?.firstName} {record.user?.lastName}</td>
                      <td className="px-10 py-6 text-accent-muted text-xs font-mono opacity-60 italic">{record.user?.email}</td>
                      <td className="px-10 py-6 text-center">
                        <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest shadow-sm ${
                          record.status === 'PRESENT' 
                            ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' 
                            : record.status === 'ABSENT' 
                              ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                              : 'bg-white/10 text-accent-muted border border-white/10 uppercase'
                        }`}>
                          {record.status || 'UNMARKED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Certificates Modal Component
export const CertificatesModal = ({ isOpen, onClose, batch, certificatesData, isFetching, onHandleDeleteCertificate, isDeletingCertificate }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#080C14]/95 backdrop-blur-2xl flex items-center justify-center p-4 z-[110]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-premium w-full max-w-6xl max-h-[90vh] border border-white/10 shadow-2xl flex flex-col overflow-hidden rounded-[3rem]"
      >
         <div className="p-10 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-indigo/10 to-transparent shrink-0">
           <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-indigo/20 flex items-center justify-center border border-brand-indigo/30 shadow-2xl">
                <FileText className="w-8 h-8 text-brand-indigo" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{batch?.name} Credentials</h3>
                <p className="text-accent-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Reviewing issued academic certifications</p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all border border-white/10 text-accent-muted hover:text-white">
             <X className="w-8 h-8" />
           </button>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white/[0.02]">
            <div className="glass-premium border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-white/5">
                       <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-accent-muted">Academic Asset</th>
                       <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-accent-muted text-center">Aggregation Result</th>
                       <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-accent-muted text-center">Protocol Date</th>
                       <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-accent-muted text-right">Access Protocols</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {isFetching ? (
                     <tr>
                        <td colSpan="4" className="px-10 py-20 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-indigo mx-auto mb-4"></div>
                          <p className="text-[10px] font-black text-accent-muted uppercase tracking-widest animate-pulse">Scanning Credential Ledger...</p>
                        </td>
                     </tr>
                   ) : certificatesData.length === 0 ? (
                     <tr>
                        <td colSpan="4" className="px-10 py-20 text-center">
                          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-20 border border-white/10">
                            <FileText className="w-8 h-8 text-accent-muted" />
                          </div>
                          <p className="text-[10px] font-black text-accent-muted uppercase tracking-widest">No valid credentials found in current roadmap.</p>
                        </td>
                     </tr>
                   ) : (
                     certificatesData.map(cert => (
                       <tr key={cert.id} className="hover:bg-white/5 transition-colors group">
                         <td className="px-10 py-6">
                           <div className="text-white font-black tracking-tight text-base group-hover:text-brand-indigo transition-colors">{cert.skill?.enrollment?.profile?.user?.firstName} {cert.skill?.enrollment?.profile?.user?.lastName}</div>
                           <div className="text-[10px] text-accent-muted font-mono uppercase tracking-tighter mt-0.5">UID: {cert.id}</div>
                         </td>
                         <td className="px-10 py-6 text-center">
                            <span className="text-brand-yellow font-black text-sm tracking-widest bg-brand-yellow/10 px-4 py-2 rounded-xl border border-brand-yellow/20">{cert.skill?.finalResult || 'PENDING'}</span>
                         </td>
                         <td className="px-10 py-6 text-center text-accent-muted text-[10px] font-black uppercase tracking-widest">
                           {new Date(cert.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                         </td>
                         <td className="px-10 py-6 text-right">
                           <div className="flex justify-end space-x-3">
                             <button onClick={() => window.open(`${BASE_URL}/certificates/${cert.id}`, '_blank')} className="px-5 py-2.5 bg-brand-indigo/20 text-brand-indigo rounded-xl text-[10px] font-black hover:bg-brand-indigo/30 transition-all border border-brand-indigo/30 uppercase tracking-widest shadow-lg">VIEW</button>
                             <button onClick={() => onHandleDeleteCertificate(cert.id)} disabled={isDeletingCertificate} className="px-5 py-2.5 bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black hover:bg-red-500/30 transition-all border border-red-500/30 uppercase tracking-widest shadow-lg">DELETE</button>
                           </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            </div>
         </div>
      </motion.div>
    </div>
  );
};

// Delete Certificate Confirmation Modal Component
export const DeleteCertificateConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[150]">
       <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-premium w-full max-w-sm border border-white/10 shadow-2xl p-10 text-center rounded-[2.5rem]"
      >
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-2xl">
            <Trash2 className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">Invalidate Asset?</h3>
          <p className="text-accent-secondary mb-10 font-medium leading-relaxed text-sm">This will permanently terminate this academic credential from the student ledger. This action is terminal.</p>
          <div className="flex gap-4">
            <button onClick={onClose} disabled={isDeleting} className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Abort</button>
            <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 shadow-xl text-xs uppercase tracking-widest">
              {isDeleting ? "Invalidating..." : "Finalize Deletion"}
            </button>
          </div>
       </motion.div>
    </div>
  );
};
