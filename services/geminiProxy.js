import { Platform } from 'react-native';

// Use local proxy in development (requires 'node local-proxy.js')
// Use Vercel production URL in production
const API_URL = (__DEV__ || (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname.includes('localhost')))
  ? 'http://localhost:3000/api/manga-lookup'
  : 'https://manga-guide-native.vercel.app/api/manga-lookup';

export async function lookupManga(animeTitle, episode) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animeTitle, episode }),
      // Increased timeout for Gemini generation
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { success: true, ...data };

  } catch (error) {
    console.warn('[Gemini Client] Lookup failed:', error.message);
    // Fallback lets the UI handle it (Rhythm Calc)
    return { success: false, error: error.message };
  }
}
