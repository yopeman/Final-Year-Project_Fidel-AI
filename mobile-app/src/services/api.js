import axios from 'axios';
import { API_BASE_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL.replace(/\/$/, ''),
    timeout: 160000,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear auth
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// Helper for GraphQL requests
const graphQLRequest = async (query, variables = {}) => {
    try {
        const response = await api.post('', { query, variables });
        if (response.data.errors) {
            // Construct an error object similar to axios error
            throw {
                response: {
                    data: {
                        message: response.data.errors[0].message
                    }
                }
            };
        }
        return response.data;
    } catch (error) {
        // Detailed logging
        console.error('GraphQL Request Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            query: query.substring(0, 100) + '...'
        });

        if (error.response?.data?.message?.toLowerCase() === 'not authenticated') {
            console.log("Not authenticated");
            useAuthStore.getState().logout();
        }

        // Enhance Network Error message
        if (error.message?.toLowerCase() === 'network error' || error.message?.toLowerCase() === 'timeout exceeded') {
            throw new Error('Unable to connect to the server. Please check your internet connection or verify the API URL.');
        }

        throw error;
    }
}

// Helper for Multipart GraphQL requests (File Uploads)
const uploadGraphQLRequest = async (query, variables = {}, files = []) => {
    try {
        const formData = new FormData();

        // Define the operations
        const operations = {
            query,
            variables: {
                ...variables,
                files: files.map(() => null)
            }
        };
        formData.append('operations', JSON.stringify(operations));

        // Define the map
        const map = {};
        files.forEach((file, index) => {
            map[index.toString()] = [`variables.files.${index}`];
        });
        formData.append('map', JSON.stringify(map));

        // Append the actual files
        files.forEach((file, index) => {
            formData.append(index.toString(), {
                uri: file.uri,
                name: file.name,
                type: file.type || 'application/octet-stream'
            });
        });

        const response = await api.post('', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.errors) {
            throw {
                response: {
                    data: {
                        message: response.data.errors[0].message
                    }
                }
            };
        }
        return response.data;
    } catch (error) {
        console.error('Upload GraphQL Request Error:', error.response?.data || error.message);
        throw error;
    }
}

// Auth endpoints
export const authAPI = {
    register: async (data) => {
        const query = `
            mutation register($input: RegisterInput!) {
                register(input: $input)
            }
        `;
        const res = await graphQLRequest(query, { input: data });
        return { data: res.data.register };
    },
    verify: async (data) => {
        const query = `
            mutation verify($input: VerifyInput!) {
                verify(input: $input)
            }
        `;
        const res = await graphQLRequest(query, { input: data });
        return { data: res.data.verify };
    },
    resendVerification: async (email) => {
        const query = `
            mutation resendVerification($input: ResendVerificationInput!) {
                resendVerification(input: $input)
            }
        `;
        const res = await graphQLRequest(query, { input: { email } });
        return { data: res.data.resendVerification };
    },
    login: async (data) => {
        const query = `
            mutation login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        firstName
                        lastName
                        email
                        role
                        isVerified
                        createdAt
                    }
                    accessToken
                    refreshToken
                }
            }
        `;
        const res = await graphQLRequest(query, { input: data });
        return {
            data: {
                token: res.data.login.accessToken,
                user: res.data.login.user
            }
        };
    },
    me: async () => {
        const query = `
            query me {
                me {
                    id
                    firstName
                    lastName
                    email
                    role
                    isVerified
                    createdAt
                    profile {
                        id
                        ageRange
                        proficiency
                        nativeLanguage
                        learningGoal
                        targetDuration
                        durationUnit
                        aiLearningPlan
                    }
                }
            }
        `;
        const res = await graphQLRequest(query);
        return { data: res.data.me };
    },
    updateMe: async (data) => {
        const query = `
            mutation updateMe($input: UpdateMeInput!) {
                updateMe(input: $input) {
                    id
                    firstName
                    lastName
                    email
                    role
                    isVerified
                }
            }
        `;
        const res = await graphQLRequest(query, { input: data });
        return { data: { user: res.data.updateMe } };
    },
    deleteMe: async () => {
        const query = `
            mutation deleteMe {
                deleteMe
            }
        `;
        const res = await graphQLRequest(query);
        return { data: res.data.deleteMe };
    },
};

// Profile endpoints
export const profileAPI = {
    createProfile: async (data) => {
        const query = `
            mutation createProfile($input: CreateProfileInput!) {
                createProfile(input: $input) {
                    id
                    ageRange
                    proficiency
                    nativeLanguage
                    learningGoal
                    targetDuration
                    durationUnit
                    constraints
                    aiLearningPlan
                }
            }
        `;
        const res = await graphQLRequest(query, { input: data });
        return { data: { profile: res.data.createProfile } };
    },
    getProfile: async () => {
        // Schema: myProfile: StudentProfile
        const query = `
            query myProfile {
                myProfile {
                    id
                    ageRange
                    proficiency
                    nativeLanguage
                    learningGoal
                    targetDuration
                    durationUnit
                    constraints
                    aiLearningPlan
                    batchEnrollments {
                        id
                        status
                        batch {
                            id
                        }
                    }
                }
            }
        `;
        const res = await graphQLRequest(query);
        return { data: { profile: res.data.myProfile } };
    },
    updateProfile: async (data) => {
        const query = `
            mutation updateProfile($input: UpdateProfileInput!) {
                updateProfile(input: $input) {
                    id
                    ageRange
                    proficiency
                    nativeLanguage
                    learningGoal
                    targetDuration
                    durationUnit
                    constraints
                    aiLearningPlan
                }
            }
        `;
        const res = await graphQLRequest(query, { input: data });
        return { data: { profile: res.data.updateProfile } };
    },
    deleteProfile: async () => {
        const query = `
            mutation deleteProfile {
                deleteProfile
            }
        `;
        const res = await graphQLRequest(query);
        return { data: res.data.deleteProfile };
    },
};

// Learning Plan endpoints
export const learningPlanAPI = {
    generateLearningPlan: async () => {
        // Schema: generateLearningPlan: StudentProfile!
        // No input args in schema: generateLearningPlan: StudentProfile!
        const query = `
            mutation generateLearningPlan {
                generateLearningPlan {
                    id
                    aiLearningPlan
                }
            }
        `;
        const res = await graphQLRequest(query);
        // The mutation returns the PROFILE, but we want the plan (aiLearningPlan string?)
        // Wait, schema says `aiLearningPlan: String`. 
        // So we return the plan string inside the profile.
        return { data: { plan: res.data.generateLearningPlan.aiLearningPlan } };
    },
    updateLearningPlan: async (data) => {
        // Schema: updateLearningPlan(input: UpdateLearningPlanInput!): StudentProfile!
        const query = `
            mutation updateLearningPlan($input: UpdateLearningPlanInput!) {
                updateLearningPlan(input: $input) {
                     id
                     aiLearningPlan
                }
            }
        `;
        const res = await graphQLRequest(query, { input: data });
        return { data: { plan: res.data.updateLearningPlan.aiLearningPlan } };
    },
    installLearningPlan: async () => {
        // Schema: installLearningPlan: StudentProfile!
        const query = `
            mutation installLearningPlan {
                installLearningPlan {
                    id
                    aiLearningPlan
                }
            }
        `;
        const res = await graphQLRequest(query);
        return { data: { plan: res.data.installLearningPlan.aiLearningPlan } };
    },
    deletePlan: async () => {
        // Schema: deletePlan: StudentProfile! (Not boolean?) // checking schema...
        // Schema: deletePlan: StudentProfile!
        const query = `
            mutation deletePlan {
                deletePlan {
                    id
                }
            }
        `;
        const res = await graphQLRequest(query);
        return { data: res.data.deletePlan };
    },
};

// Progress endpoints
export const progressAPI = {
    myProgress: async () => {
        const query = `
            query myProgress {
                myProgress {
                    totalModules
                    totalLessons
                    completedLessons
                    remainingLessons
                    progressPercentage
                }
            }
        `;
        const res = await graphQLRequest(query);
        return { data: { progress: res.data.myProgress } };
    },
    completeLesson: async (lessonId) => {
        // Schema: completeLesson(id: ID!): ModuleLessons!
        const query = `
            mutation completeLesson($id: ID!) {
                completeLesson(id: $id) {
                    id
                    isCompleted
                }
            }
        `;
        const res = await graphQLRequest(query, { id: lessonId });
        return { data: res.data.completeLesson };
    },
};

// AI/Conversation endpoints
export const aiAPI = {
    createConversation: async (data) => {
        // data usually { startingTopic, ... }
        const query = `
            mutation createConversation($startingTopic: String!) {
                createConversation(startingTopic: $startingTopic) {
                    id
                    startingTopic
                }
            }
        `;
        const res = await graphQLRequest(query, { startingTopic: data.startingTopic });
        return { data: { conversation: res.data.createConversation } };
    },
    generateIdea: async () => {
        const query = `
            mutation generateIdea {
                generateIdea
            }
        `;
        const res = await graphQLRequest(query);
        return { data: { ideas: res.data.generateIdea } };
    },
    talkWithAi: async (conversationId, message, audioFile = null) => {
        // CreateConversationInteractionInput: { conversationId, text, audioFile }
        const query = `
            mutation talkWithAi($input: CreateConversationInteractionInput!) {
                talkWithAi(input: $input) {
                    id
                    studentText
                    aiText
                    studentAudioUrl
                    aiAudioUrl
                    createdAt
                }
            }
         `;
        const res = await graphQLRequest(query, {
            input: { conversationId, text: message, audioFile }
        });
        return { data: { message: res.data.talkWithAi } };
    },
    getConversationInteractions: async (conversationId) => {
        const query = `
            query conversationInteractions($conversationId: ID!) {
                conversationInteractions(conversationId: $conversationId) {
                    id
                    studentText
                    aiText
                    studentAudioUrl
                    aiAudioUrl
                    createdAt
                }
            }
        `;
        const res = await graphQLRequest(query, { conversationId });
        return { data: { interactions: res.data.conversationInteractions } };
    },
    possibleTalk: async (conversationId) => {
        // This is a mutation in schema: possibleTalk(conversationId: ID!): [String!]!
        const query = `
            mutation possibleTalk($conversationId: ID!) {
                possibleTalk(conversationId: $conversationId)
            }
         `;
        const res = await graphQLRequest(query, { conversationId });
        return { data: { suggestions: res.data.possibleTalk } };
    },
    createLessonInteraction: async (lessonId, message) => {
        const query = `
            mutation createLessonInteraction($input: CreateLessonInteractionInput!) {
                createLessonInteraction(input: $input) {
                    id
                    studentQuestion
                    aiAnswer
                }
            }
        `;
        const res = await graphQLRequest(query, {
            input: { lessonId, question: message }
        });
        return { data: { message: res.data.createLessonInteraction } };
    },
    getLessonInteractions: async (lessonId) => {
        const query = `
            query lessonInteractions($lessonId: ID!) {
                lessonInteractions(lessonId: $lessonId) {
                    id
                    studentQuestion
                    aiAnswer
                    createdAt
                }
            }
        `;
        const res = await graphQLRequest(query, { lessonId });
        return { data: { interactions: res.data.lessonInteractions } };
    },
    deleteLessonInteraction: async (id) => {
        const query = `
            mutation deleteLessonInteraction($id: ID!) {
                deleteLessonInteraction(id: $id)
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: res.data.deleteLessonInteraction };
    },
};

// Lessons endpoints
export const lessonsAPI = {
    getModules: async (profileId) => {
        const query = `
            query getModules($profileId: ID!) {
                modules(profileId: $profileId) {
                    id
                    name
                    description
                    displayOrder
                    isLocked
                    lessons {
                        id
                        title
                        displayOrder
                        isCompleted
                        isLocked
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, { profileId });

        // Map response to UI structure
        const modules = res.data.modules.map(m => ({
            id: m.id,
            title: m.name,
            description: m.description,
            displayOrder: m.displayOrder,
            isLocked: m.isLocked,
            lessons: m.lessons,
            totalLessons: m.lessons.length,
            completedLessons: m.lessons.filter(l => l.isCompleted).length
        }));

        return { data: { modules } };
    },
    getLessons: async (moduleId) => {
        const query = `
            query lessons($moduleId: ID!) {
                lessons(moduleId: $moduleId) {
                    id
                    moduleId
                    title
                    content
                    displayOrder
                    isCompleted
                    isLocked
                    vocabularies {
                        id
                        vocabulary
                        meaning
                        description
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, { moduleId });
        return { data: { lessons: res.data.lessons } };
    },
    getQuiz: async (lessonId) => {
        const query = `
            query quiz($id: ID!) {
                quiz(id: $id) {
                    id
                    title
                    questions {
                        id
                        question
                        options
                        correctOptionIndex
                    }
                }
            }
        `;
        try {
            const res = await graphQLRequest(query, { id: lessonId });
            return { data: { quiz: res.data.quiz } };
        } catch (e) {
            console.log("Quiz API failed, using mock data", e);
            return {
                data: {
                    quiz: {
                        id: lessonId,
                        title: "Unit Test",
                        questions: [
                            { id: '1', question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correctOptionIndex: 2 },
                            { id: '2', question: "Which language is spoken in Brazil?", options: ["Spanish", "Portuguese", "English", "French"], correctOptionIndex: 1 },
                            { id: '3', question: "How do you say 'Hello' in Spanish?", options: ["Hola", "Ciao", "Bonjour", "Hallo"], correctOptionIndex: 0 }
                        ]
                    }
                }
            };
        }
    },
    getLesson: async (lessonId) => {
        const query = `
            query getLesson($lessonId: ID!) {
                lesson(id: $lessonId) {
                    id
                    title
                    content
                    displayOrder
                    isCompleted
                    isLocked
                    vocabularies {
                        id
                        vocabulary
                        meaning
                        description
                    }
                    onlineArticles {
                        id
                        title
                        description
                        pageUrl
                    }
                    youtubeVideos {
                        id
                        title
                        description
                        videoUrl
                        thumbnailUrl
                    }
                    interactions {
                        id
                        studentQuestion
                        aiAnswer
                        createdAt
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, { lessonId });
        const l = res.data.lesson;

        // Map to UI Expected format
        const lesson = {
            ...l,
            vocabulary: l.vocabularies.map(v => ({
                id: v.id,
                word: v.vocabulary,
                definition: v.meaning,
                example: v.description
            })),
            articles: l.onlineArticles.map(a => ({
                id: a.id,
                title: a.title,
                content: a.description,
                url: a.pageUrl
            })),
            videos: l.youtubeVideos.map(v => ({
                id: v.id,
                title: v.title,
                description: v.description,
                url: v.videoUrl,
                thumbnailUrl: v.thumbnailUrl
            })),
            interactions: l.interactions || []
        };

        return { data: { lesson } };
    },
    getVideos: (lessonId) => {
        const query = `
            query getVideos($lessonId: ID!) {
                videos(lessonId: $lessonId) {
                    id
                    lessonId
                    title
                    thumbnailUrl
                    description
                    videoUrl
                }
            }
        `;
        return graphQLRequest(query, { lessonId });
    },
    updateVideo: (id, input) => {
        const query = `
            mutation updateVideo($id: ID!, $input: UpdateVideoInput!) {
                updateVideo(id: $id, input: $input) {
                    id
                    title
                    thumbnailUrl
                    description
                    videoUrl
                }
            }
        `;
        return graphQLRequest(query, { id, input });
    },
    deleteVideo: (id) => {
        const query = `
            mutation deleteVideo($id: ID!) {
                deleteVideo(id: $id)
            }
        `;
        return graphQLRequest(query, { id });
    }
};

// Batch & Enrollment endpoints
export const batchAPI = {
    getBatches: async (language) => {
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
            }
        }
        `;
        const res = await graphQLRequest(query);
        return { data: { batches: res.data.batches } };
    },
    getBatch: async (id) => {
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
            }
        }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: { batch: res.data.batch } };
    },
    getBatchCourses: async (batchId) => {
        const query = `
            query batchCourses($batchId: ID!) {
            batchCourses(batchId: $batchId) {
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
        `;
        const res = await graphQLRequest(query, { batchId });
        return { data: { courses: res.data.batchCourses } };
    },
    createEnrollment: async (batchId, studentId) => {
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
        const res = await graphQLRequest(query, { batchId, studentId });
        return { data: { enrollment: res.data.createEnrollment } };
    },
    makePayment: async (enrollmentId) => {
        const query = `
            mutation makePayment($enrollmentId: ID!) {
            makePayment(enrollmentId: $enrollmentId) {
                id
                amount
                currency
                status
                method
                checkoutUrl
            }
        }
        `;
        const res = await graphQLRequest(query, { enrollmentId });
        return { data: { payment: res.data.makePayment } };
    },
    getPayments: async (enrollmentId) => {
        const query = `
            query payments($enrollmentId: ID!) {
            payments(enrollmentId: $enrollmentId) {
                id
                amount
                currency
                status
                paidAt
            }
        }
        `;
        const res = await graphQLRequest(query, { enrollmentId });
        return { data: { payments: res.data.payments } };
    },
    // Schedule endpoints
    getCourseSchedules: async (batchCourseId) => {
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
        const res = await graphQLRequest(query, { batchCourseId });
        return { data: { schedules: res.data.courseSchedules } };
    },
    getMeetingLink: async (courseScheduleId) => {
        const query = `
            mutation getMeetingLink($courseScheduleId: ID!) {
            getCourseMeetingLink(courseScheduleId: $courseScheduleId) {
                meetingLink
                    attendance {
                    status
                }
            }
        }
        `;
        const res = await graphQLRequest(query, { courseScheduleId });
        return { data: { link: res.data.getCourseMeetingLink } };
    },
    getBatchMeetingLink: async (batchId) => {
        const query = `
            mutation getBatchMeetingLink($batchId: ID!) {
                getBatchMeetingLink(batchId: $batchId) {
                    meetingLink
                    status
                }
            }
        `;
        const res = await graphQLRequest(query, { batchId });
        return { data: { link: res.data.getBatchMeetingLink } };
    }
};

// Community endpoints
export const communityAPI = {
    getPosts: async (batchId) => {
        const query = `
            query communities($batchId: ID) {
            communities(batchId: $batchId) {
                id
                content
                createdAt
                    user {
                    id
                    firstName
                    lastName
                }
                    comments {
                    id
                    content
                        user {
                        firstName
                    }
                }
                    reactions {
                    userId
                    reactionType
                }
            }
        }
        `;
        const res = await graphQLRequest(query, { batchId });

        // Map response to UI structure (author <- user)
        const posts = res.data.communities.map(p => ({
            ...p,
            author: p.user,
            comments: p.comments?.map(c => ({ ...c, author: c.user })) || [],
            reactions: p.reactions || [],
            attachments: p.attachments || []
        }));

        return { data: { posts } };
    },
    getPost: async (id) => {
        const query = `
            query community($id: ID!) {
                community(id: $id) {
                    id
                    content
                    createdAt
                    isEdited
                    user {
                        id
                        firstName
                        lastName
                    }
                    reactions {
                        id
                        reactionType
                        userId
                    }
                    comments {
                        id
                        content
                        user {
                            firstName
                            lastName
                        }
                        createdAt
                    }
                    attachments {
                        id
                        fileName
                        filePath
                        fileExtension
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, { id });
        const post = {
            ...res.data.community,
            author: res.data.community.user,
            comments: res.data.community.comments.map(c => ({ ...c, author: c.user }))
        };
        return { data: { post } };
    },
    createPost: async (batchId, content) => {
        const query = `
            mutation postCommunity($batchId: ID!, $content: String!) {
            postCommunity(batchId: $batchId, content: $content) {
                id
                content
                createdAt
                    user {
                    id
                    firstName
                    lastName
                }
            }
        }
        `;
        const res = await graphQLRequest(query, { batchId, content });
        const post = { ...res.data.postCommunity, author: res.data.postCommunity.user };
        return { data: { post } };
    },
    updatePost: async (id, content) => {
        const query = `
            mutation updateCommunity($id: ID!, $content: String!) {
                updateCommunity(id: $id, content: $content) {
                    id
                    content
                    isEdited
                    updatedAt
                }
            }
        `;
        const res = await graphQLRequest(query, { id, content });
        return { data: { post: res.data.updateCommunity } };
    },
    deletePost: async (id) => {
        const query = `
            mutation deleteCommunity($id: ID!) {
                deleteCommunity(id: $id)
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: res.data.deleteCommunity };
    },
    addComment: async (communityId, content) => {
        const query = `
            mutation postComment($communityId: ID!, $content: String!) {
            postComment(communityId: $communityId, content: $content) {
                id
                content
                createdAt
                    user {
                    id
                    firstName
                    lastName
                }
            }
        }
        `;
        const res = await graphQLRequest(query, { communityId, content });
        const comment = { ...res.data.postComment, author: res.data.postComment.user };
        return { data: { comment } };
    },
    getComments: async (communityId) => {
        const query = `
            query comments($communityId: ID) {
                comments(communityId: $communityId) {
                    id
                    content
                    createdAt
                    isEdited
                    user {
                        id
                        firstName
                        lastName
                    }
                    reactions {
                        id
                        reactionType
                        userId
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, { communityId });
        const comments = res.data.comments.map(c => ({ ...c, author: c.user }));
        return { data: { comments } };
    },
    deleteComment: async (id) => {
        const query = `
            mutation deleteComment($id: ID!) {
                deleteComment(id: $id)
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: res.data.deleteComment };
    },
    postReaction: async (communityId, reactionType) => {
        const query = `
            mutation postCommunityReaction($communityId: ID!, $reactionType: ReactionType!) {
                postCommunityReaction(communityId: $communityId, reactionType: $reactionType) {
                    id
                    reactionType
                    userId
                }
            }
        `;
        const res = await graphQLRequest(query, { communityId, reactionType });
        return { data: { reaction: res.data.postCommunityReaction } };
    },
    deleteReaction: async (id) => {
        const query = `
            mutation deleteCommunityReaction($id: ID!) {
                deleteCommunityReaction(id: $id)
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: res.data.deleteCommunityReaction };
    },
    // Comment Reactions
    postCommentReaction: async (commentId, reactionType) => {
        const query = `
            mutation postCommentReaction($commentId: ID!, $reactionType: ReactionType!) {
                postCommentReaction(commentId: $commentId, reactionType: $reactionType) {
                    id
                    reactionType
                    userId
                }
            }
        `;
        const res = await graphQLRequest(query, { commentId, reactionType });
        return { data: { reaction: res.data.postCommentReaction } };
    },
    updateCommentReaction: async (id, reactionType) => {
        const query = `
            mutation updateCommentReaction($id: ID!, $reactionType: ReactionType!) {
                updateCommentReaction(id: $id, reactionType: $reactionType) {
                    id
                    reactionType
                    userId
                }
            }
        `;
        const res = await graphQLRequest(query, { id, reactionType });
        return { data: { reaction: res.data.updateCommentReaction } };
    },
    deleteCommentReaction: async (id) => {
        const query = `
            mutation deleteCommentReaction($id: ID!) {
                deleteCommentReaction(id: $id)
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: res.data.deleteCommentReaction };
    },
    uploadAttachments: async (communityId, files) => {
        const query = `
            mutation uploadAttachments($communityId: ID!, $files: [Upload!]!) {
                uploadAttachments(communityId: $communityId, files: $files) {
                    id
                    fileName
                    filePath
                    fileExtension
                    fileSize
                }
            }
        `;
        const res = await uploadGraphQLRequest(query, { communityId }, files);
        return { data: { attachments: res.data.uploadAttachments } };
    },
    deleteAttachment: async (id) => {
        const query = `
            mutation deleteAttachment($id: ID!) {
                deleteAttachment(id: $id)
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: res.data.deleteAttachment };
    },
    getMaterialFiles: async (materialId) => {
        const query = `
            query materialFiles($materialId: ID!) {
                materialFiles(materialId: $materialId) {
                    id
                    fileName
                    filePath
                    fileExtension
                    fileSize
                    createdAt
                }
            }
        `;
        const res = await graphQLRequest(query, { materialId });
        return { data: { files: res.data.materialFiles } };
    }
};

// Notification endpoints
export const notificationAPI = {
    getMyNotifications: async () => {
        const query = `
            query myNotifications {
                myNotifications {
                    id
                    title
                    content
                    isRead
                    createdAt
                }
            }
        `;
        const res = await graphQLRequest(query);
        return { data: { notifications: res.data.myNotifications } };
    },
    markAsRead: async (id) => {
        const query = `
            mutation markAsReadNotification($id: ID!) {
                markAsReadNotification(id: $id) {
                    id
                    isRead
                }
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: res.data.markAsReadNotification };
    },
    markAllAsRead: async () => {
        const query = `
            mutation markAsReadAllNotifications {
                markAsReadAllNotifications
            }
        `;
        const res = await graphQLRequest(query);
        return { data: res.data.markAsReadAllNotifications };
    },
    deleteNotification: async (id) => {
        const query = `
            mutation deleteNotification($id: ID!) {
                deleteNotification(id: $id)
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: res.data.deleteNotification };
    }
};

// Feedback endpoints
export const feedbackAPI = {
    submitFeedback: async (content, rate, context = null) => {
        const query = `
            mutation submitFeedback($input: SubmitFeedbackInput!) {
                submitFeedback(input: $input) {
                    id
                    content
                    rate
                    context
                    createdAt
                }
            }
        `;
        const res = await graphQLRequest(query, {
            input: { content, rate, context }
        });
        return { data: { feedback: res.data.submitFeedback } };
    },
    submitAnonymously: async (content, rate, context = null) => {
        const query = `
            mutation submitFeedbackAnonymously($input: SubmitFeedbackInput!) {
                submitFeedbackAnonymously(input: $input) {
                    id
                    content
                    rate
                    context
                    createdAt
                }
            }
        `;
        const res = await graphQLRequest(query, {
            input: { content, rate, context }
        });
        return { data: { feedback: res.data.submitFeedbackAnonymously } };
    }
};

// ── Courses ────────────────────────────────────────────────────────────────────
export const coursesAPI = {
    getCourses: async () => {
        const query = `
            query {
                courses {
                    id
                    name
                    description
                    createdAt
                    updatedAt
                    materials {
                        id
                        name
                        description
                        createdAt
                        files {
                            id
                        }
                    }
                    batchCourses {
                        id
                    }
                }
            }
        `;
        const res = await graphQLRequest(query);
        return { data: { courses: res.data.courses } };
    },

    getCourse: async (id) => {
        const query = `
            query course($id: ID!) {
                course(id: $id) {
                    id
                    name
                    description
                    createdAt
                    updatedAt
                    materials {
                        id
                        name
                        description
                        createdAt
                        files {
                            id
                        }
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: { course: res.data.course } };
    },
};

// ── Materials ──────────────────────────────────────────────────────────────────
export const materialsAPI = {
    getMaterials: async (courseId) => {
        const query = `
            query materials($courseId: ID) {
                materials(courseId: $courseId) {
                    id
                    courseId
                    name
                    description
                    createdAt
                    updatedAt
                    files {
                        id
                        fileName
                        filePath
                        fileExtension
                        fileSize
                    }
                    course {
                        id
                        name
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, courseId ? { courseId } : {});
        return { data: { materials: res.data.materials } };
    },

    getMaterial: async (id) => {
        const query = `
            query material($id: ID!) {
                material(id: $id) {
                    id
                    courseId
                    name
                    description
                    createdAt
                    updatedAt
                    files {
                        id
                        fileName
                        filePath
                        fileExtension
                        fileSize
                    }
                    course {
                        id
                        name
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, { id });
        return { data: { material: res.data.material } };
    },
};

export default api;
