// Recently Finished Feature
// Grid of anime that recently finished airing

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

export default function RecentlyFinished({ onSelectAnime, history = [] }) {
    if (!history || history.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>🕒</Text>
                <Text style={styles.headerTitle}>Your Recent Searches</Text>
            </View>
            <Text style={styles.headerSubtitle}>Pick up where you left off!</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridContainer}>
                {history.map((item, index) => (
                    <TouchableOpacity
                        key={`${item.title}-${index}`}
                        style={styles.animeCard}
                        onPress={() => onSelectAnime({
                            title: { romaji: item.title },
                            lastEpisode: item.episode // Pass the searched episode
                        })}
                    >
                        {item.cover ? (
                            <Image source={{ uri: item.cover }} style={styles.animeCover} />
                        ) : (
                            <View style={[styles.animeCover, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ fontSize: 40 }}>📚</Text>
                            </View>
                        )}
                        <View style={styles.animeInfo}>
                            <Text style={styles.animeTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.continueText}>Ep. {item.episode}</Text>
                            <Text style={styles.volumeText}>
                                {item.chapter ? `Ch. ${item.chapter}` : ''}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 24,
        padding: 20,
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FF6B35',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#FFB7C5',
        marginBottom: 20,
    },
    gridContainer: {
        flexDirection: 'row',
    },
    animeCard: {
        width: 160,
        marginRight: 16,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#8B5CF6',
        overflow: 'hidden',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    animeCover: {
        width: '100%',
        height: 220,
        resizeMode: 'cover',
    },
    animeInfo: {
        padding: 12,
    },
    animeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
        height: 40,
    },
    continueText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B35',
        marginTop: 4,
    },
    volumeText: {
        fontSize: 13,
        color: '#FFB7C5',
        marginTop: 2,
    },
});
