import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useLearningStore } from '../../src/stores/learningStore';
import { Ionicons } from '@expo/vector-icons';

export default function ModulesScreen() {
    const router = useRouter();
    const { modules, getModules, isLoading } = useLearningStore();

    useEffect(() => {
        getModules();
    }, []);

    const renderLesson = (lesson, index, moduleIndex) => {
        const isCompleted = lesson.isCompleted;
        const isLocked = lesson.isLocked;

        return (
            <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonItem, isLocked && styles.lockedLesson]}
                onPress={() => !isLocked && router.push(`/learn/${lesson.id}`)}
                disabled={isLocked}
            >
                <View style={styles.lessonRow}>
                    <View style={[styles.statusIcon, isCompleted ? styles.completedIcon : (isLocked ? styles.lockedIcon : styles.openIcon)]}>
                        {isCompleted ? (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        ) : isLocked ? (
                            <Ionicons name="lock-closed" size={16} color="#999" />
                        ) : (
                            <Ionicons name="play" size={16} color="#000" />
                        )}
                    </View>
                    <View style={styles.lessonTextContainer}>
                        <Text style={[styles.lessonTitle, isLocked && styles.lockedText]}>
                            {lesson.title}
                        </Text>
                        <Text style={styles.lessonDuration}>10 min</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderModule = ({ item, index }) => {
        return (
            <View style={styles.moduleCard}>
                <View style={styles.moduleHeader}>
                    <Text style={styles.moduleTitle}>Module {index + 1}: {item.name}</Text>
                    <Text style={styles.moduleProgress}>
                        {item.lessons?.filter(l => l.isCompleted).length}/{item.lessons?.length || 0}
                    </Text>
                </View>
                <View style={styles.lessonList}>
                    {item.lessons?.map((lesson, lessonIndex) => renderLesson(lesson, lessonIndex, index))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Full Curriculum</Text>
                <Text style={styles.headerSubtitle}>All your lessons in one place</Text>
            </View>
            <FlatList
                data={modules}
                renderItem={renderModule}
                keyExtractor={(item) => item.id || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={getModules} tintColor="#FFD700" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No modules loaded.</Text>
                        <TouchableOpacity style={styles.refreshButton} onPress={() => getModules()}>
                            <Text style={styles.refreshButtonText}>Reload</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#000',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 4,
    },
    listContent: {
        paddingVertical: 20,
    },
    moduleCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    moduleHeader: {
        backgroundColor: '#fdfdfd',
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    moduleTitle: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
    },
    moduleProgress: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 10,
    },
    lessonList: {
        paddingVertical: 5,
    },
    lessonItem: {
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    lessonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    completedIcon: {
        backgroundColor: '#4CAF50',
    },
    openIcon: {
        backgroundColor: '#FFD700',
    },
    lockedIcon: {
        backgroundColor: '#f0f0f0',
    },
    lockedLesson: {
        opacity: 0.7,
    },
    lockedText: {
        color: '#999',
    },
    lessonTextContainer: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    lessonDuration: {
        fontSize: 12,
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
        marginBottom: 20,
    },
    refreshButton: {
        backgroundColor: '#000',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    refreshButtonText: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
});
