import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useBatchStore } from '../../src/stores/batchStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Batch() {
  const router = useRouter();
  const { batches, isLoading, error, getBatches } = useBatchStore();

  useEffect(() => {
    getBatches();
  }, []);

  const onRefresh = useCallback(() => {
    getBatches();
  }, [getBatches]);

  const renderBatchItem = ({ item, index }) => {
    // Determine gradient colors based on index or status
    // Design has dark cards, maybe with a specialized header visual

    // Mock features for UI matching since backend might not send them as list strings yet
    const features = [
      "Learn essential phrases",
      "Interactive conversations",
      "Cultural tips & insights",
      "Basic email & messaging support"
    ];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`batch/${item.id}`)}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          {/* Most Popular Badge Mock - put on second item for demo */}
          {index === 1 && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>
          )}

          <View style={styles.iconContainer}>
            {/* Use emoji or icon based on batch name */}
            <Text style={{ fontSize: 40 }}>{item.name.includes('Vacation') ? 'swimmer' : '📝'}</Text>
          </View>

          <Text style={styles.batchName}>{item.name}</Text>
          <Text style={styles.price}>{item.feeAmount} Birr</Text>

          <View style={styles.featuresList}>
            {features.map((feat, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        // Background Gradient
        colors={[COLORS.secondary, '#000']}
        style={styles.background}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Course</Text>
        <Text style={styles.subtitle}>Select a course to unlock live tutors, materials, and certificates</Text>
      </View>

      {isLoading && batches.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={batches}
          renderItem={renderBatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary, // Fallback
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: SPACING.xl,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000', // Design has black text on yellow/blue Header? 
    // Wait, the image provided for "Choose Your Course" has a gradient header background (Yellow to Blue) and Black Text? 
    // Or it's dark mode? 
    // Image 1: "Choose Your Course" (Black Text), Yellow-Blue Gradient Header bg. Dark body bg.
    // Let's implement that Header Gradient.
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    paddingHorizontal: 20,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surfaceDark, // Dark Grey/Blue
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  popularText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: COLORS.secondary,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  batchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  featuresList: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: '#D1D5DB',
    fontSize: 14,
    flex: 1,
  },
});