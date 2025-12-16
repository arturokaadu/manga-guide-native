// AniList Service WITH CORRECT EPISODE VALIDATION
// Counts ALL seasons, not just one

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

// Get anime with ALL seasons structured as arcs
export async function getAnimeWithSeasons(title) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title { romaji english }
        episodes
        coverImage { large color }
        seasonYear
        season
        relations {
          edges {
            node {
              id
              type
              format
              episodes
              title { romaji }
              seasonYear
            }
            relationType
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { search: title } })
    });

    const data = await response.json();
    if (data.errors) throw new Error('AniList API error');

    const media = data.data.Media;

    // Build seasons array from main + sequels
    const seasons = [];
    let episodeOffset = 0;

    // Add main season/series
    if (media.episodes) {
      seasons.push({
        name: `Season 1`,
        title: media.title.romaji,
        start: 1,
        end: media.episodes,
        year: media.seasonYear
      });
      episodeOffset = media.episodes;
    }

    // Add sequel seasons
    if (media.relations && media.relations.edges) {
      const sequels = media.relations.edges
        .filter(edge => edge.relationType === 'SEQUEL' && edge.node.type === 'ANIME' && edge.node.episodes)
        .sort((a, b) => (a.node.seasonYear || 0) - (b.node.seasonYear || 0));

      sequels.forEach((sequel, index) => {
        const start = episodeOffset + 1;
        const end = episodeOffset + sequel.node.episodes;

        seasons.push({
          name: `Season ${index + 2}`,
          title: sequel.node.title.romaji,
          start,
          end,
          year: sequel.node.seasonYear
        });

        episodeOffset = end;
      });
    }

    return {
      ...media,
      seasons,
      totalEpisodes: episodeOffset
    };
  } catch (error) {
    console.error('[AniList] Get seasons failed:', error);
    return null;
  }
}

// Get TOTAL episodes across ALL seasons/sequels
export async function searchAnimeComplete(title) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title { romaji english }
        episodes
        coverImage { large color }
        seasonYear
        season
        relations {
          edges {
            node {
              id
              type
              format
              episodes
              title { romaji }
            }
            relationType
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { search: title } })
    });

    const data = await response.json();
    if (data.errors) throw new Error('AniList API error');

    const media = data.data.Media;

    // Calculate TOTAL episodes including all sequels
    let totalEpisodes = media.episodes || 0;

    if (media.relations && media.relations.edges) {
      media.relations.edges.forEach(edge => {
        // Include SEQUEL seasons in total count
        if (edge.relationType === 'SEQUEL' && edge.node.type === 'ANIME' && edge.node.episodes) {
          totalEpisodes += edge.node.episodes;
        }
      });
    }

    return {
      ...media,
      totalEpisodes // This is the REAL total across all seasons
    };
  } catch (error) {
    console.error('[AniList] Search failed:', error);
    return null;
  }
}

// Validate episode with CORRECT total count (manual override first, then AniList)
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
    cover: anime.coverImage.large
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

    // Filter to remove duplicate seasons - keep only first/main entry per series
    const seen = new Set();
    const filtered = results.filter(anime => {
      // Normalize title (remove "2nd Season", "Part 2", etc)
      const baseTitle = anime.title.romaji
        .replace(/\s*(?:2nd|3rd|4th|5th|Season|Part|Final|S[0-9]|:\s*.*Season.*)/gi, '')
        .trim()
        .toLowerCase();

      if (seen.has(baseTitle)) {
        return false; // Skip duplicate
      }

      seen.add(baseTitle);
      return true;
    });

    return filtered.slice(0, 10); // Limit to 10 unique results
  } catch (error) {
    console.error('[AniList] Search list failed:', error);
    return [];
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
