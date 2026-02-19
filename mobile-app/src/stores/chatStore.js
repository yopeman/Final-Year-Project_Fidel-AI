import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aiAPI } from '../services/api';

export const useChatStore = create(
    persist(
        (set, get) => ({
            conversations: [], // [FreeConversation!]
            currentConversation: null, // FreeConversation
            messages: [], // [ConversationInteractions!]
            topics: [],
            ideas: [],
            isLoading: false,
            error: null,

            // Create new conversation
            createConversation: async (startingTopic) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await aiAPI.createConversation({ startingTopic });
                    const conversation = response.data.conversation;

                    // Update conversations history
                    const currentConvs = get().conversations;
                    const exists = currentConvs.some(c => c.id === conversation.id);

                    set({
                        currentConversation: conversation,
                        conversations: exists ? currentConvs : [conversation, ...currentConvs],
                        isLoading: false
                    });

                    // Fetch existing messages for this conversation (might be a reused thread)
                    await get().getMessages(conversation.id);

                    return { success: true, conversation };
                } catch (error) {
                    const errorMsg = error.message || error.response?.data?.message || 'Failed to create conversation';
                    set({ error: errorMsg, isLoading: false });
                    return { success: false, error: errorMsg };
                }
            },

            // Get message history
            getMessages: async (conversationId) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await aiAPI.getConversationInteractions(conversationId);
                    set({
                        messages: response.data.interactions,
                        isLoading: false
                    });
                    return { success: true, messages: response.data.interactions };
                } catch (error) {
                    const errorMsg = error.message || error.response?.data?.message || 'Failed to fetch messages';
                    set({ error: errorMsg, isLoading: false });
                    return { success: false, error: errorMsg };
                }
            },

            // Send message (TalkWithAi)
            talkWithAi: async (conversationId, message, audioFile = null) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await aiAPI.talkWithAi(conversationId, message);
                    const interaction = response.data.message;

                    // Update messages list
                    const currentMessages = get().messages;
                    set({
                        messages: [...currentMessages, interaction],
                        isLoading: false
                    });

                    return { success: true, message: interaction };
                } catch (error) {
                    const errorMsg = error.message || error.response?.data?.message || 'Failed to send message';
                    set({ error: errorMsg, isLoading: false });
                    return { success: false, error: errorMsg };
                }
            },

            // Get conversation topics (PossibleTalk)
            getTopics: async (conversationId) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await aiAPI.possibleTalk(conversationId);
                    return { success: true, topic: response.data.topic };
                } catch (error) {
                    set({ isLoading: false });
                    return { success: false, error: error.message || 'Failed to get topics' };
                }
            },

            generateIdea: async () => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await aiAPI.generateIdea();
                    return { success: true, idea: response.data.ideas };
                } catch (error) {
                    set({ isLoading: false });
                    return { success: false, error: error.message || 'Failed to generate idea' };
                }
            },

            setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

            // Clear messages
            clearMessages: () => set({ messages: [] }),

            // Clear error
            clearError: () => set({ error: null }),
        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                conversations: state.conversations,
                messages: state.messages
            }),
        }
    )
);
