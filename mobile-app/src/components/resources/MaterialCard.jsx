import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles, { ACCENT } from '../../../app/styles/resourcesStyle';
const MaterialCard = ({ material, index, courseAccent, onFilePress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const fileCount = material.files?.length || 0;

  const toggle = () => {
    Animated.spring(anim, {
      toValue: open ? 0 : 1,
      useNativeDriver: false,
      speed: 16,
      bounciness: 4,
    }).start();
    setOpen(v => !v);
  };

  const maxH = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 500] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const accent = courseAccent || ACCENT;

  const onIn = () =>
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 22 }).start();
  const onOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 10 }}>
      <TouchableOpacity activeOpacity={1} onPress={toggle} onPressIn={onIn} onPressOut={onOut}>
        <View style={[styles.matCard, { borderLeftColor: accent }]}>
          <View style={styles.matHeader}>
            <View style={[styles.matIndexBadge, { backgroundColor: accent + '22' }]}>
              <Text style={[styles.matIndexText, { color: accent }]}>{index + 1}</Text>
            </View>
            <View style={styles.matHeaderText}>
              <Text style={styles.matName} numberOfLines={1}>{material.name}</Text>
              <View style={styles.matMeta}>
                <Ionicons name="attach-outline" size={12} color="#6B7280" />
                <Text style={styles.matMetaText}>{fileCount} file{fileCount !== 1 ? 's' : ''}</Text>
                <Text style={styles.matDot}>·</Text>
                <Text style={styles.matMetaText}>
                  {new Date(material.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
          </View>

          <Animated.View style={{ maxHeight: maxH, opacity, overflow: 'hidden' }}>
            <View style={styles.matDescWrap}>
              {material.description ? (
                <Text style={styles.matDesc}>{material.description}</Text>
              ) : (
                <Text style={[styles.matDesc, { fontStyle: 'italic', color: '#4B5563' }]}>
                  No description provided.
                </Text>
              )}

              {material.files?.length > 0 && (
                <View style={styles.fileList}>
                  {material.files.map((file, i) => (
                    <TouchableOpacity
                      key={`${file.id}-${i}`}
                      style={[styles.fileItem, { borderLeftColor: accent }]}
                      onPress={() => onFilePress(file)}
                    >
                      <View style={styles.fileIconWrapper}>
                        <Ionicons
                          name={file.fileExtension?.includes('pdf') ? 'document-text' : 'document'}
                          size={18}
                          color={accent}
                        />
                      </View>
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileName} numberOfLines={1}>{file.fileName}</Text>
                        <Text style={styles.fileSize}>
                          {file.fileExtension?.toUpperCase()} • {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Tap to open'}
                        </Text>
                      </View>
                      <Ionicons name="eye-outline" size={18} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default MaterialCard;