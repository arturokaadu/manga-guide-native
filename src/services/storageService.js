import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'manga_guide_history';
const MAX_HISTORY = 10;

export async function saveHistory(item) {
    try {
        const existingInfo = await getHistory();

        // Remove duplicates (by anime title)
        const filtered = existingInfo.filter(h => h.title !== item.title);

        // Add new item to front
        const newHistory = [item, ...filtered].slice(0, MAX_HISTORY);

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
        return jsonDate ? JSON.parse(jsonDate) : [];
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
