import { create } from 'zustand';
import { notificationAPI } from '../services/api';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    getNotifications: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await notificationAPI.getMyNotifications();
            const notifications = response.data.notifications;
            const unreadCount = notifications.filter(n => !n.isRead).length;
            set({ notifications, unreadCount, isLoading: false });
            return { success: true, notifications };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch notifications';
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    markAsRead: async (id) => {
        try {
            // Optimistic update
            const currentNotifications = get().notifications;
            const updatedNotifications = currentNotifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            );
            const currentUnread = get().unreadCount;

            set({
                notifications: updatedNotifications,
                unreadCount: Math.max(0, currentUnread - 1)
            });

            await notificationAPI.markAsRead(id);
            return { success: true };
        } catch (error) {
            console.log('Mark as read failed', error);
            // Revert or refresh
            get().getNotifications();
            return { success: false };
        }
    },

    markAllAsRead: async () => {
        try {
            console.log('markAllAsRead: Starting optimistic update...');
            const updatedNotifications = get().notifications.map(n => ({ ...n, isRead: true }));
            set({ notifications: updatedNotifications, unreadCount: 0 });

            console.log('markAllAsRead: Calling API...');
            await notificationAPI.markAllAsRead();
            console.log('markAllAsRead: API success.');
            return { success: true };
        } catch (error) {
            console.log('markAllAsRead: API failed', error);
            get().getNotifications();
            return { success: false };
        }
    },

    deleteNotification: async (id) => {
        try {
            const currentNotifications = get().notifications;
            const notificationToDelete = currentNotifications.find(n => n.id === id);
            const updatedNotifications = currentNotifications.filter(n => n.id !== id);
            const unreadAdjustment = (notificationToDelete && !notificationToDelete.isRead) ? 1 : 0;

            set({
                notifications: updatedNotifications,
                unreadCount: Math.max(0, get().unreadCount - unreadAdjustment)
            });

            await notificationAPI.deleteNotification(id);
            return { success: true };
        } catch (error) {
            get().getNotifications();
            return { success: false };
        }
    },

    clearError: () => set({ error: null }),
}));
