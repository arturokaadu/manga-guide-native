import { validateEpisode, searchAnime } from './anilistService';
import { isFiller } from '../data/fillerLists';
import { estimateChapter } from './rhythmCalculator';
import * as geminiProxy from './geminiProxy';
import { fetchVolumeCover } from './volumeCoverService';

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

        if (geminiResult.success) {
            // Fetch volume cover
            let volumeCoverUrl = null;
            if (geminiResult.volume) {
                volumeCoverUrl = await fetchVolumeCover(geminiResult.volume, mangaTitle);
            }

            // Use anime cover if volume cover not found or is placeholder
            if (!volumeCoverUrl || volumeCoverUrl.includes('placeholder')) {
                volumeCoverUrl = animeCover;
            }

            return {
                ...geminiResult,
                mangaTitle,
                animeCover,
                volumeCoverUrl,
                isFiller: false,
                source: 'Gemini AI (High accuracy)'
            };
        } else {
            // If Gemini fails, throw the error to frontend instead of using estimated calculator
            throw new Error(geminiResult.error || 'Gemini AI lookup failed');
        }

        /* 
        // FALBACK DISABLED AS PER USER REQUEST
        // Step 5: Fallback to rhythm calculator
        // ...
        */
    } catch (error) {
        console.error('[MangaService] Error:', error);
        throw error;
    }
}

export { validateEpisode };
