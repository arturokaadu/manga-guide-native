import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, ImageBackground, Image } from 'react-native';
import { getMangaContinuation, validateEpisode } from '../services/mangaService';
import { searchAnimeList } from '../services/anilistService';
import RecentlyFinished from './RecentlyFinished';

export default function MangaGuide() {
    const [animeTitle, setAnimeTitle] = useState('');
    const [episode, setEpisode] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);

    const handleRecentlyFinishedSelect = (anime) => {
        setAnimeTitle(anime.title);
        setEpisode(String(anime.lastEpisode || ''));
    };

    const handleAnimeSearch = async (text) => {
        setAnimeTitle(text);
        if (text.length >= 2) {
            const results = await searchAnimeList(text);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const selectAnime = (anime) => {
        setAnimeTitle(anime.title.romaji);
        setSuggestions([]);
    };

    const handleSearch = async () => {
        if (!animeTitle || !episode) {
            setError('Please enter both anime title and episode number');
            return;
        }

        setLoading(true);
        setError(null);

        const validation = await validateEpisode(animeTitle, episode);

        if (!validation.valid) {
            setError(validation.error);
            setLoading(false);
            return;
        }

        setResult(null);

        try {
            const data = await getMangaContinuation(animeTitle, episode);
            setResult(data);

            if (data.animeCover) {
                setBackgroundImage(data.animeCover);
            }
        } catch (err) {
            setError('Could not find manga information. Try another anime!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {backgroundImage && (
                <ImageBackground source={{ uri: backgroundImage }} style={styles.backgroundContainer} blurRadius={50} resizeMode="cover">
                    <View style={styles.darkOverlay} />
                </ImageBackground>
            )}

            <View style={styles.content}>
                <View style={styles.headerGradient}>
                    <Text style={styles.title}>🌙 Luna's Manga Guide</Text>
                    <Text style={styles.subtitle}>Continue your anime journey in manga</Text>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search anime..."
                        placeholderTextColor="#FF6B35"
                        value={animeTitle}
                        onChangeText={handleAnimeSearch}
                    />

                    {suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            {suggestions.map((anime) => (
                                <TouchableOpacity
                                    key={anime.id}
                                    style={styles.suggestionItem}
                                    onPress={() => selectAnime(anime)}
                                >
                                    <Text style={styles.suggestionText}>{anime.title.romaji}</Text>
                                    <Text style={styles.suggestionEps}>{anime.episodes} eps</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="Episode Number"
                        placeholderTextColor="#FF6B35"
                        value={episode}
                        onChangeText={setEpisode}
                        keyboardType="numeric"
                    />

                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.searchButtonText}>Search 🔍</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>❌ {error}</Text>
                    </View>
                )}

                {result && !result.isFiller && (
                    <View style={styles.resultContainer}>
                        <View style={styles.resultCard}>
                            <Text style={styles.mangaTitle}>🎬 {result.mangaTitle}</Text>

                            <View style={styles.mainContent}>
                                {result.volumeCover && (
                                    <Image
                                        source={{ uri: result.volumeCover }}
                                        style={styles.volumeCover}
                                        resizeMode="cover"
                                    />
                                )}

                                <View style={styles.infoSection}>
                                    <View style={styles.chapterInfo}>
                                        <Text style={styles.chapterLabel}>Continue From:</Text>
                                        <Text style={styles.chapterNumber}>📖 Chapter {result.chapter}</Text>
                                        <Text style={styles.volumeNumber}>📚 Volume {result.volume}</Text>
                                    </View>

                                    {result.context && (
                                        <View style={styles.contextInfo}>
                                            <Text style={styles.contextText}>"{result.context}"</Text>
                                        </View>
                                    )}

                                    {result.source && (
                                        <View style={styles.sourceInfo}>
                                            <Text style={styles.sourceText}>ℹ️ Source: {result.source === 'gemini' ? 'Gemini AI (High accuracy)' : result.source}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {result.reasoning && (
                                <View style={styles.reasoningContainer}>
                                    <Text style={styles.reasoningText}>💭 {result.reasoning}</Text>
                                </View>
                            )}

                            {result.note && (
                                <View style={styles.noteContainer}>
                                    <Text style={styles.noteText}>📝 {result.note}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {result && result.isFiller && (
                    <View style={styles.fillerContainer}>
                        <Text style={styles.fillerEmoji}>⚠️</Text>
                        <Text style={styles.fillerTitle}>Filler Episode</Text>
                        <Text style={styles.fillerText}>
                            Episode {episode} is anime-original filler and doesn't adapt manga content.
                        </Text>
                        <Text style={styles.fillerSuggestion}>
                            Try the previous or next episode for canon content.
                        </Text>
                    </View>
                )}

                <RecentlyFinished onSelectAnime={handleRecentlyFinishedSelect} />

                <Text style={styles.footer}>Powered by Luna + Gemini AI 🌙✨</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a15' },
    backgroundContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 10, 21, 0.90)' },
    content: { flex: 1, padding: 20, paddingTop: 60 },
    headerGradient: {
        marginBottom: 32,
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        borderWidth: 2,
        borderColor: '#FF6B35',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FF6B35',
        textAlign: 'center',
        marginBottom: 8,
        textShadowColor: 'rgba(255, 107, 53, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtitle: { fontSize: 16, color: '#FFB7C5', textAlign: 'center' },
    inputContainer: { marginBottom: 24, position: 'relative' },
    input: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderWidth: 2,
        borderColor: '#8B5CF6',
        borderRadius: 16,
        padding: 18,
        color: '#fff',
        fontSize: 16,
        marginBottom: 16,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(10, 10, 21, 0.98)',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FF6B35',
        maxHeight: 200,
        zIndex: 1000,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    suggestionItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    suggestionText: { color: '#fff', fontSize: 15, flex: 1 },
    suggestionEps: { color: '#FFB7C5', fontSize: 13 },
    searchButton: {
        backgroundColor: '#FF6B35',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },
    searchButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
        padding: 18,
        borderRadius: 12,
        marginBottom: 16
    },
    errorText: { color: '#ff6b6b', fontSize: 15 },
    resultContainer: { marginBottom: 24 },
    resultCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.20)',
        borderWidth: 3,
        borderColor: '#8B5CF6',
        borderRadius: 20,
        padding: 28,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    mangaTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFB7C5', marginBottom: 20 },
    mainContent: { flexDirection: 'row', marginBottom: 20, gap: 16 },
    volumeCover: {
        width: 140,
        height: 210,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: '#FF6B35',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },
    infoSection: { flex: 1, justifyContent: 'space-around' },
    chapterInfo: { marginBottom: 16 },
    chapterLabel: { color: '#aaa', fontSize: 14, marginBottom: 10 },
    chapterNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FF6B35',
        textShadowColor: 'rgba(255, 107, 53, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    volumeNumber: { fontSize: 20, color: '#FFB7C5', marginTop: 8 },
    contextInfo: {
        backgroundColor: 'rgba(255, 107, 53, 0.15)',
        padding: 14,
        borderRadius: 12,
        marginBottom: 14,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B35',
    },
    contextText: { color: '#FFB7C5', fontSize: 15, fontStyle: 'italic' },
    sourceInfo: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        padding: 10,
        borderRadius: 8,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#8B5CF6',
    },
    sourceText: { color: '#c4b5fd', fontSize: 13 },
    reasoningContainer: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        padding: 14,
        borderRadius: 12,
        marginTop: 14
    },
    reasoningText: { color: '#c4b5fd', fontSize: 14 },
    noteContainer: {
        backgroundColor: 'rgba(255, 183, 197, 0.1)',
        padding: 14,
        borderRadius: 12,
        marginTop: 14
    },
    noteText: { color: '#FFB7C5', fontSize: 14 },
    fillerContainer: {
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        borderWidth: 3,
        borderColor: '#FF6B35',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    fillerEmoji: { fontSize: 56, marginBottom: 16 },
    fillerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FF6B35', marginBottom: 14 },
    fillerText: { color: '#FFB7C5', fontSize: 16, textAlign: 'center', marginBottom: 14 },
    fillerSuggestion: { color: '#aaa', fontSize: 14, textAlign: 'center', fontStyle: 'italic' },
    footer: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 32, marginBottom: 40 },
});
