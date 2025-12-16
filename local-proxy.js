const http = require('http');
const https = require('https');

const API_KEY = "AIzaSyD9J7_rqycgwauz2ww-qtDiDFoeTyWa1Sc";
const PORT = 3011;

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
                const { animeTitle, episode, season } = JSON.parse(body);
                console.log(`[Proxy] Request: ${animeTitle} ${season ? `(${season})` : ''} Ep ${episode}`);

                // Construct a more explicit prompt
                const titleWithSeason = season ? `${animeTitle} (${season})` : animeTitle;

                const prompt = `You are a precise anime-to-manga mapping expert.
ANIME: "${titleWithSeason}"
EPISODE: "${episode}"

CRITICAL INSTRUCTION:
1. USE GOOGLE SEARCH (Grounding) to find the exact manga chapter that corresponds to the end of this episode.
2. Search typical queries like "${titleWithSeason} episode ${episode} manga chapter" or "where does ${titleWithSeason} leave off in manga".

3. Episode Numbering:
   - "Dandadan" Ep "24" often means Season 2 Ep 12 (Total 24?) or similar. Use Search to verify.
   - If user says "Dandadan Ep 24", and S2 is airing, check if it exists. (Likely S1=12eps, S2=12eps => Total 24).
   - Resolve ambiguities (Total vs Season Relative) using search results.

Goal: Identify the EXACT Manga Chapter and Volume.

Respond in this EXACT JSON format (no markdown):
{
  "chapter": <number>,
  "volume": <number>,
  "context": "<1-2 sentence description including context from search results>",
  "source": "gemini-search-grounding",
  "reasoning": "<Explanation citing search findings>"
}`;

                // Use 1.5-pro (v1beta or v1) for better reasoning stability vs 2.5-flash speed
                const googleReq = https.request(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
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

                                // Check for API errors
                                if (data.error) {
                                    throw new Error(`Google API Error: ${data.error.message} (Code: ${data.error.code})`);
                                }

                                const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

                                if (!candidate) {
                                    throw new Error('No candidate in Gemini response: ' + JSON.stringify(data));
                                }

                                let text = candidate.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
                                const cleanData = JSON.parse(text);

                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: true, ...cleanData, source: 'gemini (local proxy + search)' }));
                            } catch (e) {
                                console.error('[Proxy] Processing Error:', e);
                                console.error('[Proxy] Raw Body:', googleBody);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    error: `Proxy Error: ${e.message}`,
                                    details: googleBody ? googleBody.substring(0, 500) : 'No body'
                                }));
                            }
                        });
                    }
                );

                googleReq.on('error', (e) => {
                    console.error('[Proxy] Google Request Error:', e);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: `Network Error: ${e.message}` }));
                });

                // Add Google Search Tool configuration
                googleReq.write(JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    tools: [{ google_search_retrieval: { dynamic_retrieval_config: { mode: "MODE_DYNAMIC", dynamic_threshold: 0.7 } } }]
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
    console.log(`\n🚀 Local Gemini 1.5 Pro (v1beta + Search) Proxy running at http://localhost:${PORT}`);
    console.log('✅ CORS enabled for all origins');
    console.log('⏳ Waiting for requests...\n');
});
