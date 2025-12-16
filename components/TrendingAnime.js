import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { getTrendingAnime } from '../services/anilistService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.35; // 35% of screen width

export default function TrendingAnime({ onSelectAnime }) {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            const data = await getTrendingAnime();
            setTrending(data);
            setLoading(false);
        };
        fetchTrending();
    }, []);

    if (loading || trending.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔥 Trending Now</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {trending.map((anime) => (
                    <TouchableOpacity
                        key={anime.id}
                        style={styles.card}
                        onPress={() => onSelectAnime({
                            title: { romaji: anime.title.romaji },
                            lastEpisode: anime.nextAiringEpisode ? anime.nextAiringEpisode.episode - 1 : null
                        })}
                    >
                        <Image
                            source={{ uri: anime.coverImage.large }}
                            style={styles.cover}
                            resizeMode="cover"
                        />
                        <View style={styles.infoOverlay}>
                            <Text style={styles.animeTitle} numberOfLines={2}>
                                {anime.title.romaji}
                            </Text>
                            {anime.nextAiringEpisode && (
                                <Text style={styles.episodeBadge}>
                                    Ep {anime.nextAiringEpisode.episode} soon
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 10,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 10,
        textShadow: '0px 1px 3px rgba(0, 0, 0, 0.75)',
        // textShadowColor: 'rgba(0, 0, 0, 0.75)',
        // textShadowOffset: { width: 0, height: 1 },
        // textShadowRadius: 3,
    },
    scrollContent: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.5,
        marginRight: 15,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#2A2A2A',
        elevation: 5,
        // Web box shadow
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    },
    cover: {
        width: '100%',
        height: '100%',
    },
    infoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    animeTitle: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    episodeBadge: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: '600',
    }
});
