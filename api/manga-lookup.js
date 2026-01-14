// Gemini Manga Lookup API - Vercel Serverless Function
// Returns precise manga chapter/volume for anime episode

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    // CORS - allow frontend domain
    const allowedOrigins = [
        'https://manga-guide-native.vercel.app',
        'https://luna-manga-guide.vercel.app',
        'http://localhost:19006', // Expo local dev
        'http://localhost:8081',  // Expo web dev port 1
        'http://localhost:8082'   // Expo web dev port 2
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { animeTitle, episode } = req.body;

    if (!animeTitle || !episode) {
        return res.status(400).json({ error: 'Missing animeTitle or episode' });
    }

    // Verify API Key availability
    if (!process.env.GEMINI_API_KEY) {
        console.error('[Configuration Error]: GEMINI_API_KEY is missing in environment variables.');
        return res.status(500).json({
            error: 'Configuration Error: Missing GEMINI_API_KEY. Please verify Vercel environment variables.',
            source: 'server-config'
        });
    }

    const prompt = `You are a precise anime-to-manga mapping expert. Given an anime title and episode number, provide the EXACT manga chapter and volume where that episode ends, along with brief context.

Date Context: Today is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Treat this as the current date for all airing information.

ANIME: "${animeTitle}"
EPISODE: ${episode}

Respond in this EXACT JSON format (no markdown, just raw JSON):
{
  "chapter": <number>,
  "volume": <number>,
  "context": "<1-2 sentence description of what happens in this chapter>",
  "source": "gemini"
}

CRITICAL RULES:
1. Provide EXACT chapter/volume numbers based on actual anime-manga correspondence
2. If the anime adapts multiple chapters per episode, give the ENDING chapter of episode ${episode}
3. For popular anime (Jujutsu Kaisen, Demon Slayer, etc), use well-documented episode-chapter mappings
4. Context should mention key events/arc name in that chapter
5. Return ONLY valid JSON, no extra text

If you cannot find accurate information, respond with:
{
  "error": "Could not find accurate mapping for this anime/episode",
  "source": "gemini"
}`;

    let data;

    try {
        // 🚀 Primary: Gemini 1.5 Pro (Highest Accuracy)
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            data = JSON.parse(text);
        } catch (primaryError) {
            console.warn('[Gemini 1.5 Pro Failed] Falling back to Flash:', primaryError.message);

            // 🛡️ Fallback: Gemini 1.5 Flash-002 (Fast & Stable)
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
            const result = await fallbackModel.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            data = JSON.parse(text);
        }

        if (!data) throw new Error("Both models failed to generate valid JSON");

        if (data.error) {
            return res.status(404).json(data);
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('[Gemini API Error]:', error);

        // Return the ACTUAL error message to the client for transparency
        return res.status(500).json({
            error: `Gemini Error: ${error.message || 'Unknown error'}`,
            details: error.stack,
            source: 'gemini-api'
        });
    }
};
