// AniList Service WITH CORRECT EPISODE VALIDATION
// Counts ALL seasons recursively with optimized queries

const ANILIST_API = 'https://graphql.anilist.co';

// Manual overrides for anime with known total episodes (AniList relations often incomplete)
const KNOWN_EPISODE_TOTALS = {
  'Demon Slayer': 63,          // Kimetsu no Yaiba (all seasons)
  'Kimetsu no Yaiba': 63,
  'Jujutsu Kaisen': 47,        // S1 (24) + S2 (23)
  'Attack on Titan': 87,       // All seasons
  'Shingeki no Kyojin': 87,
  'My Hero Academia': 138,     // All seasons
  'Boku no Hero Academia': 138,
  'Naruto': 220,               // Original only
  'Naruto Shippuden': 500,     // Shippuden only
  'One Piece': 1100,           // Ongoing, approximate
  'Bleach': 366,               // Original run
  'Tokyo Revengers': 50,       // All seasons
  'Vinland Saga': 48,          // S1 (24) + S2 (24)
  'Blue Lock': 24,             // S1
  'Chainsaw Man': 12,          // S1
};

// Helper to get media definition with nested relations (3 levels deep)
// This reduces HTTP requests for long franchises like Dr. Stone or Monogatari
const MEDIA_FRAGMENT = `
  id
  title { romaji english }
  episodes
  seasonYear
  format
  status
  relations {
    edges {
      node {
        id
        type
        format
        status
        episodes
        title { romaji }
        seasonYear
        relations {
          edges {
            node {
              id
              type
              format
              status
              episodes
              title { romaji }
              seasonYear
              relations {
                edges {
                  node {
                    id
                    type
                    format
                    status
                    episodes
                    title { romaji }
                    seasonYear
                    relations { edges { node { id type format status episodes title { romaji } seasonYear } relationType } }
                  }
                  relationType
                }
              }
            }
            relationType
          }
        }
      }
      relationType
    }
  }
`;

const MEDIA_QUERY = `
  query ($id: Int) {
    Media(id: $id) {
      ${MEDIA_FRAGMENT}
    }
  }
`;

// Helper to extract sequel chain from nested data
function extractSequelsFromMedia(media, chain = [], visitedIds = new Set()) {
  if (!media || visitedIds.has(media.id)) return chain;

  // Add current media if not exists
  if (!chain.some(m => m.id === media.id)) {
    chain.push(media);
    visitedIds.add(media.id);
  }

  // Find next direct sequel
  const edges = media.relations?.edges || [];
  const sequelEdge = edges.find(edge =>
    edge.relationType === 'SEQUEL' &&
    edge.node.type === 'ANIME' &&
    ['TV', 'ONA', 'TV_SHORT', 'SPECIAL'].includes(edge.node.format) &&
    edge.node.status !== 'NOT_YET_RELEASED' &&
    edge.node.status !== 'CANCELLED'
  );

  if (sequelEdge) {
    // Recurse into the nested node (without fetching)
    extractSequelsFromMedia(sequelEdge.node, chain, visitedIds);
  }

  return chain;
}

// Get full chain of seasons recursively (Optimized)
async function fetchSequelChain(mediaId, visitedIds = new Set()) {
  if (visitedIds.has(mediaId)) return [];

  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query: MEDIA_QUERY, variables: { id: mediaId } })
    });

    const data = await response.json();
    const media = data?.data?.Media;
    if (!media) return [];

    // Extract chain from the nested response
    const chain = extractSequelsFromMedia(media, [], visitedIds);

    // Check if we need to go deeper (if chain limit reached typically 3-4)
    const lastMedia = chain[chain.length - 1];
    if (chain.length >= 3 && lastMedia.id !== mediaId && !visitedIds.has('checked_' + lastMedia.id)) {
      visitedIds.add('checked_' + lastMedia.id);
      // Try to fetch one more time from the tail
      const moreChain = await fetchSequelChain(lastMedia.id, visitedIds);
      moreChain.forEach(m => {
        if (!chain.some(ex => ex.id === m.id)) chain.push(m);
      });
    }

    return chain;

  } catch (e) {
    console.warn('Failed to fetch sequel chain part:', e);
    return [];
  }
}

// Get anime with ALL seasons structured as arcs (Recursive Version)
export async function getAnimeWithSeasons(title) {
  // First, get the starting point
  const initialQuery = `
    query ($search: String) {
      Media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title { romaji english }
        episodes
        seasonYear
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query: initialQuery, variables: { search: title } })
    });

    const data = await response.json();
    if (data.errors || !data.data.Media) throw new Error('AniList API error or not found');

    const rootMedia = data.data.Media;

    // Fetch full chain
    const fullChain = await fetchSequelChain(rootMedia.id);

    // Build seasons array
    const seasons = fullChain.map((media, index) => {
      let name = `Season ${index + 1}`;
      let displayTitle = media.title.english || media.title.romaji;

      const isSpecial = media.format === 'SPECIAL' || media.format === 'TV_SHORT' || media.format === 'MOVIE';
      const hasSeasonInfo = /Season|Part|Cour/i.test(displayTitle);

      if (isSpecial) {
        name = `Special: ${displayTitle}`;
      } else if (!hasSeasonInfo) {
        // Force context for Gemini if title is vague (e.g. "Dan Da Dan")
        name = `Season ${index + 1}: ${displayTitle} (${media.seasonYear || '?'})`;
      } else {
        name = `${displayTitle} (${media.seasonYear || '?'})`;
      }

      return {
        name: name,
        title: media.title.romaji,
        start: 1,
        episodes: media.episodes,
        id: media.id
      };
    });

    // Fix accumulators
    let acc = 0;
    seasons.forEach(s => {
      s.start = acc + 1;
      s.end = acc + (s.episodes || 0);
      acc += (s.episodes || 0);
    });

    return {
      ...rootMedia,
      seasons,
      totalEpisodes: acc
    };

  } catch (error) {
    console.error('[AniList] Get seasons failed:', error);
    return null;
  }
}

// Get TOTAL episodes across ALL seasons/sequels (Uses same logic as getAnimeWithSeasons now)
export async function searchAnimeComplete(title) {
  try {
    const result = await getAnimeWithSeasons(title);
    if (!result) return null;
    return {
      ...result,
      totalEpisodes: result.totalEpisodes
    };
  } catch (e) {
    return null;
  }
}

// Validate episode check
export async function validateEpisode(animeTitle, episode) {
  // Check manual override first
  const knownTotal = KNOWN_EPISODE_TOTALS[animeTitle];

  if (knownTotal) {
    if (parseInt(episode) > knownTotal) {
      return {
        valid: false,
        error: `${animeTitle} only has ${knownTotal} episodes`
      };
    }
    return { valid: true, totalEpisodes: knownTotal };
  }

  // Fallback to AniList query
  const anime = await searchAnimeComplete(animeTitle);

  if (!anime) {
    return { valid: false, error: `Could not find anime: ${animeTitle}` };
  }

  const totalEpisodes = anime.totalEpisodes || anime.episodes || 9999;

  if (parseInt(episode) > totalEpisodes) {
    return {
      valid: false,
      error: `${anime.title.romaji || animeTitle} only has ${totalEpisodes} episodes`
    };
  }

  return {
    valid: true,
    totalEpisodes,
    animeId: anime.id,
    title: anime.title.romaji,
    cover: anime.coverImage?.large
  };
}

// Autocomplete search
export async function searchAnimeList(query) {
  if (!query || query.length < 2) return [];

  const graphqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 20) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          title { romaji english }
          coverImage { medium }
          episodes
          format
          season
          seasonYear
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query: graphqlQuery, variables: { search: query } })
    });

    const data = await response.json();
    const results = data.data.Page.media || [];

    // Filter to remove duplicate seasons
    const seen = new Set();
    const filtered = results.filter(anime => {
      const baseTitle = anime.title.romaji
        .replace(/\s*(?:2nd|3rd|4th|5th|Season|Part|Final|S[0-9]|:\s*.*Season.*)/gi, '')
        .trim()
        .toLowerCase();

      if (seen.has(baseTitle)) {
        return false;
      }

      seen.add(baseTitle);
      return true;
    });

    return filtered.slice(0, 10);
  } catch (error) {
    console.error('[AniList] Search list failed:', error);
    return [];
  }
}

// Helper to fetch volume information for an anime by AniList ID
export async function fetchVolumeInfo(animeId) {
  const query = `
    query ($id: Int) {
      Media(id: $id) {
        id
        title { romaji }
        volumes
        chapters
      }
    }
  `;
  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { id: animeId } })
    });
    const data = await response.json();
    const media = data?.data?.Media;
    if (!media) return null;
    return { volumes: media.volumes, chapters: media.chapters, title: media.title.romaji };
  } catch (e) {
    console.warn('[AniList] fetchVolumeInfo failed:', e);
    return null;
  }
}


export async function searchAnime(title) {
  return await searchAnimeComplete(title);
}

// Fetch trending anime currently airing
export async function getTrendingAnime() {
  const query = `
    query {
      Page(page: 1, perPage: 10) {
        media(type: ANIME, sort: TRENDING_DESC, status: RELEASING, isAdult: false) {
          id
          title { romaji }
          coverImage { large }
          bannerImage
          nextAiringEpisode {
            episode
            timeUntilAiring
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    return data.data.Page.media || [];
  } catch (error) {
    console.error('[AniList] Get trending failed:', error);
    return [];
  }
}
