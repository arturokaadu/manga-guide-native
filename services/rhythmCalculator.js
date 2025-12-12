const KNOWN_PACING = {
    'jujutsu kaisen': { chaptersPerEpisode: 2.5, offset: 0 },
    'demon slayer': { chaptersPerEpisode: 3.0, offset: 0 },
    'attack on titan': { chaptersPerEpisode: 2.0, offset: 0 },
    'my hero academia': { chaptersPerEpisode: 2.5, offset: 0 },
    'chainsaw man': { chaptersPerEpisode: 2.5, offset: 0 },
    'tokyo revengers': { chaptersPerEpisode: 3.0, offset: 0 },
    'one piece': { chaptersPerEpisode: 1.5, offset: 0 },
    'naruto': { chaptersPerEpisode: 2.0, offset: 0 },
    'bleach': { chaptersPerEpisode: 2.0, offset: 0 },
};

export function estimateChapter(animeTitle, episode) {
    const normalized = animeTitle.toLowerCase().trim();

    for (const [anime, pacing] of Object.entries(KNOWN_PACING)) {
        if (normalized.includes(anime)) {
            const estimatedChapter = Math.round(parseInt(episode) * pacing.chaptersPerEpisode + pacing.offset);
            const estimatedVolume = Math.ceil(estimatedChapter / 9);

            return {
                chapter: estimatedChapter,
                volume: estimatedVolume,
                confidence: 'medium',
                reasoning: `Estimated based on ${pacing.chaptersPerEpisode} chapters/episode pacing`,
                note: 'This is an estimate. For highest accuracy, we recommend using the Gemini-powered lookup.'
            };
        }
    }

    const defaultPacing = 2.0;
    const estimatedChapter = Math.round(parseInt(episode) * defaultPacing);
    const estimatedVolume = Math.ceil(estimatedChapter / 9);

    return {
        chapter: estimatedChapter,
        volume: estimatedVolume,
        confidence: 'low',
        reasoning: `Estimated using generic ${defaultPacing} chapters/episode ratio`,
        note: 'Unknown anime. This is a rough estimate and may not be accurate.'
    };
}
