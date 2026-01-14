import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

export default function GlassLayout({ children }) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 1. Deep Void Background */}
            <View style={styles.background}>
                {/* 2. Subtle Gradient Orbs for Depth */}
                <LinearGradient
                    colors={[COLORS.orangeGlow, 'transparent']}
                    style={styles.orbTopLeft}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                <LinearGradient
                    colors={['rgba(139, 92, 246, 0.2)', 'transparent']}
                    style={styles.orbBottomRight}
                    start={{ x: 1, y: 1 }}
                    end={{ x: 0, y: 0 }}
                />
            </View>

            {/* 3. Content Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden', // Clip the orbs
    },
    orbTopLeft: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        opacity: 0.4,
        transform: [{ scale: 1.5 }],
        // Web blur alternative
        ...Platform.select({
            web: { filter: 'blur(80px)' },
            default: {}
        }),
    },
    orbBottomRight: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 500,
        height: 500,
        borderRadius: 250,
        opacity: 0.3,
        transform: [{ scale: 1.5 }],
        ...Platform.select({
            web: { filter: 'blur(100px)' },
            default: {}
        }),
    },
    content: {
        flex: 1,
        zIndex: 1, // Ensure content is above background
    }
});
