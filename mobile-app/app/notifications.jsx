import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNotificationStore } from '../src/stores/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function NotificationsScreen() {
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
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
                        <Text style={styles.markReadBtnText}>Mark all as read</Text>
                    </TouchableOpacity>
                )}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary || '#111827',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    markReadBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    markReadBtnText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    notificationCard: {
        backgroundColor: 'rgba(31, 41, 55, 0.5)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#374151',
    },
    unreadCard: {
        backgroundColor: 'rgba(31, 41, 55, 0.8)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    contentContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D1D5DB',
        marginBottom: 4,
    },
    unreadText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    notificationContent: {
        fontSize: 14,
        color: '#9CA3AF',
        lineHeight: 20,
    },
    notificationDate: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    deleteButton: {
        padding: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: SPACING.md,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});
