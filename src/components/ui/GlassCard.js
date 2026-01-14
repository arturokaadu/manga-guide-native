import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, STYLES } from '../../theme';

export default function GlassCard({ children, style, variant = 'light' }) {
    const bgColor = variant === 'dark' ? COLORS.glassHeavy : COLORS.glassLight;

    return (
        <View style={[styles.card, { backgroundColor: bgColor }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.l,
        padding: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        // Web glass effect
        ...Platform.select({
            web: {
                backdropFilter: 'blur(30px)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            },
            default: {
                // Native fallback (simple transparency)
                ...SHADOWS.glass
            }
        })
    }
});
