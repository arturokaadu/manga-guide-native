const API_BASE = '/api'; // Same Vercel project = no CORS

export async function lookupManga(animeTitle, episode) {
    try {
        const response = await fetch(`${API_BASE}/manga-lookup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ animeTitle, episode }),
            signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) throw new Error(`Backend error: ${response.status}`);

        const data = await response.json();
        return { success: true, ...data, source: 'gemini' };
    } catch (error) {
        console.warn('[Gemini] Lookup failed:', error.message);
        return { success: false, error: error.message };
    }
}
