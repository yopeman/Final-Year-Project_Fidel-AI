import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/theme';
import { Platform } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,

                tabBarHideOnKeyboard: true,

                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    backgroundColor: COLORS.surface,

                    height: Platform.OS === 'ios' ? 90 : 70,

                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                },

                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginBottom: Platform.OS === 'ios' ? 10 : 0,
                },
            }}
        >

            {/* Home */}
            <Tabs.Screen
                name="Home"
                options={{
                    title: '',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={focused ? 32 : 28}
                            color={color}
                        />
                    ),
                }}
            />

            {/* Modules */}
            <Tabs.Screen
                name="Modules"
                options={{
                    title: '',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'book' : 'book-outline'}
                            size={focused ? 32 : 28}
                            color={color}
                        />
                    ),
                }}
            />

            {/* AI Conversation */}
            <Tabs.Screen
                name="AIConversation"
                options={{
                    title: '',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                            size={focused ? 32 : 28}
                            color={color}
                        />
                    ),
                }}
            />

            {/* Batch */}
            <Tabs.Screen
                name="Batch"
                options={{
                    title: '',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'stats-chart' : 'stats-chart-outline'}
                            size={focused ? 32 : 28}
                            color={color}
                        />
                    ),
                }}
            />

            {/* Hidden Tabs */}

            <Tabs.Screen
                name="Resources"
                options={{
                    href: null,
                    title: 'Resources',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'book' : 'book-outline'}
                            size={focused ? 32 : 28}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="Community"
                options={{
                    href: null,
                    title: 'Community',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'people' : 'people-outline'}
                            size={focused ? 32 : 28}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="LiveClasses"
                options={{
                    href: null,
                    title: 'Live Classes',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'videocam' : 'videocam-outline'}
                            size={focused ? 32 : 28}
                            color={color}
                        />
                    ),
                }}
            />

            {/* Profile */}
            <Tabs.Screen
                name="Profile"
                options={{
                    title: '',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={focused ? 32 : 28}
                            color={color}
                        />
                    ),
                }}
            />

        </Tabs>
    );
}