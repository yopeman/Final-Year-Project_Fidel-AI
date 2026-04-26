import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Layers, 
  Calendar, 
  Award, 
  Plus, 
  BookOpen, 
  User, 
  Clock, 
  Settings, 
  UserPlus, 
  Users, 
  Edit2, 
  Trash2, 
  Hash,
  Calendar as CalendarLucide
} from 'lucide-react';

// Helper functions for status colors
export const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return 'bg-brand-green/20 text-brand-green border border-brand-green/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase';
    case 'UPCOMING': return 'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase';
    case 'COMPLETED': return 'bg-accent-muted/20 text-accent-muted border border-accent-muted/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase';
    case 'CANCELLED': return 'bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase';
    default: return 'bg-white/5 text-accent-secondary border border-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase';
  }
};

export const getLevelColor = (level) => {
  switch (level) {
    case 'BEGINNER': return 'text-brand-green border-brand-green/30 bg-brand-green/10';
    case 'BASIC': return 'text-brand-indigo border-brand-indigo/30 bg-brand-indigo/10';
    case 'INTERMEDIATE': return 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10';
    case 'ADVANCED': return 'text-red-500 border-red-500/30 bg-red-500/10';
    default: return 'text-white border-white/10 bg-white/5';
  }
};

const ViewBatchModal = ({ isOpen, onClose, batch, onAssignCourse, onEnrollStudent, onUpdateEnrollment, onDeleteEnrollment, onViewCourseDetails, onAttendance, onCertificates }) => {
  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 bg-[#080C14]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-premium w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl flex flex-col rounded-[3rem]"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-yellow/10 to-transparent shrink-0">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/30 shadow-[0_0_20px_rgba(255,193,7,0.2)]">
              <Layers className="w-8 h-8 text-brand-yellow" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{batch.name}</h2>
              <div className="flex items-center space-x-4 mt-1.5">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getLevelColor(batch.level)} shadow-lg`}>
                  {batch.level}
                </span>
                <span className="text-accent-muted text-xs font-black uppercase tracking-widest flex items-center opacity-80">
                  <Calendar className="w-4 h-4 mr-2 text-brand-yellow" />
                  {new Date(batch.startDate).toLocaleDateString()} — {new Date(batch.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onAttendance(batch)}
              className="flex items-center space-x-3 px-6 py-3 bg-brand-indigo/10 hover:bg-brand-indigo/20 text-brand-indigo rounded-2xl transition-all border border-brand-indigo/20 font-black uppercase tracking-widest text-[10px] shadow-lg"
            >
              <CalendarLucide className="w-4 h-4" />
              <span>Attendance</span>
            </button>
            <button 
              onClick={() => onCertificates(batch)}
              className="flex items-center space-x-3 px-6 py-3 bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow rounded-2xl transition-all border border-brand-yellow/20 font-black uppercase tracking-widest text-[10px] shadow-lg"
            >
              <Award className="w-4 h-4" />
              <span>Certificates</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-white/10 rounded-full transition-all text-accent-muted hover:text-white border border-white/5"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white/[0.02]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Courses Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center">
                  <div className="w-2.5 h-10 bg-brand-yellow rounded-full mr-4 shadow-xl"></div>
                  Assigned Modules
                </h3>
                <button
                  onClick={() => onAssignCourse(batch.id)}
                  className="px-6 py-3 bg-brand-yellow text-black rounded-2xl text-[10px] font-black transition-all hover:scale-105 shadow-xl flex items-center space-x-2 uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Component</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {batch.batchCourses && batch.batchCourses.length > 0 ? (
                  batch.batchCourses.map((bc) => (
                    <motion.div 
                      key={bc.id} 
                      whileHover={{ x: 5 }}
                      className="group bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.08] transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => onViewCourseDetails(bc)}
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-brand-yellow/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-brand-yellow/10 transition-all"></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-5">
                          <div className="w-14 h-14 rounded-2xl bg-brand-indigo/20 flex items-center justify-center border border-brand-indigo/30 shadow-inner">
                            <BookOpen className="w-7 h-7 text-brand-indigo" />
                          </div>
                          <div>
                            <h4 className="font-black text-white text-lg group-hover:text-brand-yellow transition-colors tracking-tight italic uppercase">{bc.course?.name}</h4>
                            <div className="flex items-center space-x-5 mt-1.5">
                              <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-accent-muted">
                                <User className="w-4 h-4 mr-2 text-brand-indigo opacity-70" />
                                {bc.instructors?.length || 0} Faculty
                              </span>
                              <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-accent-muted">
                                <Clock className="w-4 h-4 mr-2 text-brand-green opacity-70" />
                                {bc.schedules?.length || 0} Slots
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewCourseDetails(bc);
                            }}
                            className="p-3 bg-white/5 hover:bg-brand-yellow/20 rounded-2xl text-accent-muted group-hover:text-brand-yellow transition-all border border-white/5 group-hover:border-brand-yellow/30 shadow-lg"
                            title="Manage Module"
                          >
                            <Settings className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 opacity-40">
                    <BookOpen className="w-16 h-16 text-accent-muted mx-auto mb-6" />
                    <p className="text-xs font-black text-accent-muted uppercase tracking-widest">No Active Modules Detected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Students Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center">
                  <div className="w-2.5 h-10 bg-brand-green rounded-full mr-4 shadow-xl"></div>
                  Student Assembly
                </h3>
                <button
                  onClick={() => onEnrollStudent(batch.id)}
                  className="px-6 py-3 bg-brand-green/20 hover:bg-brand-green/30 text-brand-green border border-brand-green/30 rounded-2xl text-[10px] font-black transition-all hover:scale-105 shadow-xl flex items-center space-x-2 uppercase tracking-widest"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll Assets</span>
                </button>
              </div>

              <div className="space-y-5">
                {batch.enrollments && batch.enrollments.length > 0 ? (
                  batch.enrollments.map((enrollment) => (
                    <motion.div 
                      key={enrollment.id} 
                      whileHover={{ x: 5 }}
                      className="group bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between hover:border-brand-green/30 transition-all shadow-lg"
                    >
                      <div className="flex items-center space-x-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center font-black text-brand-yellow text-xl shadow-inner">
                          {enrollment.profile?.user?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-white tracking-tight italic uppercase">{enrollment.profile?.user?.firstName} {enrollment.profile?.user?.lastName}</h4>
                          <p className="text-[10px] font-black text-accent-muted uppercase tracking-widest opacity-60 mt-1">{enrollment.profile?.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`${getStatusColor(enrollment.status)} shadow-lg`}>
                          {enrollment.status}
                        </span>
                        <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-inner">
                          <button
                            onClick={() => onUpdateEnrollment(enrollment)}
                            className="p-3 hover:bg-brand-indigo/20 text-accent-muted hover:text-brand-indigo transition-all border-r border-white/5"
                            title="Override Status"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onDeleteEnrollment(enrollment.id)}
                            className="p-3 hover:bg-red-500/20 text-accent-muted hover:text-red-400 transition-all"
                            title="Terminate Record"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 opacity-40">
                    <Users className="w-16 h-16 text-accent-muted mx-auto mb-6" />
                    <p className="text-xs font-black text-accent-muted uppercase tracking-widest">No Active Enrollment Assembly</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-white/10 bg-[#080C14]/60 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-brand-yellow opacity-60" />
              <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Batch ID: <span className="text-white italic">{batch.id}</span></span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-brand-green opacity-60" />
              <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Payload: <span className="text-white italic">{batch.enrollments?.length || 0} / {batch.capacity}</span></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-12 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border border-white/10 shadow-xl"
          >
            Close Batch Overview
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewBatchModal;
