import { validateEpisode, searchAnime } from './anilistService';
import { isFiller } from '../data/fillerLists';
import { estimateChapter } from './rhythmCalculator';
import * as geminiProxy from './geminiProxy';

export async function getMangaContinuation(animeTitle, episode) {
    if (isFiller(animeTitle, episode)) {
        return { isFiller: true, animeTitle, episode: parseInt(episode) };
    }

    const animeData = await searchAnime(animeTitle);
    const animeCover = animeData?.coverImage?.large || null;
    const mangaTitle = animeData?.title?.romaji || animeTitle;

    const geminiResult = await geminiProxy.lookupManga(animeTitle, episode);

    if (geminiResult.success) {
        return { ...geminiResult, mangaTitle, animeCover, isFiller: false };
    }

    console.log('[MangaService] Gemini unavailable, using rhythm fallback');
    const rhythmResult = estimateChapter(animeTitle, episode);

    return { ...rhythmResult, mangaTitle, animeCover, isFiller: false, source: 'rhythm_fallback' };
}

export { validateEpisode };
