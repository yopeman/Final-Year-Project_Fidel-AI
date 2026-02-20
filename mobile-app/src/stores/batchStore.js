import { create } from 'zustand';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper for direct graphQL calls since api.js might not cover everything yet
const graphQLRequest = async (query, variables = {}) => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
        const response = await axios.post(API_BASE_URL, { query, variables }, { headers });
        if (response.data.errors) throw { response: { data: { message: response.data.errors[0].message } } };
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const useBatchStore = create((set, get) => ({
    batches: [], // [Batch!]
    currentBatch: null,
    enrollments: [], // [BatchEnrollment!]
    schedules: [], // [CourseSchedule!]
    isLoading: false,
    error: null,

    // Premium access state — shared across screens
    premiumUnlocked: false,
    enrollmentStatusGlobal: null, // 'PENDING' | 'ENROLLED' | null

    // Fetch all batches
    getBatches: async (language = "English") => {
        try {
            set({ isLoading: true, error: null });
            // Using api.js batchAPI instead of direct call if possible, or keep direct if preferred.
            // Let's use the new batchAPI we just added to api.js (assuming it's imported or we use the direct graphQLRequest here)
            // For now, I'll update the query to match what we expect
            const query = `
                query batches {
                    batches {
                        id
                        name
                        description
                        level
                        language
                        startDate
                        endDate
                        status
                        feeAmount
                        maxStudents
                        enrollments {
                            id
                        }
                    }
                }
            `;
            const data = await graphQLRequest(query);
            set({ batches: data.batches, isLoading: false });
            return { success: true, batches: data.batches };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch batches';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Select a batch to view details
    selectBatch: async (batchId) => {
        try {
            set({ isLoading: true, error: null, currentBatch: null });
            // Using nested query as per Batch schema
            const query = `
                query batch($id: ID!) {
                    batch(id: $id) {
                        id
                        name
                        description
                        level
                        language
                        startDate
                        endDate
                        status
                        feeAmount
                        maxStudents
                        batchCourses {
                            id
                            course {
                                id
                                name
                                description
                            }
                            instructors {
                                id
                                role
                                user {
                                    firstName
                                    lastName
                                }
                            }
                        }
                    }
                }
            `;
            const data = await graphQLRequest(query, { id: batchId });

            // Map batchCourses to 'courses' prop expected by UI if needed, 
            // or just ensure UI uses batch.batchCourses.
            // Current UI uses currentBatch.courses. Let's map it.
            const batch = { ...data.batch, courses: data.batch.batchCourses };

            set({
                currentBatch: batch,
                isLoading: false
            });
            return { success: true, batch: batch };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false };
        }
    },

    // Check if user is enrolled in a specific batch
    checkEnrollmentStatus: async (batchId) => {
        try {
            set({ isLoading: true, error: null });
            // We need to fetch the profile to get enrollments
            // We can reuse profileStore logic or call api directly. 
            // Calling api directly here to avoid circular store dependencies or complex wiring.
            const { profileAPI } = require('../services/api'); // Dynamic import to avoid circular dependency issues if any

            const response = await profileAPI.getProfile();
            const profile = response.data.profile;

            if (!profile || !profile.batchEnrollments) {
                set({ isLoading: false });
                return { isEnrolled: false, status: null };
            }

            const enrollment = profile.batchEnrollments.find(e => e.batch.id === batchId);

            set({ isLoading: false });

            if (enrollment) {
                // Backend returns 'APPLIED' for enrolled-but-unpaid. Normalize to 'PENDING' for UI.
                const uiStatus = enrollment.status === 'APPLIED' ? 'PENDING' : enrollment.status;
                return { isEnrolled: true, status: uiStatus, enrollmentId: enrollment.id };
            }

            return { isEnrolled: false, status: null };
        } catch (error) {
            set({ isLoading: false });
            console.error("Check enrollment failed", error);
            return { isEnrolled: false, status: null, error: error.message };
        }
    },

    // Enroll in a batch
    enrollInBatch: async (batchId, studentId) => {
        try {
            set({ isLoading: true, error: null });
            const query = `
                mutation createEnrollment($batchId: ID!, $studentId: ID) {
                    createEnrollment(batchId: $batchId, studentId: $studentId) {
                        id
                        status
                        enrollmentDate
                        batch {
                            id
                            name
                            feeAmount
                        }
                    }
                }
            `;
            const data = await graphQLRequest(query, { batchId, studentId });
            // Update enrollments list
            const newEnrollment = data.createEnrollment;
            set(state => ({
                enrollments: [...state.enrollments, newEnrollment],
                isLoading: false
            }));
            return { success: true, enrollment: newEnrollment };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Initiate Payment
    initiatePayment: async (enrollmentId) => {
        try {
            set({ isLoading: true, error: null });
            const query = `
                mutation makePayment($enrollmentId: ID!) {
                    makePayment(enrollmentId: $enrollmentId) {
                        id
                        amount
                        currency
                        status
                        checkoutUrl
                    }
                }
            `;
            const data = await graphQLRequest(query, { enrollmentId });
            set({ isLoading: false });
            return { success: true, payment: data.makePayment };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Check Payment Status — also checks enrollment status directly as the source of truth
    checkPaymentStatus: async (enrollmentId) => {
        try {
            // Check enrollment status directly — most reliable after webhook
            const enrollmentQuery = `
                query enrollment($id: ID!) {
                    enrollment(id: $id) {
                        id
                        status
                    }
                }
            `;
            const enrollmentData = await graphQLRequest(enrollmentQuery, { id: enrollmentId });
            const enrollmentStatus = enrollmentData?.enrollment?.status;

            if (enrollmentStatus === 'ENROLLED' || enrollmentStatus === 'COMPLETED') {
                set(state => ({
                    enrollments: state.enrollments.map(e =>
                        e.id === enrollmentId ? { ...e, status: enrollmentStatus } : e
                    )
                }));
                return { success: true, status: 'COMPLETED' };
            }

            // Fallback: check payment records
            const paymentQuery = `
                query payments($enrollmentId: ID!) {
                    payments(enrollmentId: $enrollmentId) {
                        id
                        status
                    }
                }
            `;
            const data = await graphQLRequest(paymentQuery, { enrollmentId });
            const payments = data.payments;
            const completedPayment = payments.find(p => p.status === 'COMPLETED');

            if (completedPayment) {
                set(state => ({
                    enrollments: state.enrollments.map(e =>
                        e.id === enrollmentId ? { ...e, status: 'ENROLLED' } : e
                    )
                }));
                return { success: true, status: 'COMPLETED' };
            }

            return { success: true, status: 'PENDING' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Fetch enrollments for a batch
    getEnrollments: async (batchId) => {
        try {
            set({ isLoading: true, error: null });
            // Note: Schema 'enrollments(batchId: ID!): [BatchEnrollment!]!'
            const query = `
                query enrollments($batchId: ID!) {
                    enrollments(batchId: $batchId) {
                        id
                        status
                        enrollmentDate
                        profile {
                            id
                            nativeLanguage
                        }
                    }
                }
            `;
            const data = await graphQLRequest(query, { batchId });
            set({ enrollments: data.enrollments, isLoading: false });
            return { success: true, enrollments: data.enrollments };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false };
        }
    },

    // Fetch course schedules for a batch course
    getCourseSchedules: async (batchCourseId) => {
        try {
            set({ isLoading: true, error: null });
            const query = `
                query courseSchedules($batchCourseId: ID) {
                    courseSchedules(batchCourseId: $batchCourseId) {
                        id
                        status
                        schedule {
                            dayOfWeek
                            startTime
                            endTime
                        }
                        attendances {
                            id
                            userId
                            status
                            attendanceDate
                        }
                    }
                }
            `;
            const data = await graphQLRequest(query, { batchCourseId });
            set({ schedules: data.courseSchedules, isLoading: false });
            return { success: true, schedules: data.courseSchedules };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false };
        }
    },

    // Get meeting link (Mutation)
    getMeetingLink: async (courseScheduleId) => {
        try {
            set({ isLoading: true, error: null });
            const query = `
                mutation getMeetingLink($courseScheduleId: ID!) {
                    getCourseMeetingLink(courseScheduleId: $courseScheduleId) {
                        meetingLink
                        status
                        attendance {
                            status
                        }
                    }
                }
            `;
            const data = await graphQLRequest(query, { courseScheduleId });
            set({ isLoading: false });
            return { success: true, data: data.getCourseMeetingLink };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to get meeting link';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // AI Video Generation (Mock/Simulation)
    generatedVideos: [],
    generateAiVideos: async (language, level) => {
        set({ isLoading: true });
        // Simulate network delay for "AI" processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const recommendations = [
            { id: 'v1', title: `Learn ${language} in 30 Minutes`, thumbnail: 'https://img.youtube.com/vi/bQJ8006l42E/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=bQJ8006l42E', duration: '30:00' },
            { id: 'v2', title: `${language} for Beginners - Lesson 1`, thumbnail: 'https://img.youtube.com/vi/j5Qj724364o/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=j5Qj724364o', duration: '15:20' },
            { id: 'v3', title: `Top 50 ${language} Phrases`, thumbnail: 'https://img.youtube.com/vi/9QN8aQ9v_3o/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=9QN8aQ9v_3o', duration: '12:45' },
            { id: 'v4', title: `Advanced ${language} Grammar`, thumbnail: 'https://img.youtube.com/vi/8O_MwlZ2dEg/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=8O_MwlZ2dEg', duration: '45:10' },
        ];

        set({ generatedVideos: recommendations, isLoading: false });
        return { success: true, videos: recommendations };
    },


    // Unlock premium — verify payment status, auto-unlock in dev if backend not ready
    unlockPremium: async (enrollmentId) => {
        try {
            // Check enrollment/payment status directly (works without backend restart)
            const result = await get().checkPaymentStatus(enrollmentId);
            if (result.success && result.status === 'COMPLETED') {
                set({ premiumUnlocked: true, enrollmentStatusGlobal: 'ENROLLED' });
                return { success: true };
            }

            // DEV ONLY: auto-unlock if backend verification isn't ready yet
            // Remove this block before deploying to production
            const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
            if (isDev) {
                console.warn('[DEV] Payment not confirmed by backend — force-unlocking for development.');
                set({ premiumUnlocked: true, enrollmentStatusGlobal: 'ENROLLED' });
                return { success: true };
            }

            return { success: false, status: result.status || 'PENDING' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },


    // Get Batch meeting link
    getBatchMeetingLink: async (batchId) => {
        try {
            set({ isLoading: true, error: null });
            const query = `
                mutation getBatchMeetingLink($batchId: ID!) {
                    getBatchMeetingLink(batchId: $batchId) {
                        meetingLink
                        status
                    }
                }
            `;
            const data = await graphQLRequest(query, { batchId });
            set({ isLoading: false });
            return { success: true, data: data.getBatchMeetingLink };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to get batch meeting link';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    resetPremiumState: () => set({ premiumUnlocked: false, enrollmentStatusGlobal: null }),

    clearError: () => set({ error: null }),
}));
