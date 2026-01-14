import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function SeasonSelector({ arcs, selectedArc, onSelectArc }) {
    if (!arcs || arcs.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Select Arc/Season:</Text>
            <View style={styles.gridContainer}>
                {arcs.map((arc, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.arcButton,
                            selectedArc?.name === arc.name && styles.arcButtonSelected
                        ]}
                        onPress={() => onSelectArc(arc)}
                    >
                        <Text style={[
                            styles.arcText,
                            selectedArc?.name === arc.name && styles.arcTextSelected
                        ]}>
                            {arc.name}
                        </Text>
                        <Text style={styles.arcRange}>
                            Eps {arc.start}-{arc.end || '?'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        color: '#FFB7C5',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    arcButton: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderWidth: 2,
        borderColor: '#8B5CF6',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        flexGrow: 1,
        flexBasis: '45%', // 2 per row approx
        alignItems: 'center',
    },
    arcButtonSelected: {
        backgroundColor: 'rgba(255, 107, 53, 0.25)',
        borderColor: '#FF6B35',
    },
    arcText: {
        color: '#c4b5fd',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    arcTextSelected: {
        color: '#FF6B35',
    },
    arcRange: {
        color: '#888',
        fontSize: 11,
    },
});
