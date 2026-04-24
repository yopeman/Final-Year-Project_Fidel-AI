import { create } from 'zustand';

const useSessionStore = create((set, get) => ({
  sessions: [],
  activeSession: null,
  attendance: {}, // { sessionId: [{ studentId, status, time }] }
  materials: [],
  loading: false,
  error: null,

  // Actions
  setSessions: (sessions) => set({ sessions }),
  
  setActiveSession: (session) => set({ activeSession: session }),
  
  setAttendance: (sessionId, data) => set((state) => ({
    attendance: { ...state.attendance, [sessionId]: data }
  })),

  setMaterials: (materials) => set({ materials }),
  
  setLoading: (loading) => set({ setLoading: loading }),
  
  setError: (error) => set({ setError: error }),

  // Attendance Management
  markAttendance: (sessionId, studentId, status) => set((state) => {
    const sessionAttendance = state.attendance[sessionId] || [];
    const updated = sessionAttendance.some(a => a.studentId === studentId)
      ? sessionAttendance.map(a => a.studentId === studentId ? { ...a, status, time: new Date().toISOString() } : a)
      : [...sessionAttendance, { studentId, status, time: new Date().toISOString() }];
    
    return {
      attendance: { ...state.attendance, [sessionId]: updated }
    };
  }),

  // Session Management
  startSession: (session) => set({ activeSession: { ...session, startTime: new Date().toISOString() } }),
  
  endSession: () => set((state) => ({
    activeSession: null,
    sessions: state.sessions.map(s => s.id === state.activeSession?.id ? { ...s, status: 'COMPLETED' } : s)
  })),

  // Computed
  getTotalStudents: () => {
    const { sessions } = get();
    const studentIds = new Set();

    sessions.forEach(session => {
      if (session.enrollments) {
        session.enrollments.forEach(e => {
          const resolvedStudentId = e.profile?.user?.id || e.profileId || e.studentId || e.id;
          if (resolvedStudentId) {
            studentIds.add(resolvedStudentId);
          }
        });
      }
    });

    return studentIds.size;
  },

  getActiveSessionsCount: () => {
    const { sessions } = get();
    return sessions.filter(s => s.status === 'ACTIVE').length;
  }
}));

export default useSessionStore;
