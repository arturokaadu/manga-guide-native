import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'manga_guide_history';
const MAX_HISTORY = 10;

export async function saveHistory(item) {
    try {
        const existingInfo = await getHistory();

        // Validate item structure
        if (!item || !item.title || typeof item.title !== 'string') {
            console.warn('[Storage] Attempted to save invalid history item:', item);
            return existingInfo;
        }

        // Sanitize item
        const cleanItem = {
            title: String(item.title),
            episode: String(item.episode),
            chapter: item.chapter ? String(item.chapter) : null,
            volume: item.volume ? String(item.volume) : null,
            cover: item.cover
        };

        // Remove duplicates (by anime title)
        const filtered = existingInfo.filter(h => h.title !== cleanItem.title);

        // Add new item to front
        const newHistory = [cleanItem, ...filtered].slice(0, MAX_HISTORY);

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        return newHistory;
    } catch (error) {
        console.error('[Storage] Save failed:', error);
        return [];
    }
}

export async function getHistory() {
    try {
        const jsonDate = await AsyncStorage.getItem(HISTORY_KEY);
        const data = jsonDate ? JSON.parse(jsonDate) : [];

        // Filter out corrupted items
        return Array.isArray(data) ? data.filter(item =>
            item &&
            typeof item.title === 'string' &&
            !item.title.includes('[object Object]')
        ) : [];
    } catch (error) {
        console.error('[Storage] Load failed:', error);
        return [];
    }
}

export async function clearHistory() {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('[Storage] Clear failed:', error);
    }
}

// Cache volume info for an anime by ID (valid for 24h)
export async function cacheVolumeInfo(animeId, info) {
    try {
        const key = `volume_${animeId}`;
        const payload = { info, timestamp: Date.now() };
        await AsyncStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
        console.warn('[Storage] cacheVolumeInfo failed:', e);
    }
}

export async function getCachedVolumeInfo(animeId) {
    try {
        const key = `volume_${animeId}`;
        const json = await AsyncStorage.getItem(key);
        if (!json) return null;
        const { info, timestamp } = JSON.parse(json);
        // Invalidate after 24h
        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
            await AsyncStorage.removeItem(key);
            return null;
        }
        return info;
    } catch (e) {
        console.warn('[Storage] getCachedVolumeInfo failed:', e);
        return null;
    }
}
