import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Keyboard, Platform, TouchableWithoutFeedback } from 'react-native';
import GlassLayout from '../components/ui/GlassLayout';
import GlassInput from '../components/ui/GlassInput';
import GlassCard from '../components/ui/GlassCard';
import GlassDropdown from '../components/ui/GlassDropdown';
import TrendingAnime from '../components/features/TrendingAnime';
import { getMangaContinuation } from '../services/mangaService';
import { searchAnimeList } from '../services/anilistService';
import { COLORS, SPACING, RADIUS } from '../theme';

export default function MangaGuideScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [episode, setEpisode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Debounce Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2 && showDropdown) {
                const results = await searchAnimeList(searchQuery);
                setSuggestions(results);
            } else if (searchQuery.length < 2) {
                setSuggestions([]);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle Selecting an anime from dropdown
    const handleSelectAnime = (anime) => {
        setSearchQuery(anime.title.userPreferred || anime.title.romaji);
        setSuggestions([]);
        setShowDropdown(false);
        Keyboard.dismiss();
    };

    const handleSearch = async () => {
        if (!searchQuery.trim() || !episode.trim()) return;

        setShowDropdown(false);
        Keyboard.dismiss();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await getMangaContinuation(searchQuery, parseInt(episode));
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to find manga info');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassLayout>
            <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Manga Guide</Text>
                        <Text style={styles.subtitle}>Continue the story</Text>
                    </View>

                    {/* Input Section */}
                    <View style={styles.inputContainer}>
                        <View style={{ zIndex: 2000 }}>
                            <GlassInput
                                placeholder="Anime Name (e.g. Jujutsu Kaisen)"
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    setShowDropdown(true);
                                }}
                                style={styles.input}
                            />
                            {/* Dropdown Overlay */}
                            <GlassDropdown
                                data={suggestions}
                                visible={showDropdown && suggestions.length > 0}
                                onSelect={handleSelectAnime}
                            />
                        </View>

                        <View style={styles.row}>
                            <GlassInput
                                placeholder="Ep #"
                                value={episode}
                                onChangeText={setEpisode}
                                style={[styles.input, styles.episodeInput]}
                            />

                            {/* Action Button (Styled as GlassCard for now or custom button) */}
                            <GlassCard style={styles.searchButton} variant="light">
                                <Text
                                    style={styles.searchButtonText}
                                    onPress={handleSearch}
                                >
                                    {loading ? 'Checking...' : 'Find Chapter'}
                                </Text>
                            </GlassCard>
                        </View>
                    </View>

                    {/* Loading State */}
                    {loading && (
                        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                    )}

                    {/* Error State */}
                    {error && (
                        <GlassCard style={styles.errorCard}>
                            <Text style={styles.errorText}>⚠️ {error}</Text>
                        </GlassCard>
                    )}

                    {/* Result Card */}
                    {result && (
                        <GlassCard style={styles.resultCard} variant="dark">
                            <View style={styles.resultHeader}>
                                {result.animeCover && (
                                    <Image source={{ uri: result.animeCover }} style={styles.coverImage} />
                                )}
                                <View style={styles.resultInfo}>
                                    <Text style={styles.mangaTitle}>{result.mangaTitle}</Text>
                                    <View style={styles.badgeRow}>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>
                                                Vol {result.volume}
                                            </Text>
                                        </View>
                                        <View style={[styles.badge, styles.chapterBadge]}>
                                            <Text style={styles.badgeText}>
                                                Ch {result.chapter}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.separator} />

                            <Text style={styles.contextLabel}>CONTEXT</Text>
                            <Text style={styles.contextText}>{result.context}</Text>

                            {result.source === 'gemini' && (
                                <Text style={styles.aiTag}>✨ AI Analysis</Text>
                            )}
                        </GlassCard>
                    )}

                    {/* Trending Section */}
                    <View style={styles.trendingSection}>
                        <TrendingAnime
                            onSelectAnime={(anime) => {
                                setSearchQuery(anime.title.romaji);
                                if (anime.lastEpisode) setEpisode(String(anime.lastEpisode + 1));
                            }}
                        />
                    </View>

                </ScrollView>
            </TouchableWithoutFeedback>
        </GlassLayout >
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: SPACING.l,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
    },
    header: {
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: 1,
        marginBottom: SPACING.xs,
        // Removed orange shadow
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    inputContainer: {
        marginBottom: SPACING.xl,
        gap: SPACING.m,
        zIndex: 100, // Force stacking context above trending/results
        ...Platform.select({
            web: { zIndex: 100 },
        })
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    input: {
        flex: 1,
    },
    episodeInput: {
        flex: 0.4,
    },
    searchButton: {
        flex: 0.6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    searchButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loader: {
        marginVertical: SPACING.xl,
    },
    errorCard: {
        backgroundColor: 'rgba(255, 0, 85, 0.2)',
        borderColor: COLORS.error,
        marginBottom: SPACING.l,
    },
    errorText: {
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    resultCard: {
        marginBottom: SPACING.xl,
    },
    resultHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.m,
    },
    coverImage: {
        width: 80,
        height: 120,
        borderRadius: RADIUS.s,
        marginRight: SPACING.m,
    },
    resultInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    mangaTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.s,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    badge: {
        paddingHorizontal: SPACING.m,
        paddingVertical: 6,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.glassMedium,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    chapterBadge: {
        backgroundColor: COLORS.glassHeavy,
        borderColor: COLORS.primary,
        borderWidth: 1,
    },
    badgeText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.m,
    },
    contextLabel: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginBottom: SPACING.xs,
        letterSpacing: 1,
    },
    contextText: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginBottom: SPACING.m,
    },
    aiTag: {
        fontSize: 12,
        color: COLORS.blue,
        textAlign: 'right',
        fontStyle: 'italic',
    },
    trendingSection: {
        marginTop: SPACING.l,
    }
});
