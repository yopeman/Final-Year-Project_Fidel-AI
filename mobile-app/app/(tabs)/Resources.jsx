import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, StatusBar, RefreshControl, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMaterialStore } from '../../src/stores/materialStore';
import { useBatchStore } from '../../src/stores/batchStore';
import { API_BASE_URL } from '../../src/constants';
import PremiumMenu from '../../src/components/PremiumMenu';
import ResourcesHero from '../../src/components/resources/ResourcesHero';
import CourseCard from '../../src/components/resources/CourseCard';
import MaterialCard from '../../src/components/resources/MaterialCard';
import { COURSE_COLORS } from '../../src/constants/resourcesConfig';
import styles, { ACCENT, GOLD, INDIGO } from '../styles/resourcesStyle';

export default function ResourcesScreen() {
    const { courses, materials, isLoading, getCourses, getMaterials } = useMaterialStore();
    const { activeBatchId } = useBatchStore();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        getCourses(activeBatchId);
    }, [activeBatchId]);

    useEffect(() => {
        if (selectedCourse) getMaterials(selectedCourse.id);
        else getMaterials(null);
    }, [selectedCourse]);

    const onRefresh = async () => {
        await getCourses(activeBatchId);
        if (selectedCourse) getMaterials(selectedCourse.id);
    };

    const handleSelectCourse = (course) => {
        setSelectedCourse(prev => prev?.id === course.id ? null : course);
    };

    const selectedIdx = courses.findIndex(c => c.id === selectedCourse?.id);
    const selectedPalette = COURSE_COLORS[(selectedIdx >= 0 ? selectedIdx : 0) % COURSE_COLORS.length];

    const handleFilePress = (file) => {
        if (file.filePath) {
            const baseUrl = API_BASE_URL.replace('/graphql', '');
            Linking.openURL(`${baseUrl}/${file.filePath}`);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

            {/* Fixed Hero Banner */}
            <ResourcesHero onMenuPress={() => setMenuVisible(true)} />

            {/* Scrollable Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={ACCENT} />
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                style={[styles.scrollView, { marginTop: -10 }]}
            >
                {/* Courses Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                            <View style={styles.sectionHeaderIcon}>
                                <Ionicons name="library-outline" size={16} color={ACCENT} />
                            </View>
                            <Text style={styles.sectionTitle}>All Courses</Text>
                        </View>
                        <View style={styles.sectionCount}>
                            <Text style={styles.sectionCountText}>{courses.length}</Text>
                        </View>
                    </View>

                    {isLoading && courses.length === 0 ? (
                        <View style={styles.loadingBox}>
                            <View style={styles.loadingSpinner}>
                                <Ionicons name="sparkles" size={28} color={GOLD} />
                            </View>
                            <Text style={styles.loadingText}>Loading courses…</Text>
                        </View>
                    ) : courses.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="library-outline" size={36} color={ACCENT} />
                            </View>
                            <Text style={styles.emptyTitle}>No courses yet</Text>
                            <Text style={styles.emptyText}>Courses will appear here once available.</Text>
                        </View>
                    ) : (
                        courses.map((course, i) => (
                            <CourseCard
                                key={`${course.id}-${i}`}
                                course={course}
                                index={i}
                                isSelected={selectedCourse?.id === course.id}
                                onSelect={handleSelectCourse}
                            />
                        ))
                    )}
                </View>

                {/* Materials Section */}
                {selectedCourse && (
                    <View style={styles.section}>
                        <View style={styles.materialsSectionHeader}>
                            <View style={styles.sectionHeaderLeft}>
                                <View style={[styles.sectionHeaderIcon, { backgroundColor: selectedPalette.bg, borderColor: selectedPalette.border }]}>
                                    <Ionicons name="documents-outline" size={16} color={selectedPalette.accent} />
                                </View>
                                <View>
                                    <Text style={styles.sectionTitle}>Materials</Text>
                                    <Text style={styles.sectionSubtitle}>{selectedCourse.name}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedCourse(null)}>
                                <Ionicons name="close" size={14} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {isLoading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={selectedPalette.accent} />
                                <Text style={styles.loadingText}>Loading materials…</Text>
                            </View>
                        ) : materials.length === 0 ? (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIcon, { backgroundColor: selectedPalette.bg, borderColor: selectedPalette.border }]}>
                                    <Ionicons name="document-outline" size={36} color={selectedPalette.accent} />
                                </View>
                                <Text style={styles.emptyTitle}>No materials yet</Text>
                                <Text style={styles.emptyText}>No materials have been added to this course yet.</Text>
                            </View>
                        ) : (
                            materials.map((mat, i) => (
                                <MaterialCard
                                    key={`${mat.id}-${i}`}
                                    material={mat}
                                    index={i}
                                    courseAccent={selectedPalette.accent}
                                    onFilePress={handleFilePress}
                                />
                            ))
                        )}
                    </View>
                )}

                {/* Tip */}
                {!selectedCourse && courses.length > 0 && (
                    <View style={styles.tipCard}>
                        <Ionicons name="information-circle-outline" size={18} color={INDIGO} style={{ marginRight: 10 }} />
                        <Text style={styles.tipText}>
                            Tap a course to browse its materials and resources.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}