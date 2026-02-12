import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out', style: 'destructive', onPress: () => {
                        logout();
                        // Navigation guard in _layout.js will handle redirect
                    }
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action is irreversible. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: () => {
                        // Call delete API
                        console.log('Delete account');
                    }
                },
            ]
        );
    };

    const renderMenuItem = (icon, label, onPress, color = '#333') => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIcon}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.menuLabel, { color }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.firstName?.[0] || 'U'}</Text>
                </View>
                <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Learning Preferences</Text>
                <View style={styles.menuCard}>
                    {renderMenuItem('settings-outline', 'Target Language', () => { })}
                    <View style={styles.divider} />
                    {renderMenuItem('timer-outline', 'Daily Goal', () => { })}
                    <View style={styles.divider} />
                    {renderMenuItem('notifications-outline', 'Notifications', () => { })}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuCard}>
                    {renderMenuItem('help-circle-outline', 'Help & Support', () => { })}
                    <View style={styles.divider} />
                    {renderMenuItem('log-out-outline', 'Log Out', handleLogout, '#F44336')}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <View style={styles.menuCard}>
                    {renderMenuItem('trash-outline', 'Delete Account', handleDeleteAccount, '#F44336')}
                </View>
            </View>

            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        alignItems: 'center',
        padding: 30,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    email: {
        fontSize: 14,
        color: '#888',
        marginBottom: 15,
    },
    editButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    section: {
        padding: 20,
        paddingBottom: 0,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        marginBottom: 10,
        marginLeft: 10,
        textTransform: 'uppercase',
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    menuIcon: {
        width: 30,
        alignItems: 'center',
        marginRight: 15,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: 60,
    },
    versionContainer: {
        padding: 30,
        alignItems: 'center',
    },
    versionText: {
        color: '#ccc',
        fontSize: 12,
    },
});
