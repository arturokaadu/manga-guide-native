import { isFiller } from '../data/fillerLists';

// Accurate pacing data based on real anime-to-manga research
// Sources: Reddit, anime wikis, web search (Dec 2024)
const KNOWN_PACING = {
    'jujutsu kaisen': {
        chaptersPerEpisode: 3.1,  // S2 ends at ch 136, ep 47 (23 eps)
        offset: 0,
        volumesPerChapter: 1 / 9  // Average 9 chapters per volume
    },
    'demon slayer': {
        chaptersPerEpisode: 2.08,  // S1: 26 eps = ch 1-54
        offset: 0,
        volumesPerChapter: 1 / 9
    },
    'attack on titan': {
        chaptersPerEpisode: 2.0,
        offset: 0,
        volumesPerChapter: 1 / 4  // AoT has ~4 chapters per volume
    },
    'my hero academia': {
        chaptersPerEpisode: 2.5,
        offset: 0,
        volumesPerChapter: 1 / 10  // MHA typically 10 chapters/volume
    },
    'chainsaw man': {
        chaptersPerEpisode: 2.5,
        offset: 0,
        volumesPerChapter: 1 / 9
    },
    'tokyo revengers': {
        chaptersPerEpisode: 3.0,
        offset: 0,
        volumesPerChapter: 1 / 9
    },
    'one piece': {
        chaptersPerEpisode: 1.0,  // One Piece adapts ~1 chapter/ep (very slow pacing)
        offset: 0,
        volumesPerChapter: 1 / 10  // One Piece typically 10 chapters/volume
    },
    'naruto': {
        chaptersPerEpisode: 2.0,
        offset: 0,
        volumesPerChapter: 1 / 9
    },
    'bleach': {
        chaptersPerEpisode: 2.0,
        offset: 0,
        volumesPerChapter: 1 / 9
    },
    'hunter x hunter': {
        chaptersPerEpisode: 2.5,
        offset: 0,
        volumesPerChapter: 1 / 10
    },
    'fullmetal alchemist brotherhood': {
        chaptersPerEpisode: 1.7,  // 64 eps for ~108 chapters
        offset: 0,
        volumesPerChapter: 1 / 4
    }
};

// Count filler episodes up to a given episode
function countFillers(animeTitle, upToEpisode) {
    let fillerCount = 0;
    for (let i = 1; i <= parseInt(upToEpisode); i++) {
        if (isFiller(animeTitle, i)) {
            fillerCount++;
        }
    }
    return fillerCount;
}

export function estimateChapter(animeTitle, episode) {
    const normalized = animeTitle.toLowerCase().trim();

    for (const [anime, pacing] of Object.entries(KNOWN_PACING)) {
        if (normalized.includes(anime)) {
            // Count filler episodes up to this point
            const fillers = countFillers(animeTitle, episode);
            const canonEpisodes = parseInt(episode) - fillers;

            // Calculate based on canon episodes only
            const estimatedChapter = Math.round(canonEpisodes * pacing.chaptersPerEpisode + pacing.offset);
            const estimatedVolume = Math.ceil(estimatedChapter * pacing.volumesPerChapter);

            const hasFillers = fillers > 0;

            return {
                chapter: estimatedChapter,
                volume: estimatedVolume,
                confidence: 'medium',
                reasoning: hasFillers
                    ? `Estimated based on ${pacing.chaptersPerEpisode} chapters/episode (${fillers} filler ep${fillers > 1 ? 's' : ''} excluded)`
                    : `Estimated based on ${pacing.chaptersPerEpisode} chapters/episode pacing`,
                note: 'This is an estimate. For highest accuracy, enable Gemini AI lookup.'
            };
        }
    }

    // Default fallback for unknown anime
    const defaultPacing = 2.0;
    const fillers = countFillers(animeTitle, episode);
    const canonEpisodes = parseInt(episode) - fillers;
    const estimatedChapter = Math.round(canonEpisodes * defaultPacing);
    const estimatedVolume = Math.ceil(estimatedChapter / 9);

    return {
        chapter: estimatedChapter,
        volume: estimatedVolume,
        confidence: 'low',
        reasoning: `Estimated using generic ${defaultPacing} chapters/episode ratio${fillers > 0 ? ` (${fillers} fillers excluded)` : ''}`,
        note: 'Unknown anime. This is a rough estimate and may not be accurate.'
    };
}
