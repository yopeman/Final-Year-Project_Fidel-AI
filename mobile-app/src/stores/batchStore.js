import { create } from 'zustand';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for persistence
const STORAGE_KEYS = {
    PREMIUM_UNLOCKED: 'batch_premium_unlocked',
    ENROLLMENTS: 'batch_enrollments',
    ENROLLMENT_STATUS: 'batch_enrollment_status',
    BATCHES: 'batches_cache',
    LAST_SYNC: 'batch_last_sync',
    PAYMENTS: 'batch_payments_cache',
    ACTIVE_BATCH_ID: 'batch_active_id'
};

// Helper for direct graphQL calls
const graphQLRequest = async (query, variables = {}) => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
        const response = await axios.post(API_BASE_URL, { query, variables }, { headers });
        if (response.data.errors) {
            console.error('GraphQL Errors:', response.data.errors);
            throw new Error(response.data.errors[0].message);
        }
        return response.data.data;
    } catch (error) {
        if (error.response) {
            // Server responded with non-2xx code
            console.error('GraphQL API Error Response:', error.response.status, error.response.data);
            if (error.response.status === 503) {
                throw new Error("Service Temporarily Unavailable (503). Backend might be offline.");
            }
            // Include server error details in the message
            const serverMsg = error.response.data?.errors?.[0]?.message || JSON.stringify(error.response.data);
            throw new Error(`Server Error (${error.response.status}): ${serverMsg}`);
        } else if (error.request) {
            // Request was made but no response received
            console.error('GraphQL Network Error (No Response):', error.message);
            throw new Error("Network Error: Could not connect to API. Please check your internet or if the server is running.");
        } else {
            console.error('GraphQL Error:', error.message);
        }
        throw error;
    }
};

// Helper to load persisted data
const loadPersistedData = async () => {
    try {
        const [
            premiumUnlocked,
            enrollments,
            enrollmentStatus,
            batches,
            lastSync,
            payments,
            activeBatchId
        ] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_UNLOCKED),
            AsyncStorage.getItem(STORAGE_KEYS.ENROLLMENTS),
            AsyncStorage.getItem(STORAGE_KEYS.ENROLLMENT_STATUS),
            AsyncStorage.getItem(STORAGE_KEYS.BATCHES),
            AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC),
            AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS),
            AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_BATCH_ID)
        ]);

        return {
            premiumUnlocked: premiumUnlocked ? JSON.parse(premiumUnlocked) : false,
            enrollments: enrollments ? JSON.parse(enrollments) : [],
            enrollmentStatusGlobal: enrollmentStatus || null,
            batchesCache: batches ? JSON.parse(batches) : [],
            paymentsCache: payments ? JSON.parse(payments) : [],
            lastSync: lastSync || null,
            activeBatchId: activeBatchId || null
        };
    } catch (error) {
        console.error('Error loading persisted data:', error);
        return {
            premiumUnlocked: false,
            enrollments: [],
            enrollmentStatusGlobal: null,
            batchesCache: [],
            paymentsCache: [],
            lastSync: null
        };
    }
};

export const useBatchStore = create((set, get) => ({
    // State
    batches: [],
    currentBatch: null,
    enrollments: [],
    schedules: [],
    payments: [],
    generatedVideos: [],
    isLoading: false,
    error: null,
    premiumUnlocked: false,
    enrollmentStatusGlobal: null,
    activeBatchId: null,
    lastSync: null,
    currentPayment: null,

    // Initialize store with persisted data
    initializeStore: async () => {
        try {
            set({ isLoading: true });
            const persisted = await loadPersistedData();

            set({
                premiumUnlocked: persisted.premiumUnlocked,
                enrollments: persisted.enrollments,
                enrollmentStatusGlobal: persisted.enrollmentStatusGlobal,
                batches: persisted.batchesCache,
                payments: persisted.paymentsCache,
                lastSync: persisted.lastSync,
                activeBatchId: persisted.activeBatchId,
                isLoading: false
            });

            console.log('[BatchStore] Initialized with persisted data:', {
                premiumUnlocked: persisted.premiumUnlocked,
                enrollmentsCount: persisted.enrollments.length,
                batchesCount: persisted.batchesCache.length
            });

            return { success: true };
        } catch (error) {
            console.error('[BatchStore] Initialization error:', error);
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    // Save current state to persistence
    persistState: async () => {
        try {
            const state = get();
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_UNLOCKED, JSON.stringify(state.premiumUnlocked)),
                AsyncStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(state.enrollments)),
                AsyncStorage.setItem(STORAGE_KEYS.ENROLLMENT_STATUS, JSON.stringify(state.enrollmentStatusGlobal)),
                AsyncStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(state.batches)),
                AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(state.payments)),
                AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_BATCH_ID, state.activeBatchId || ''),
                AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
            ]);
            console.log('[BatchStore] State persisted successfully');
        } catch (error) {
            console.error('[BatchStore] Persistence error:', error);
        }
    },

    // Fetch all batches with cache support
    getBatches: async (language = "English", forceRefresh = false) => {
        try {
            set({ isLoading: true, error: null });

            // Check cache
            const state = get();
            const cacheAge = state.lastSync ? (Date.now() - new Date(state.lastSync).getTime()) / 1000 : null;

            if (!forceRefresh && state.batches.length > 0 && cacheAge && cacheAge < 300) {
                console.log('[BatchStore] Using cached batches');
                set({ isLoading: false });
                return { success: true, batches: state.batches, cached: true };
            }

            const query = `
                query GetBatches {
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
                            status
                        }
                    }
                }
            `;

            const data = await graphQLRequest(query);

            set({
                batches: data.batches,
                isLoading: false,
                lastSync: new Date().toISOString()
            });

            await get().persistState();

            return { success: true, batches: data.batches };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch batches';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Get single batch by ID
    getBatchById: async (batchId) => {
        try {
            set({ isLoading: true, error: null });

            const query = `
                query GetBatch($id: ID!) {
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
                        courses: batchCourses {
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
                                    email
                                }
                            }
                        }
                        enrollments {
                            id
                            status
                            enrollmentDate
                        }
                    }
                }
            `;

            const data = await graphQLRequest(query, { id: batchId });

            set({
                currentBatch: data.batch,
                isLoading: false
            });

            return { success: true, batch: data.batch };
        } catch (error) {
            const errorMsg = error.message || 'Failed to fetch batch';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Check enrollment status
    checkEnrollmentStatus: async (batchId) => {
        try {
            set({ isLoading: true, error: null });

            // Check local enrollments first
            const state = get();
            const localEnrollment = state.enrollments.find(e => e.batch?.id === batchId);

            if (localEnrollment) {
                const isPremium = localEnrollment.status === 'ENROLLED' || localEnrollment.status === 'COMPLETED';
                set({
                    isLoading: false,
                    premiumUnlocked: isPremium || state.premiumUnlocked,
                    enrollmentStatusGlobal: isPremium ? 'ENROLLED' : state.enrollmentStatusGlobal
                });
                return {
                    isEnrolled: true,
                    status: localEnrollment.status,
                    enrollmentId: localEnrollment.id,
                    cached: true
                };
            }

            // Fetch from API
            const query = `
                query GetMyEnrollments {
                    me {
                        batchEnrollments {
                            id
                            status
                            enrollmentDate
                            batch {
                                id
                                name
                                feeAmount
                            }
                            payments {
                                id
                                status
                                amount
                            }
                        }
                    }
                }
            `;

            const data = await graphQLRequest(query);
            const enrollments = data?.me?.batchEnrollments || [];

            // Find enrollment for this batch
            const enrollment = enrollments.find(e => e.batch.id === batchId);

            if (enrollment) {
                const uiStatus = enrollment.status === 'APPLIED' ? 'PENDING' : enrollment.status;

                // Update local enrollments and global state
                const isPremium = enrollment.status === 'ENROLLED' || enrollment.status === 'COMPLETED';
                set(state => ({
                    enrollments: [...state.enrollments, enrollment],
                    premiumUnlocked: isPremium || state.premiumUnlocked,
                    enrollmentStatusGlobal: isPremium ? 'ENROLLED' : state.enrollmentStatusGlobal,
                    isLoading: false
                }));

                await get().persistState();

                return {
                    isEnrolled: true,
                    status: uiStatus,
                    enrollmentId: enrollment.id
                };
            }

            set({ isLoading: false });
            return { isEnrolled: false, status: null };
        } catch (error) {
            console.error("Check enrollment failed", error);
            set({ isLoading: false, error: error.message });
            return { isEnrolled: false, status: null, error: error.message };
        }
    },

    // Enroll in a batch
    enrollInBatch: async (batchId, studentId) => {
        try {
            set({ isLoading: true, error: null });

            const query = `
                mutation CreateEnrollment($batchId: ID!, $studentId: ID) {
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
            const newEnrollment = data.createEnrollment;

            set(state => ({
                enrollments: [...state.enrollments, newEnrollment],
                enrollmentStatusGlobal: newEnrollment.status,
                isLoading: false
            }));

            await get().persistState();

            return { success: true, enrollment: newEnrollment };
        } catch (error) {
            const errorMsg = error.message || 'Failed to enroll in batch';

            // Handle "already enrolled" case gracefully
            if (errorMsg.includes('already enrolled')) {
                const statusResult = await get().checkEnrollmentStatus(batchId);
                if (statusResult.isEnrolled) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        isDuplicate: true,
                        enrollmentId: statusResult.enrollmentId,
                        status: statusResult.status
                    };
                }
            }

            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Initiate Payment
    initiatePayment: async (enrollmentId) => {
        try {
            set({ isLoading: true, error: null });

            const query = `
                mutation MakePayment($enrollmentId: ID!) {
                    makePayment(enrollmentId: $enrollmentId) {
                        id
                        amount
                        currency
                        status
                        checkoutUrl
                        transactionId
                        createdAt
                    }
                }
            `;

            const data = await graphQLRequest(query, { enrollmentId });
            const payment = data.makePayment;

            set(state => ({
                currentPayment: payment,
                payments: [...state.payments, payment],
                isLoading: false
            }));

            await get().persistState();

            return { success: true, payment };
        } catch (error) {
            const errorMsg = error.message || 'Failed to initiate payment';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Cancel a pending payment
    cancelPayment: async (paymentId) => {
        try {
            set({ isLoading: true, error: null });

            const query = `
                mutation CancelPayment($id: ID!) {
                    cancelPayment(id: $id) {
                        id
                        status
                        updatedAt
                    }
                }
            `;

            const data = await graphQLRequest(query, { id: paymentId });
            const canceledPayment = data.cancelPayment;

            set(state => ({
                currentPayment: state.currentPayment?.id === paymentId ? canceledPayment : state.currentPayment,
                payments: state.payments.map(p => p.id === paymentId ? canceledPayment : p),
                isLoading: false
            }));

            await get().persistState();

            return { success: true, payment: canceledPayment };
        } catch (error) {
            const errorMsg = error.message || 'Failed to cancel payment';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Verify Payment and Unlock Premium
    verifyPaymentAndUnlock: async (enrollmentId) => {
        try {
            set({ isLoading: true, error: null });

            // CRITICAL FIX: Call verifyPayment mutation which does server-side validation with Chapa
            const query = `
            mutation VerifyPayment($enrollmentId: ID!) {
                verifyPayment(enrollmentId: $enrollmentId) {
                    id
                    status
                    amount
                    currency
                    transactionId
                    paidAt
                    enrollment {
                        id
                        status
                        batch {
                            id
                            name
                            feeAmount
                        }
                    }
                }
            }
        `;

            const data = await graphQLRequest(query, { enrollmentId });
            const verifiedPayment = data?.verifyPayment;

            // Check the verification result from backend
            if (verifiedPayment && verifiedPayment.status === 'COMPLETED') {
                // Backend confirmed payment - safe to unlock

                set(state => {
                    // Update enrollments with new status
                    const updatedEnrollments = state.enrollments.map(e =>
                        e.id === enrollmentId
                            ? {
                                ...e,
                                status: 'ENROLLED',
                                payments: verifiedPayment ? [verifiedPayment] : (e.payments || [])
                            }
                            : e
                    );

                    // Update payments
                    const updatedPayments = state.payments.map(p =>
                        p.id === verifiedPayment?.id ? verifiedPayment : p
                    );

                    // If payment not in list, add it
                    if (verifiedPayment && !state.payments.some(p => p.id === verifiedPayment.id)) {
                        updatedPayments.push(verifiedPayment);
                    }

                    return {
                        premiumUnlocked: true,
                        enrollmentStatusGlobal: 'ENROLLED',
                        enrollments: updatedEnrollments,
                        payments: updatedPayments,
                        currentPayment: verifiedPayment,
                        isLoading: false,
                        error: null
                    };
                });

                // Persist the unlocked state
                await get().persistState();

                return {
                    success: true,
                    verified: true,
                    payment: verifiedPayment,
                    message: 'Payment verified successfully'
                };

            } else if (verifiedPayment) {
                // Payment exists but not completed
                set({
                    isLoading: false,
                    error: 'Payment not yet completed'
                });

                return {
                    success: true,
                    verified: false,
                    status: verifiedPayment.status || 'PENDING',
                    payment: verifiedPayment
                };
            }

            // No payment object returned
            set({
                isLoading: false,
                error: 'Verification failed: No payment record found'
            });

            return {
                success: false,
                verified: false,
                error: 'Failed to find payment record'
            };

        } catch (error) {
            console.error("verifyPaymentAndUnlock Error:", error);
            set({
                error: error.message || 'Verification failed',
                isLoading: false
            });
            return {
                success: false,
                verified: false,
                error: error.message || 'Verification failed'
            };
        }
    },

    // Also fix checkPaymentStatus to not auto-verify
    checkPaymentStatus: async (enrollmentId) => {
        try {
            set({ isLoading: true, error: null });

            // Query for payment status only - don't auto-verify
            const paymentQuery = `
            query GetPayments($enrollmentId: ID!) {
                payments(enrollmentId: $enrollmentId) {
                    id
                    status
                    amount
                    currency
                    transactionId
                    paidAt
                    receiptUrl
                    createdAt
                    updatedAt
                    enrollment {
                        id
                        status
                    }
                }
            }
        `;

            const paymentData = await graphQLRequest(paymentQuery, { enrollmentId });
            const payments = paymentData?.payments || [];
            const completedPayment = payments.find(p => p.status === 'COMPLETED');

            // Check if enrollment already shows premium
            const hasPremiumEnrollment = payments.some(p =>
                p.enrollment?.status === 'ENROLLED'
            );

            // CRITICAL FIX: Don't auto-verify here - just report status
            if (hasPremiumEnrollment || completedPayment) {
                set({
                    premiumUnlocked: true,
                    enrollmentStatusGlobal: 'ENROLLED',
                    payments: payments,
                    currentPayment: completedPayment || payments[0],
                    isLoading: false
                });

                return {
                    success: true,
                    status: 'COMPLETED',
                    payment: completedPayment,
                    verified: true // Already verified
                };
            }

            set({
                isLoading: false,
                payments: payments,
                currentPayment: payments[0] || null
            });

            return {
                success: true,
                status: payments[0]?.status || 'PENDING',
                payments,
                payment: payments[0] || null
            };

        } catch (error) {
            console.error("checkPaymentStatus Error:", error);
            set({
                isLoading: false,
                error: error.message
            });
            return {
                success: false,
                error: error.message,
                status: 'PENDING'
            };
        }
    },

    // Fix initiatePayment to properly create payment record
    initiatePayment: async (enrollmentId) => {
        try {
            set({ isLoading: true, error: null });

            const query = `
            mutation MakePayment($enrollmentId: ID!) {
                makePayment(enrollmentId: $enrollmentId) {
                    id
                    amount
                    currency
                    status
                    checkoutUrl
                    transactionId
                    createdAt
                    enrollment {
                        id
                        status
                    }
                }
            }
        `;

            const data = await graphQLRequest(query, { enrollmentId });
            const payment = data.makePayment;

            // Check if payment is already completed
            if (payment.status === 'COMPLETED') {
                set(state => ({
                    currentPayment: payment,
                    payments: [...state.payments, payment],
                    premiumUnlocked: true,
                    enrollmentStatusGlobal: 'ENROLLED',
                    isLoading: false
                }));
            } else {
                set(state => ({
                    currentPayment: payment,
                    payments: [...state.payments, payment],
                    isLoading: false
                }));
            }

            await get().persistState();

            return { success: true, payment };
        } catch (error) {
            const errorMsg = error.message || 'Failed to initiate payment';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Add a new method to handle webhook notifications
    handlePaymentWebhook: async (enrollmentId) => {
        try {
            // This would be called when your app receives a push notification
            // or when the webhook server notifies the client via socket
            const result = await get().verifyPaymentAndUnlock(enrollmentId);
            return result;
        } catch (error) {
            console.error('Webhook handling error:', error);
            return { success: false, error: error.message };
        }
    },
    // Get course schedules
    getCourseSchedules: async (batchCourseId) => {
        try {
            set({ isLoading: true, error: null });

            const query = `
                query GetCourseSchedules($batchCourseId: ID) {
                    courseSchedules(batchCourseId: $batchCourseId) {
                        id
                        schedule {
                            dayOfWeek
                            startTime
                            endTime
                        }
                        attendances {
                            id
                            status
                        }
                    }
                }
            `;

            const data = await graphQLRequest(query, { batchCourseId });
            return { success: true, schedules: data.courseSchedules || [] };
        } catch (error) {
            const errorMsg = error.message || 'Failed to fetch schedules';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        } finally {
            set({ isLoading: false });
        }
    },

    // Aggregates schedules for all courses in a batch
    getBatchSchedules: async (batchId) => {
        try {
            set({ isLoading: true, error: null });

            // Ensure we have batch info (especially courses)
            let batch = get().currentBatch;
            if (!batch || batch.id !== batchId) {
                const res = await get().getBatchById(batchId);
                if (!res.success) throw new Error(res.error);
                batch = res.batch;
            }

            if (!batch || !batch.courses || batch.courses.length === 0) {
                set({ schedules: [], isLoading: false });
                return { success: true, schedules: [] };
            }

            // Fetch schedules for each course
            const allSchedules = [];
            for (const course of batch.courses) {
                const res = await get().getCourseSchedules(course.id);
                if (res.success) {
                    allSchedules.push(...res.schedules);
                }
            }

            set({
                schedules: allSchedules,
                isLoading: false
            });

            return { success: true, schedules: allSchedules };
        } catch (error) {
            const errorMsg = error.message || 'Failed to aggregate batch schedules';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Get meeting link for course
    getMeetingLink: async (courseScheduleId) => {
        try {
            set({ isLoading: true, error: null });

            const query = `
                mutation GetMeetingLink($courseScheduleId: ID!) {
                    getCourseMeetingLink(courseScheduleId: $courseScheduleId) {
                        meetingLink
                    }
                }
            `;

            const data = await graphQLRequest(query, { courseScheduleId });

            set({ isLoading: false });

            return {
                success: true,
                data: data.getCourseMeetingLink
            };
        } catch (error) {
            const errorMsg = error.message || 'Failed to get meeting link';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },


    // Generate AI video recommendations
    generateAiVideos: async (language, level) => {
        try {
            set({ isLoading: true, error: null });

            // Simulate AI processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock AI-generated recommendations
            const recommendations = [
                {
                    id: 'v1',
                    title: `Learn ${language} in 30 Minutes`,
                    thumbnail: 'https://img.youtube.com/vi/bQJ8006l42E/hqdefault.jpg',
                    url: 'https://www.youtube.com/watch?v=bQJ8006l42E',
                    duration: '30:00',
                    level: level,
                    topics: ['Basics', 'Greetings', 'Numbers']
                },
                {
                    id: 'v2',
                    title: `${language} for Beginners - Lesson 1`,
                    thumbnail: 'https://img.youtube.com/vi/j5Qj724364o/hqdefault.jpg',
                    url: 'https://www.youtube.com/watch?v=j5Qj724364o',
                    duration: '15:20',
                    level: 'BEGINNER',
                    topics: ['Alphabet', 'Pronunciation']
                },
                {
                    id: 'v3',
                    title: `Top 50 ${language} Phrases`,
                    thumbnail: 'https://img.youtube.com/vi/9QN8aQ9v_3o/hqdefault.jpg',
                    url: 'https://www.youtube.com/watch?v=9QN8aQ9v_3o',
                    duration: '12:45',
                    level: 'INTERMEDIATE',
                    topics: ['Conversation', 'Travel']
                },
                {
                    id: 'v4',
                    title: `Advanced ${language} Grammar`,
                    thumbnail: 'https://img.youtube.com/vi/8O_MwlZ2dEg/hqdefault.jpg',
                    url: 'https://www.youtube.com/watch?v=8O_MwlZ2dEg',
                    duration: '45:10',
                    level: 'ADVANCED',
                    topics: ['Grammar', 'Writing']
                },
            ];

            // Filter by level if specified
            const filtered = level
                ? recommendations.filter(v => v.level === level)
                : recommendations;

            set({
                generatedVideos: filtered,
                isLoading: false
            });

            return { success: true, videos: filtered };
        } catch (error) {
            const errorMsg = error.message || 'Failed to generate videos';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Sync with user profile
    syncWithProfile: async (profile) => {
        try {
            console.log('[BatchStore] Syncing with profile:', profile?.id);

            if (!profile || !profile.batchEnrollments) {
                return { success: false, error: 'No profile data' };
            }

            const enrollments = profile.batchEnrollments;

            // Check for any enrolled/completed status
            const hasPremium = enrollments.some(e =>
                e.status === 'ENROLLED' ||
                e.status === 'COMPLETED' ||
                e.paymentStatus === 'COMPLETED'
            );

            // Normalize enrollment statuses
            const updatedEnrollments = enrollments.map(e => ({
                ...e,
                status: e.status === 'APPLIED' ? 'PENDING' : e.status
            }));

            set({
                enrollments: updatedEnrollments,
                premiumUnlocked: hasPremium,
                enrollmentStatusGlobal: hasPremium ? 'ENROLLED' : (enrollments[0]?.status || null)
            });

            await get().persistState();
            return { success: true };
        } catch (error) {
            console.error('[BatchStore] Sync error:', error);
            return { success: false, error: error.message };
        }
    },

    // Set active batch and persist
    setActiveBatchId: async (batchId) => {
        try {
            console.log('[BatchStore] Setting active batch ID:', batchId);
            set({ activeBatchId: batchId });
            await get().persistState();
            return { success: true };
        } catch (error) {
            console.error('[BatchStore] Error setting active batch:', error);
            return { success: false, error: error.message };
        }
    },

    // Get payment history
    getPaymentHistory: async (enrollmentId) => {
        try {
            set({ isLoading: true, error: null });

            const query = `
                query GetPayments($enrollmentId: ID!) {
                    payments(enrollmentId: $enrollmentId) {
                        id
                        amount
                        currency
                        status
                        method
                        paidAt
                        transactionId
                        receiptUrl
                        createdAt
                    }
                }
            `;

            const data = await graphQLRequest(query, { enrollmentId });

            set({
                payments: data.payments,
                isLoading: false
            });

            return { success: true, payments: data.payments };
        } catch (error) {
            const errorMsg = error.message || 'Failed to fetch payment history';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    // Clear all persisted data (for logout)
    clearPersistedData: async () => {
        try {
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.PREMIUM_UNLOCKED),
                AsyncStorage.removeItem(STORAGE_KEYS.ENROLLMENTS),
                AsyncStorage.removeItem(STORAGE_KEYS.ENROLLMENT_STATUS),
                AsyncStorage.removeItem(STORAGE_KEYS.BATCHES),
                AsyncStorage.removeItem(STORAGE_KEYS.PAYMENTS),
                AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC)
            ]);

            // Reset state
            set({
                batches: [],
                currentBatch: null,
                enrollments: [],
                schedules: [],
                payments: [],
                generatedVideos: [],
                premiumUnlocked: false,
                enrollmentStatusGlobal: null,
                lastSync: null,
                currentPayment: null,
                error: null
            });

            console.log('[BatchStore] Persisted data cleared');
            return { success: true };
        } catch (error) {
            console.error('[BatchStore] Error clearing persisted data:', error);
            return { success: false, error: error.message };
        }
    },

    // Reset premium state
    resetPremiumState: async () => {
        set({
            premiumUnlocked: false,
            enrollmentStatusGlobal: null,
            currentPayment: null
        });
        await get().persistState();
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Set loading state
    setLoading: (loading) => set({ isLoading: loading })
}));