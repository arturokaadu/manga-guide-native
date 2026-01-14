// Volume Service – fetches volume info from AniList and caches it
import { searchAnime } from './anilistService';
import { fetchVolumeInfo } from './anilistService';
import { cacheVolumeInfo, getCachedVolumeInfo } from './storageService';

/**
 * Get volume information for an anime title.
 * Returns { volumes, chapters, title } or null.
 */
export async function getVolumeInfo(animeTitle) {
    try {
        // Resolve anime ID first
        const anime = await searchAnime(animeTitle);
        if (!anime || !anime.id) return null;

        // Try cached info by anime ID
        const cached = await getCachedVolumeInfo(anime.id);
        if (cached) return cached;

        // Fetch from AniList
        const info = await fetchVolumeInfo(anime.id);
        if (info) {
            await cacheVolumeInfo(anime.id, info);
        }
        return info;
    } catch (e) {
        console.warn('[VolumeService] getVolumeInfo failed:', e);
        return null;
    }
}
