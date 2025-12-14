import { validateEpisode, searchAnime } from './anilistService';
import { isFiller } from '../data/fillerLists';
import { estimateChapter } from './rhythmCalculator';
import * as geminiProxy from './geminiProxy';

export async function getMangaContinuation(animeTitle, episode) {
    try {
        // Step 1: Validate episode with EXACT anime title user provided
        const validation = await validateEpisode(animeTitle, episode);

        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Step 2: Check if filler
        if (isFiller(animeTitle, episode)) {
            return { isFiller: true, animeTitle, episode: parseInt(episode) };
        }

        // Step 3: Get anime metadata for cover/title
        const animeData = await searchAnime(animeTitle);
        const animeCover = animeData?.coverImage?.large || null;
        const mangaTitle = animeData?.title?.romaji || animeTitle;

        // Step 4: Try Gemini AI first
        const geminiResult = await geminiProxy.lookupManga(animeTitle, episode);

        if (geminiResult.success && geminiResult.chapter && geminiResult.volume) {
            return {
                ...geminiResult,
                mangaTitle,
                animeCover,
                isFiller: false,
                source: 'Gemini AI (High accuracy)'
            };
        }

        // Step 5: Fallback to rhythm calculator
        console.log('[MangaService] Gemini unavailable, using rhythm fallback');
        const rhythmResult = estimateChapter(animeTitle, episode);

        return {
            ...rhythmResult,
            mangaTitle,
            animeCover,
            isFiller: false,
            source: 'Rhythm Calculator (Estimated)'
        };
    } catch (error) {
        console.error('[MangaService] Error:', error);
        throw error;
    }
}

export { validateEpisode };
