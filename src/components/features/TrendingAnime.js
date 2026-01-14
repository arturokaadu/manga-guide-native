import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { getTrendingAnime } from '../../services/anilistService';
import { COLORS, RADIUS, SPACING } from '../../theme';
import GlassCard from '../ui/GlassCard';

const { width } = Dimensions.get('window');
// More compact poster size
const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;

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
            <Text style={styles.title}>TRENDING NOW</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {trending.map((anime) => (
                    <TouchableOpacity
                        key={anime.id}
                        activeOpacity={0.7}
                        onPress={() => onSelectAnime({
                            title: { romaji: anime.title.romaji },
                            lastEpisode: anime.nextAiringEpisode ? anime.nextAiringEpisode.episode - 1 : null
                        })}
                    >
                        <GlassCard style={styles.card} variant="light">
                            <Image
                                source={{ uri: anime.coverImage.extraLarge || anime.coverImage.large }}
                                style={styles.cover}
                                resizeMode="cover"
                            />

                            {/* Glass Overlay for Title */}
                            <View style={styles.infoOverlay}>
                                <Text style={styles.animeTitle} numberOfLines={2}>
                                    {anime.title.romaji}
                                </Text>
                                {anime.nextAiringEpisode && (
                                    <Text style={styles.episodeBadge}>
                                        EP {anime.nextAiringEpisode.episode}
                                    </Text>
                                )}
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.l,
        marginBottom: SPACING.xl,
    },
    title: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        marginLeft: SPACING.l,
        marginBottom: SPACING.m,
        letterSpacing: 1.5, // Cinematic spacing
    },
    scrollContent: {
        paddingHorizontal: SPACING.l,
        gap: SPACING.m,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        padding: 0, // Reset default padding of GlassCard
        overflow: 'hidden',
        borderWidth: 0, // Clean look
        marginRight: SPACING.m,
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
        padding: SPACING.s,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Simple distinct overlay
    },
    animeTitle: {
        color: COLORS.textPrimary,
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowRadius: 4,
    },
    episodeBadge: {
        color: COLORS.primary, // White/Glow
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    }
});
