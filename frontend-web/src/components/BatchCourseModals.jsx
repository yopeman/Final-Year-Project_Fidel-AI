import React from 'react';
import { useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Trash2, 
  AlertTriangle, 
  User, 
  Clock, 
  UserX, 
  Calendar,
  Plus
} from 'lucide-react';
import { GET_SCHEDULES } from '../graphql/schedule';

// Assign Course Modal Component
export const AssignCourseModal = ({ isOpen, onClose, onSubmit, batchId, courses, isAssigning }) => {
  const [selectedCourseId, setSelectedCourseId] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCourseId) {
      onSubmit(batchId, selectedCourseId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[110]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium w-full max-w-md overflow-hidden border border-white/10 shadow-2xl rounded-3xl"
      >
        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-brand-yellow/10 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
              <BookOpen className="w-5 h-5 text-brand-yellow" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-widest">Assign Course</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-accent-secondary hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-accent-muted uppercase tracking-[0.2em] ml-1">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 appearance-none cursor-pointer font-bold"
              required
            >
              <option value="" className="bg-[#080C14]">Choose a course archive...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id} className="bg-[#080C14]">
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isAssigning}
              className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isAssigning || !selectedCourseId}
              className="flex-1 py-4 bg-brand-yellow text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,193,7,0.2)]"
            >
              {isAssigning ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mx-auto"></div>
              ) : (
                "Assign Asset"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Course Confirmation Modal Component
export const DeleteCourseConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium w-full max-w-sm overflow-hidden border border-white/10 shadow-2xl rounded-[2.5rem]"
      >
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center border border-red-500/30 mx-auto mb-8 shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">Remove Course?</h3>
          <p className="text-accent-secondary mb-10 font-medium leading-relaxed">
            This will decouple the course module from this batch. Archive data will remain intact elsewhere.
          </p>

          <div className="flex gap-4">
            <button onClick={onClose} disabled={isDeleting} className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">
              Keep
            </button>
            <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] text-xs uppercase tracking-widest">
              {isDeleting ? "Purging..." : "Confirm Removal"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// View Course Details Modal Component
export const ViewCourseDetailsModal = ({ isOpen, onClose, courseDetails, onAddInstructor, onDeleteInstructor, onAddSchedule, onDeleteSchedule, isAddingSchedule }) => {
  if (!isOpen || !courseDetails) return null;

  const [showAddScheduleModal, setShowAddScheduleModal] = React.useState(false);

  const handleAddSchedule = async (batchCourseId, scheduleId) => {
    await onAddSchedule(batchCourseId, scheduleId);
    setShowAddScheduleModal(false);
  };

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-premium w-full max-w-4xl max-h-[85vh] overflow-hidden border border-white/10 shadow-2xl flex flex-col rounded-[3rem]"
      >
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/5 to-transparent shrink-0">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30">
              <BookOpen className="w-7 h-7 text-brand-yellow" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{courseDetails.course?.name}</h3>
              <p className="text-accent-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Resource Management Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12 bg-white/[0.02]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Tutors Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h4 className="text-xs font-black text-accent-muted uppercase tracking-[0.3em] flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow mr-3 animate-pulse"></div>
                  Faculty / Tutors
                </h4>
                <button onClick={() => onAddInstructor(courseDetails.id)} className="px-5 py-2 bg-brand-yellow text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  Add Faculty
                </button>
              </div>
              <div className="space-y-4">
                {courseDetails.instructors?.length > 0 ? (
                  courseDetails.instructors?.map(instructor => (
                    <motion.div 
                      key={instructor.id} 
                      whileHover={{ x: 5 }}
                      className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:border-brand-yellow/20 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-yellow/20 to-transparent flex items-center justify-center font-black text-brand-yellow border border-brand-yellow/10">
                          {instructor.user?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-black tracking-tight">{instructor.user?.firstName} {instructor.user?.lastName}</p>
                          <p className="text-[10px] text-accent-muted uppercase font-black tracking-[0.2em] mt-0.5">{instructor.role}</p>
                        </div>
                      </div>
                      <button onClick={() => onDeleteInstructor(instructor.id)} className="p-3 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-xl transition-all border border-red-500/20 opacity-0 group-hover:opacity-100">
                        <UserX className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-40">
                    <User className="w-10 h-10 text-accent-muted mx-auto mb-3" />
                    <p className="text-[10px] font-black text-accent-muted uppercase tracking-widest">No Faculty Assigned</p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h4 className="text-xs font-black text-accent-muted uppercase tracking-[0.3em] flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green mr-3 animate-pulse"></div>
                  Temporal Slots
                </h4>
                <button onClick={() => setShowAddScheduleModal(true)} className="px-5 py-2 bg-brand-green/20 text-brand-green border border-brand-green/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  Add Slot
                </button>
                <AddScheduleModal isOpen={showAddScheduleModal} onClose={() => setShowAddScheduleModal(false)} onSubmit={handleAddSchedule} batchCourseId={courseDetails.id} isAdding={isAddingSchedule} />
              </div>
              <div className="space-y-4">
                {courseDetails.schedules?.length > 0 ? (
                  courseDetails.schedules?.map(item => (
                    <motion.div 
                      key={item.id} 
                      whileHover={{ x: 5 }}
                      className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:border-brand-green/20 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/10">
                          <Clock className="w-6 h-6 text-brand-green" />
                        </div>
                        <div>
                          <p className="text-white font-black tracking-tight uppercase tracking-widest text-xs">{item.schedule?.dayOfWeek}</p>
                          <p className="text-[10px] text-accent-muted font-black tracking-widest mt-0.5">{item.schedule?.startTime} — {item.schedule?.endTime}</p>
                        </div>
                      </div>
                      <button onClick={() => onDeleteSchedule(item.id)} className="p-3 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-xl transition-all border border-red-500/20 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-40">
                    <Calendar className="w-10 h-10 text-accent-muted mx-auto mb-3" />
                    <p className="text-[10px] font-black text-accent-muted uppercase tracking-widest">No Timing Defined</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 bg-[#080C14]/60 border-t border-white/10 flex justify-center shrink-0">
          <button
            onClick={onClose}
            className="px-10 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border border-white/10"
          >
            Close Console
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Add Instructor Modal Component
export const AddInstructorModal = ({ isOpen, onClose, onSubmit, batchCourseId, users, isAdding }) => {
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [role, setRole] = React.useState('MAIN');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[130]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-premium w-full max-w-md border border-white/10 shadow-2xl p-10 rounded-[2.5rem]"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-brand-yellow/20 rounded-2xl flex items-center justify-center border border-brand-yellow/30">
            <User className="w-6 h-6 text-brand-yellow" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Assign Faculty</h3>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.3em] ml-1">Select Professor</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-yellow/50 outline-none appearance-none font-bold"
            >
              <option value="" className="bg-[#080C14]">Choose from faculty list...</option>
              {users.filter(u => u.role === 'TUTOR').map(u => (
                <option key={u.id} value={u.id} className="bg-[#080C14]">{u.firstName} {u.lastName}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.3em] ml-1">Academic Role</label>
            <div className="grid grid-cols-2 gap-4">
              {['MAIN', 'ASSISTANT'].map(r => (
                <button 
                  key={r} 
                  type="button"
                  onClick={() => setRole(r)} 
                  className={`py-4 rounded-2xl font-black border transition-all text-xs tracking-widest ${role === r ? 'bg-brand-yellow border-brand-yellow text-black' : 'bg-white/5 border-white/10 text-accent-muted hover:bg-white/10'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Cancel</button>
            <button
              onClick={() => onSubmit(batchCourseId, selectedUserId, role)}
              disabled={isAdding || !selectedUserId}
              className="flex-1 py-4 bg-brand-yellow text-black rounded-2xl font-black hover:bg-brand-yellow-dark transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl"
            >
              {isAdding ? "Assigning..." : "Assign Faculty"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Delete Instructor Confirmation Modal Component
export const DeleteInstructorConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[140]">
       <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-premium w-full max-w-sm border border-white/10 shadow-2xl p-10 text-center rounded-[2.5rem]"
      >
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-2xl">
            <UserX className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">Revoke Access?</h3>
          <p className="text-accent-secondary mb-10 font-medium">This will terminate the faculty member's access to this specific course module.</p>
          <div className="flex gap-4">
            <button onClick={onClose} disabled={isDeleting} className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Cancel</button>
            <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 shadow-xl text-xs uppercase tracking-widest">
              {isDeleting ? "Revoking..." : "Revoke Access"}
            </button>
          </div>
       </motion.div>
    </div>
  );
};

// Add Schedule Modal Component
export const AddScheduleModal = ({ isOpen, onClose, onSubmit, batchCourseId, isAdding }) => {
  const [selectedScheduleId, setSelectedScheduleId] = React.useState('');
  const { data: schedulesData, loading: loadingSchedules } = useQuery(GET_SCHEDULES, {
    skip: !isOpen,
  });

  const availableSchedules = schedulesData?.schedules || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[130]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-premium w-full max-w-md border border-white/10 shadow-2xl p-10 rounded-[2.5rem]"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-brand-green/20 rounded-2xl flex items-center justify-center border border-brand-green/30">
            <Clock className="w-6 h-6 text-brand-green" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Map Time Slot</h3>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-accent-muted uppercase tracking-[0.3em] ml-1">Select Academic Slot</label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              disabled={loadingSchedules}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-green/50 outline-none appearance-none font-bold disabled:opacity-50"
            >
              <option value="" className="bg-[#080C14]">{loadingSchedules ? 'Loading slots...' : 'Choose a slot from vault...'}</option>
              {availableSchedules.map(s => (
                <option key={s.id} value={s.id} className="bg-[#080C14]">{s.dayOfWeek}: {s.startTime} — {s.endTime}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Abort</button>
            <button
              onClick={() => onSubmit(batchCourseId, selectedScheduleId)}
              disabled={isAdding || !selectedScheduleId || loadingSchedules}
              className="flex-1 py-4 bg-brand-green text-[#080C14] rounded-2xl font-black hover:bg-brand-green-dark transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl"
            >
              {isAdding ? "Mapping..." : "Map Slot"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Delete Schedule Confirmation Modal Component
export const DeleteScheduleConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#080C14]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[140]">
       <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass-premium w-full max-w-sm border border-white/10 shadow-2xl p-10 text-center rounded-[2.5rem]"
      >
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30 shadow-2xl">
            <Clock className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">Clear Slot?</h3>
          <p className="text-accent-secondary mb-10 font-medium">This timing will be removed from the course roadmap for this batch.</p>
          <div className="flex gap-4">
            <button onClick={onClose} disabled={isDeleting} className="flex-1 py-4 border border-white/10 rounded-2xl text-accent-muted font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest">Cancel</button>
            <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 shadow-xl text-xs uppercase tracking-widest">
              {isDeleting ? "Clearing..." : "Clear Slot"}
            </button>
          </div>
       </motion.div>
    </div>
  );
};
