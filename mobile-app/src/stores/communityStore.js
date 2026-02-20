import { create } from 'zustand';
import { communityAPI } from '../services/api';

export const useCommunityStore = create((set, get) => ({
    posts: [],
    selectedFiles: [], // [{ uri, name, size, type }]
    isLoading: false,
    error: null,

    setFiles: (files) => set({ selectedFiles: files }),
    addFiles: (files) => set(state => ({ selectedFiles: [...state.selectedFiles, ...files] })),
    removeFile: (uri) => set(state => ({
        selectedFiles: state.selectedFiles.filter(f => f.uri !== uri)
    })),
    clearFiles: () => set({ selectedFiles: [] }),

    getPosts: async (batchId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await communityAPI.getPosts(batchId);
            set({ posts: response.data.posts, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    createPost: async (batchId, content, files = []) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Create the post
            const response = await communityAPI.createPost(batchId, content);
            const createdPost = response.data.post;

            // 2. Upload attachments if any
            if (files && files.length > 0) {
                try {
                    // Note: This relies on the backend supporting multi-part or base64.
                    // For now, using the schema-provided mutation.
                    await communityAPI.uploadAttachments(createdPost.id, files);

                    // Refetch posts to show newly uploaded attachments or update local state
                    const updatedResponse = await communityAPI.getPost(createdPost.id);
                    set(state => ({
                        posts: [updatedResponse.data.post, ...state.posts],
                        selectedFiles: [],
                        isLoading: false
                    }));
                } catch (uploadError) {
                    console.error("Attachment upload failed:", uploadError);
                    // Still add the post, but notify about attachments failure
                    set(state => ({
                        posts: [createdPost, ...state.posts],
                        selectedFiles: [],
                        isLoading: false
                    }));
                    return { success: true, warning: "Post created, but attachments failed to upload." };
                }
            } else {
                set(state => ({
                    posts: [createdPost, ...state.posts],
                    isLoading: false
                }));
            }
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    updatePost: async (id, content) => {
        try {
            const response = await communityAPI.updatePost(id, content);
            set(state => ({
                posts: state.posts.map(p => p.id === id ? { ...p, ...response.data.post } : p)
            }));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    deletePost: async (id) => {
        try {
            await communityAPI.deletePost(id);
            set(state => ({
                posts: state.posts.filter(p => p.id !== id)
            }));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    addComment: async (postId, content) => {
        try {
            const response = await communityAPI.addComment(postId, content);
            set(state => ({
                posts: state.posts.map(p =>
                    p.id === postId
                        ? { ...p, comments: [...(p.comments || []), response.data.comment] }
                        : p
                )
            }));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    toggleReaction: async (postId, type, userId) => {
        try {
            // Find if user already reacted
            const post = get().posts.find(p => p.id === postId);
            const existingReaction = post?.reactions?.find(r => r.userId === userId && r.reactionType === type);

            if (existingReaction) {
                await communityAPI.deleteReaction(existingReaction.id);
                set(state => ({
                    posts: state.posts.map(p =>
                        p.id === postId
                            ? { ...p, reactions: p.reactions.filter(r => r.id !== existingReaction.id) }
                            : p
                    )
                }));
            } else {
                const response = await communityAPI.postReaction(postId, type);
                set(state => ({
                    posts: state.posts.map(p =>
                        p.id === postId
                            ? { ...p, reactions: [...(p.reactions || []), response.data.reaction] }
                            : p
                    )
                }));
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    clearError: () => set({ error: null })
}));
