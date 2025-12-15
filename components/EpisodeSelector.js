import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

export default function EpisodeSelector({ arc, selectedEpisode, onSelectEpisode }) {
    if (!arc) {
        return null;
    }

    // Generate episode list based on arc range
    const episodes = [];
    const end = arc.end || arc.start + 50; // For ongoing arcs, show next 50 episodes

    for (let i = arc.start; i <= end; i++) {
        episodes.push(i);
    }

    const renderEpisode = ({ item }) => {
        const isSelected = selectedEpisode === item;

        return (
            <TouchableOpacity
                style={[
                    styles.episodeButton,
                    isSelected && styles.episodeButtonSelected
                ]}
                onPress={() => onSelectEpisode(item)}
            >
                <Text style={[
                    styles.episodeText,
                    isSelected && styles.episodeTextSelected
                ]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                Select Episode ({arc.start}-{arc.end || '?'}):
            </Text>
            <FlatList
                data={episodes}
                renderItem={renderEpisode}
                keyExtractor={(item) => item.toString()}
                numColumns={6}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
                style={styles.flatList}
            />
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
    flatList: {
        maxHeight: 200,
    },
    grid: {
        gap: 8,
    },
    episodeButton: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderWidth: 2,
        borderColor: '#8B5CF6',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        minWidth: 50,
        alignItems: 'center',
        margin: 4,
    },
    episodeButtonSelected: {
        backgroundColor: 'rgba(255, 107, 53, 0.25)',
        borderColor: '#FF6B35',
    },
    episodeText: {
        color: '#c4b5fd',
        fontSize: 14,
        fontWeight: '600',
    },
    episodeTextSelected: {
        color: '#FF6B35',
    },
});
