import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNotificationStore } from '../src/stores/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles/notificationsStyle';

const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return dateString;
    }
};

const NotificationsScreen = () => {
    const {
        notifications,
        getNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isLoading,
        unreadCount
    } = useNotificationStore();

    useEffect(() => {
        getNotifications();
    }, []);

    const handleMarkAllRead = () => {
        if (unreadCount === 0) return;
        Alert.alert(
            'Mark All Read',
            'Are you sure you want to mark all notifications as read?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Mark All Read', onPress: markAllAsRead }
            ]
        );
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            onPress={() => !item.isRead && markAsRead(item.id)}
        >
            <View style={styles.notificationHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={item.isRead ? "notifications-outline" : "notifications"}
                        size={20}
                        color={item.isRead ? "#9CA3AF" : COLORS.primary}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.notificationTitle, !item.isRead && styles.unreadText]}>
                        {item.title}
                    </Text>
                    <Text style={styles.notificationContent}>{item.content}</Text>
                    <Text style={styles.notificationDate}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(item.id)}
                >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.secondary || '#111827', '#000']}
                style={styles.background}
            />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <Text style={styles.headerSubtitle}>
                        {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'Up to date!'}
                    </Text>
                </View>
                {/* {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
                        <Text style={styles.markReadBtnText}>Mark all as read</Text>
                    </TouchableOpacity>
                )} */}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={getNotifications}
                        tintColor={COLORS.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        ) : (
                            <>
                                <Ionicons name="notifications-off-outline" size={60} color="#374151" />
                                <Text style={styles.emptyText}>No notifications yet</Text>
                                <Text style={styles.emptySubtext}>We'll let you know when something important happens.</Text>
                            </>
                        )}
                    </View>
                }
            />
        </View>
    );
}

export default NotificationsScreen;
