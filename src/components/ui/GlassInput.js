import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { COLORS, RADIUS, SPACING, STYLES } from '../../theme';

export default function GlassInput({ value, onChangeText, placeholder, style }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[
            styles.container,
            isFocused && styles.focusedData,
            style
        ]}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface, // Solid opaque background as requested
        borderRadius: RADIUS.round,
        borderWidth: 2,
        borderColor: COLORS.borderLight,
        height: 56, // Tall touch target
        justifyContent: 'center',
        paddingHorizontal: SPACING.l,
    },
    focusedData: {
        borderColor: COLORS.primary,
        // Glow effect
        ...Platform.select({
            web: { boxShadow: `0 0 20px ${COLORS.primaryGlow}` },
            default: {}
        })
    },
    input: {
        color: COLORS.textPrimary,
        fontSize: 16,
        height: '100%',
        outlineStyle: 'none', // Remove web outline
    }
});
