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

    // Fetch all batches
    getBatches: async () => {
        try {
            set({ isLoading: true, error: null });
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
                    }
                }
            `;
            const data = await graphQLRequest(query);
            set({ batches: data.batches, isLoading: false });
            return { success: true, batches: data.batches };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch batches';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
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
                    getMeetingLink(courseScheduleId: $courseScheduleId) {
                        meetingLink
                        attendance {
                            status
                        }
                    }
                }
            `;
            const data = await graphQLRequest(query, { courseScheduleId });
            set({ isLoading: false });
            return { success: true, data: data.getMeetingLink };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to get meeting link';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    clearError: () => set({ error: null }),
}));
