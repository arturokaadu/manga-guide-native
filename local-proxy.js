const http = require('http');
const https = require('https');

const API_KEY = "AIzaSyD-CH4S6YpzZW_b9vdKwvwfkLsNtzjGIx8";
const PORT = 3000;

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/manga-lookup') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { animeTitle, episode } = JSON.parse(body);
                console.log(`[Proxy] Request: ${animeTitle} Ep ${episode}`);

                const prompt = `You are a precise anime-to-manga mapping expert. Given an anime title and episode number, provide the EXACT manga chapter and volume where that episode ends, along with brief context.

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
5. Return ONLY valid JSON, no extra text`;

                // Call Google API
                const googleReq = https.request(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    },
                    (googleRes) => {
                        let googleBody = '';
                        googleRes.on('data', chunk => { googleBody += chunk; });
                        googleRes.on('end', () => {
                            try {
                                const data = JSON.parse(googleBody);
                                const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

                                if (!candidate) {
                                    throw new Error('No candidate in Gemini response: ' + JSON.stringify(data));
                                }

                                let text = candidate.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
                                const cleanData = JSON.parse(text);

                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: true, ...cleanData, source: 'gemini (local proxy)' }));
                            } catch (e) {
                                console.error('[Proxy] Parse Error:', e);
                                res.writeHead(500);
                                res.end(JSON.stringify({ error: 'Failed to process Gemini response' }));
                            }
                        });
                    }
                );

                googleReq.on('error', (e) => {
                    console.error('[Proxy] Google Request Error:', e);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: e.message }));
                });

                googleReq.write(JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }));
                googleReq.end();

            } catch (e) {
                console.error('[Proxy] Request Error:', e);
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 Local Gemini Proxy running at http://localhost:${PORT}`);
    console.log('✅ CORS enabled for all origins');
    console.log('⏳ Waiting for requests...\n');
});
