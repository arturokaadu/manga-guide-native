// Volume Cover Service - Fetches manga volume cover images
// Uses Open Library Covers API as primary source with fallback to placeholder

const OPEN_LIBRARY_COVER_API = 'https://covers.openlibrary.org/b/isbn';

// Try to fetch volume cover from various sources
export async function fetchVolumeCover(volumeNumber, mangaTitle) {
    // Attempt 1: Try constructing a plausible ISBN (this won't work for most manga, but we try)
    // Most manga ISBNs follow patterns but we don't have a reliable mapping

    // Attempt 2: Use MangaDex API (free, no auth required)
    try {
        const coverUrl = await fetchFromMangaDex(mangaTitle, volumeNumber);
        if (coverUrl) return coverUrl;
    } catch (error) {
        console.warn('[VolumeCover] MangaDex fetch failed:', error.message);
    }

    // Fallback: Return a themed placeholder with volume number
    return getPlaceholderCover(mangaTitle, volumeNumber);
}

// Fetch from MangaDex API
async function fetchFromMangaDex(mangaTitle, volumeNumber) {
    try {
        // Search for manga
        const searchUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(mangaTitle)}&limit=1`;
        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) return null;

        const searchData = await searchResponse.json();
        if (!searchData.data || searchData.data.length === 0) return null;

        const mangaId = searchData.data[0].id;

        // Get cover art for specific volume
        const coverUrl = `https://api.mangadex.org/cover?manga[]=${mangaId}&limit=10`;
        const coverResponse = await fetch(coverUrl);

        if (!coverResponse.ok) return null;

        const coverData = await coverResponse.json();
        if (!coverData.data || coverData.data.length === 0) return null;

        // Try to find cover for specific volume
        const volumeCover = coverData.data.find(cover =>
            cover.attributes.volume === String(volumeNumber)
        );

        if (volumeCover) {
            const fileName = volumeCover.attributes.fileName;
            return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
        }

        // Fallback: return first available cover
        const firstCover = coverData.data[0];
        const fileName = firstCover.attributes.fileName;
        return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;

    } catch (error) {
        console.warn('[MangaDex] Error:', error);
        return null;
    }
}

// Generate themed placeholder
function getPlaceholderCover(mangaTitle, volumeNumber) {
    // Use a color scheme based on manga title hash
    const hash = mangaTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;

    // Return via.placeholder with themed color
    return `https://via.placeholder.com/256x384/${getColorFromHue(hue)}/FFFFFF?text=Vol+${volumeNumber}`;
}

// Convert hue to hex color
function getColorFromHue(hue) {
    // Popular anime color schemes
    const colors = [
        'FF6B35', // Orange (like Naruto)
        '8B5CF6', // Purple (like Jujutsu Kaisen)
        'FF4500', // Red-Orange (like One Piece)
        '4169E1', // Blue (like Bleach)
        'FFD700', // Gold (like Dragon Ball)
        '00CED1', // Turquoise (like My Hero Academia)
    ];

    const index = hue % colors.length;
    return colors[index];
}

// Batch fetch multiple volume covers (for future use)
export async function fetchMultipleCovers(mangaTitle, volumeNumbers) {
    const promises = volumeNumbers.map(vol => fetchVolumeCover(vol, mangaTitle));
    return Promise.all(promises);
}
