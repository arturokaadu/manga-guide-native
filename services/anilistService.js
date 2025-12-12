// AniList Service WITH CORRECT EPISODE VALIDATION
// Counts ALL seasons, not just one

const ANILIST_API = 'https://graphql.anilist.co';

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

// Validate episode with CORRECT total count
export async function validateEpisode(animeTitle, episode) {
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
