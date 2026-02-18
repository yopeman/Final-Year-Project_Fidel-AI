import { create } from 'zustand';
import { communityAPI } from '../services/api';

export const useCommunityStore = create((set, get) => ({
    posts: [],
    isLoading: false,
    error: null,

    getPosts: async (batchId) => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await communityAPI.getPosts(batchId);
            set({ posts: data.posts, isLoading: false });
        } catch (error) {
            set({ error: error.message || 'Failed to fetch posts', isLoading: false });
        }
    },

    createPost: async (batchId, content) => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await communityAPI.createPost(batchId, content);
            set(state => ({
                posts: [data.post, ...state.posts],
                isLoading: false
            }));
            return { success: true };
        } catch (error) {
            set({ error: error.message || 'Failed to create post', isLoading: false });
            return { success: false, error: error.message };
        }
    },

    addComment: async (postId, content) => {
        try {
            // Optimistic update or just fetch again? Let's just append for now if we had structure
            const { data } = await communityAPI.addComment(postId, content);
            set(state => ({
                posts: state.posts.map(post =>
                    post.id === postId
                        ? { ...post, comments: [...(post.comments || []), data.comment] }
                        : post
                )
            }));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}));
