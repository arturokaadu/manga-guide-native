import { validateEpisode, searchAnime } from './anilistService';
import { getVolumeInfo } from './volumeService';
import { isFiller } from '../data/fillerLists';
import { estimateChapter } from './rhythmCalculator';
import * as geminiProxy from './geminiProxy';
import { fetchVolumeCover } from './volumeCoverService';

export async function getMangaContinuation(animeTitle, episode, season = null) {
    try {

        // Parallelize all independent data fetches
        // 1. Validation (AniList)
        // 2. Anime Metadata (AniList) - for cover/title
        // 3. Volume Info (AniList/Cache) - for volume accuracy
        // 4. Gemini AI (Local Proxy) - for main logic

        const validationPromise = validateEpisode(animeTitle, episode);
        const animeDataPromise = searchAnime(animeTitle);
        const volumeInfoPromise = getVolumeInfo(animeTitle);

        // Start Gemini immediately with the provided title
        // We trade "perfect title" (from animeData) for speed
        const geminiPromise = geminiProxy.lookupManga(animeTitle, episode, season);

        // Await Validation first to fail fast if needed
        const validation = await validationPromise;
        if (!validation.valid) {
            // Cancel other promises if possible (JS doesn't natively support cancel, but we ignore results)
            throw new Error(validation.error);
        }

        // Check filler locally (fast)
        if (isFiller(animeTitle, episode)) {
            return { isFiller: true, animeTitle, episode: parseInt(episode) };
        }

        // Wait for heavy lifting
        const [animeData, volumeInfo, geminiResult] = await Promise.all([
            animeDataPromise,
            volumeInfoPromise,
            geminiPromise
        ]);

        const animeCover = animeData?.coverImage?.large || null;
        const mangaTitle = animeData?.title?.romaji || animeTitle;

        if (geminiResult.success) {
            let finalVolume = geminiResult.volume;
            let volumeSource = 'Gemini AI';

            if (volumeInfo && volumeInfo.volumes) {
                // Prefer AniList volume if Gemini missing or differs
                if (!finalVolume || finalVolume !== volumeInfo.volumes) {
                    finalVolume = volumeInfo.volumes;
                    volumeSource = 'AniList';
                }
            }

            // Fetch volume cover based on finalVolume
            let volumeCoverUrl = null;
            if (finalVolume) {
                // This depends on the result, so it must wait
                volumeCoverUrl = await fetchVolumeCover(finalVolume, mangaTitle);
            }

            // Fallback to anime cover if needed
            if (!volumeCoverUrl || volumeCoverUrl.includes('placeholder')) {
                volumeCoverUrl = animeCover;
            }

            return {
                ...geminiResult,
                volume: finalVolume,
                volumeSource,
                mangaTitle,
                animeCover,
                volumeCoverUrl,
                isFiller: false,
                source: 'Gemini AI (High accuracy)'
            };
        } else {
            // If Gemini fails, throw the error
            throw new Error(geminiResult.error || 'Gemini AI lookup failed');
        }
    } catch (error) {
        console.error('[MangaService] Error:', error);
        throw error;
    }
}

export { validateEpisode };
