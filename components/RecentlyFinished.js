// Recently Finished Feature
// Grid of anime that recently finished airing

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

// Mock data - in production would fetch from API
const RECENTLY_FINISHED = [
    { id: 1, title: 'Jujutsu Kaisen Season 2', chapter: 137, volume: 16, cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166531-4W8e5YpXRiJF.jpg' },
    { id: 2, title: 'Frieren', chapter: 52, volume: 7, cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-gHSraOeaeODr.jpg' },
    { id: 3, title: 'Demon Slayer Season 4', chapter: 127, volume: 15, cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166240-Dqr8lbslDeVq.jpg' },
    { id: 4, title: 'Vinland Saga Season 2', chapter: 101, volume: 13, cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx136430-7kIXhXBgVf98.jpg' },
    { id: 5, title: 'Blue Lock Season 1', chapter: 114, volume: 13, cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx137822-lQ6UexkIRZWb.jpg' },
    { id: 6, title: 'Tokyo Revengers Season 3', chapter: 185, volume: 21, cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx167893-y3yYz3EhqfbP.jpg' },
];

export default function RecentlyFinished({ onSelectAnime }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>🔥</Text>
                <Text style={styles.headerTitle}>Recently Finished</Text>
            </View>
            <Text style={styles.headerSubtitle}>Just finished airing? See where to continue reading!</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gridContainer}>
                {RECENTLY_FINISHED.map((anime) => (
                    <TouchableOpacity
                        key={anime.id}
                        style={styles.animeCard}
                        onPress={() => onSelectAnime(anime)}
                    >
                        <Image source={{ uri: anime.cover }} style={styles.animeCover} />
                        <View style={styles.animeInfo}>
                            <Text style={styles.animeTitle} numberOfLines={2}>{anime.title}</Text>
                            <Text style={styles.continueText}>Ch. {anime.chapter}</Text>
                            <Text style={styles.volumeText}>Vol. {anime.volume}</Text>
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
