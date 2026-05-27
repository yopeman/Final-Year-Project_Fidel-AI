import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../../../app/styles/resourcesStyle';

const ResourcesHero = ({ onMenuPress }) => {
  return (
    <View style={{ zIndex: 10 }}>
      <LinearGradient
        colors={['#0A2540', '#0D1B2A', '#080C14']}
        style={styles.heroBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.glowBlob} />
        <View style={styles.glowBlob2} />

        {/* Header Row – menu + title perfectly horizontal */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.heroTitle}>Course Library</Text>
          </View>

          {/* Invisible spacer for symmetry */}
          <View style={[styles.menuBtn, { opacity: 0 }]} />
        </View>

        <Text style={styles.heroSub}>
          Explore curated materials, guides & references for every course.
        </Text>
      </LinearGradient>
    </View>
  );
};

export default ResourcesHero;