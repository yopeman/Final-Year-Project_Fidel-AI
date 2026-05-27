import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles, { DARK_BORDER } from '../../../app/styles/resourcesStyle';
import { COURSE_COLORS } from '../../constants/resourcesConfig';
const CourseCard = ({ course, index, onSelect, isSelected }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const palette = COURSE_COLORS[index % COURSE_COLORS.length];
  const matCount = course.materials?.length || 0;

  const onIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 22 }).start();
  const onOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22 }).start();

  return (
    <Animated.View style={[styles.courseCardWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onSelect(course)}
        onPressIn={onIn}
        onPressOut={onOut}
      >
        <LinearGradient
          colors={
            isSelected
              ? [palette.accent + '28', palette.accent + '10']
              : ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']
          }
          style={[
            styles.courseCard,
            { borderColor: isSelected ? palette.accent + '66' : DARK_BORDER },
          ]}
        >
          <View style={[styles.courseIconCircle, { backgroundColor: palette.bg, borderColor: palette.border }]}>
            <Ionicons name={palette.icon} size={24} color={palette.accent} />
          </View>

          <View style={styles.courseCardBody}>
            <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
            {course.description ? (
              <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>
            ) : null}
            <View style={styles.courseFooter}>
              <View style={[styles.matCountBadge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                <Ionicons name="documents-outline" size={12} color={palette.accent} />
                <Text style={[styles.matCountText, { color: palette.accent }]}>
                  {matCount} {matCount === 1 ? 'material' : 'materials'}
                </Text>
              </View>
              {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: palette.accent + '22' }]}>
                  <Ionicons name="checkmark-circle" size={14} color={palette.accent} />
                  <Text style={[styles.selectedText, { color: palette.accent }]}>Viewing</Text>
                </View>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color={isSelected ? palette.accent : '#374151'} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CourseCard;