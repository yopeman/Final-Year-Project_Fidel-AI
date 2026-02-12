import axios from 'axios';
import { API_BASE_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        console.error('GraphQL Request Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            query: query.substring(0, 100) + '...'
        });
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
    talkWithAi: async (conversationId, message) => {
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
            input: { conversationId, text: message }
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
        // This is a mutation in schema: possibleTalk(conversationId: ID!): String!
        const query = `
            mutation possibleTalk($conversationId: ID!) {
                possibleTalk(conversationId: $conversationId)
            }
         `;
        const res = await graphQLRequest(query, { conversationId });
        return { data: { topic: res.data.possibleTalk } };
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
};

// Lessons endpoints
export const lessonsAPI = {
    getModules: async (profileId) => {
        const query = `
            query modules($profileId: ID!) {
                modules(profileId: $profileId) {
                    id
                    name
                    description
                    displayOrder
                    isLocked
                    lessons {
                        id
                        moduleId
                        title
                        content
                        displayOrder
                        isCompleted
                        isLocked
                        createdAt
                        updatedAt
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
                        }
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, { profileId });

        // Map response to UI structure
        const modules = res.data.modules.map(m => ({
            id: m.id,
            title: m.name, // Map name -> title
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
                    createdAt
                    updatedAt
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
    getLesson: async (lessonId) => {
        const query = `
            query lesson($id: ID!) {
                lesson(id: $id) {
                    id
                    moduleId
                    title
                    content
                    displayOrder
                    isCompleted
                    isLocked
                    createdAt
                    updatedAt
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
                        videoUrl
                        description
                    }
                }
            }
        `;
        const res = await graphQLRequest(query, { id: lessonId });
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
                content: a.description, // UI uses content, we map description to it
                url: a.pageUrl
            })),
            videos: l.youtubeVideos.map(v => ({
                id: v.id,
                title: v.title,
                description: v.description,
                url: v.videoUrl
            })),
            interactions: [] // Reset to empty as we can't fetch them yet
        };

        return { data: { lesson } };
    },
};

export default api;
