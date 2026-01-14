import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

export default function GlassSegmentedControl({ options, selectedIndex, onChange }) {
    return (
        <View style={styles.container}>
            {options.map((option, index) => {
                const isSelected = selectedIndex === index;
                return (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.segment,
                            isSelected && styles.selectedSegment
                        ]}
                        onPress={() => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            onChange(index);
                        }}
                    >
                        <Text style={[
                            styles.text,
                            isSelected && styles.selectedText
                        ]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.glassLight,
        borderRadius: RADIUS.m,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        // Web blur
        ...Platform.select({
            web: { backdropFilter: 'blur(15px)' },
            default: {} 
        })
    },
    segment: {
        flex: 1,
        paddingVertical: SPACING.s,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.s,
    },
    selectedSegment: {
        backgroundColor: COLORS.glassMedium,
        borderWidth: 1,
        borderColor: COLORS.textTertiary,
        ...Platform.select({
            web: { 
                boxShadow: `0 0 15px ${COLORS.glassMedium}`,
                backdropFilter: 'blur(20px)'
            }
        })
    },
    text: {
        color: COLORS.textSecondary,
        fontWeight: '500',
        fontSize: 14,
    },
    selectedText: {
        color: COLORS.textPrimary,
        fontWeight: '700',
        textShadowColor: COLORS.orangeGlow,
        textShadowRadius: 10,
    }
});
