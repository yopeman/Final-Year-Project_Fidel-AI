import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../constants';

const Avatar = ({ uri, name, size = 40, style }) => {
    const initials = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
            {uri ? (
                <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
            ) : (
                <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        resizeMode: 'cover',
    },
    text: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default Avatar;
