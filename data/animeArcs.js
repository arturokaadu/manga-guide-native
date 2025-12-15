// Anime Arcs Data - Organizes long-running anime by narrative arcs
// This allows users to select arc/season instead of navigating through hundreds of episodes

export const ANIME_ARCS = {
    'one piece': {
        hasArcs: true,
        arcs: [
            { name: 'East Blue Saga', start: 1, end: 61 },
            { name: 'Arabasta Saga', start: 62, end: 135 },
            { name: 'Sky Island Saga', start: 136, end: 206 },
            { name: 'Water 7 Saga', start: 207, end: 325 },
            { name: 'Thriller Bark Saga', start: 326, end: 384 },
            { name: 'Summit War Saga', start: 385, end: 516 },
            { name: 'Fishman Island Saga', start: 517, end: 574 },
            { name: 'Dressrosa Saga', start: 575, end: 746 },
            { name: 'Whole Cake Island Saga', start: 747, end: 877 },
            { name: 'Wano Country Saga', start: 878, end: 1085 },
            { name: 'Final Saga', start: 1086, end: null } // null = ongoing
        ]
    },
    'naruto': {
        hasArcs: true,
        arcs: [
            { name: 'Introduction Arc', start: 1, end: 5 },
            { name: 'Land of Waves Arc', start: 6, end: 19 },
            { name: 'Chunin Exams Arc', start: 20, end: 67 },
            { name: 'Konoha Crush Arc', start: 68, end: 80 },
            { name: 'Search for Tsunade Arc', start: 81, end: 106 },
            { name: 'Sasuke Recovery Mission Arc', start: 107, end: 135 },
            { name: 'Filler Arc', start: 136, end: 220 }
        ]
    },
    'naruto shippuden': {
        hasArcs: true,
        arcs: [
            { name: 'Kazekage Rescue Arc', start: 1, end: 32 },
            { name: 'Tenchi Bridge Arc', start: 33, end: 53 },
            { name: 'Akatsuki Suppression Arc', start: 54, end: 71 },
            { name: 'Three-Tails Arc', start: 72, end: 90 },
            { name: 'Itachi Pursuit Arc', start: 91, end: 112 },
            { name: 'Pain Assault Arc', start: 152, end: 175 },
            { name: 'Five Kage Summit Arc', start: 197, end: 214 },
            { name: 'Fourth Shinobi World War Arc', start: 261, end: 469 },
            { name: 'Kaguya Otsutsuki Arc', start: 470, end: 479 },
            { name: 'Sasuke Recovery Arc', start: 484, end: 500 }
        ]
    },
    'bleach': {
        hasArcs: true,
        arcs: [
            { name: 'Agent of the Shinigami Arc', start: 1, end: 20 },
            { name: 'Soul Society: The Sneak Entry Arc', start: 21, end: 41 },
            { name: 'Soul Society: The Rescue Arc', start: 42, end: 63 },
            { name: 'Bount Arc (Filler)', start: 64, end: 109 },
            { name: 'Arrancar Arc', start: 110, end: 167 },
            { name: 'Hueco Mundo Arc', start: 168, end: 189 },
            { name: 'Fake Karakura Town Arc', start: 190, end: 220 },
            { name: 'Zanpakuto Arc (Filler)', start: 230, end: 265 },
            { name: 'Fullbring Arc', start: 343, end: 366 },
            { name: 'Thousand-Year Blood War Arc', start: 367, end: null }
        ]
    },
    'dragon ball z': {
        hasArcs: true,
        arcs: [
            { name: 'Saiyan Saga', start: 1, end: 35 },
            { name: 'Namek Saga', start: 36, end: 67 },
            { name: 'Captain Ginyu Saga', start: 68, end: 74 },
            { name: 'Frieza Saga', start: 75, end: 107 },
            { name: 'Garlic Jr. Saga (Filler)', start: 108, end: 117 },
            { name: 'Trunks Saga', start: 118, end: 125 },
            { name: 'Android Saga', start: 126, end: 139 },
            { name: 'Imperfect Cell Saga', start: 140, end: 152 },
            { name: 'Perfect Cell Saga', start: 153, end: 165 },
            { name: 'Cell Games Saga', start: 166, end: 194 },
            { name: 'Great Saiyaman Saga', start: 195, end: 209 },
            { name: 'World Tournament Saga', start: 210, end: 219 },
            { name: 'Babidi Saga', start: 220, end: 231 },
            { name: 'Majin Buu Saga', start: 232, end: 253 },
            { name: 'Fusion Saga', start: 254, end: 275 },
            { name: 'Kid Buu Saga', start: 276, end: 291 }
        ]
    },
    'fairy tail': {
        hasArcs: true,
        arcs: [
            { name: 'Macao Arc', start: 1, end: 2 },
            { name: 'Daybreak Arc', start: 3, end: 9 },
            { name: 'Phantom Lord Arc', start: 10, end: 22 },
            { name: 'Tower of Heaven Arc', start: 33, end: 44 },
            { name: 'Fighting Festival Arc', start: 45, end: 52 },
            { name: 'Oración Seis Arc', start: 53, end: 68 },
            { name: 'Nirvana Arc', start: 69, end: 74 },
            { name: 'Edolas Arc', start: 76, end: 95 },
            { name: 'Tenrou Island Arc', start: 96, end: 122 },
            { name: 'X791 Arc', start: 123, end: 150 },
            { name: 'Grand Magic Games Arc', start: 151, end: 187 },
            { name: 'Tartaros Arc', start: 206, end: 265 },
            { name: 'Avatar Arc', start: 266, end: 277 },
            { name: 'Alvarez Empire Arc', start: 278, end: 328 }
        ]
    },
    'hunter x hunter': {
        hasArcs: true,
        arcs: [
            { name: 'Hunter Exam Arc', start: 1, end: 21 },
            { name: 'Zoldyck Family Arc', start: 22, end: 26 },
            { name: 'Heavens Arena Arc', start: 27, end: 36 },
            { name: 'Yorknew City Arc', start: 37, end: 58 },
            { name: 'Greed Island Arc', start: 59, end: 75 },
            { name: 'Chimera Ant Arc', start: 76, end: 136 },
            { name: '13th Hunter Chairman Election Arc', start: 137, end: 148 }
        ]
    },
    'gintama': {
        hasArcs: true,
        arcs: [
            { name: 'Series 1', start: 1, end: 201 },
            { name: 'Series 2', start: 202, end: 252 },
            { name: 'Series 3 (Enchousen)', start: 253, end: 265 },
            { name: 'Series 4', start: 266, end: 316 },
            { name: 'Series 5 (Porori-hen)', start: 317, end: 328 },
            { name: 'Series 6 (Shirogane no Tamashii-hen)', start: 329, end: 367 }
        ]
    }
};

// Helper function to get arcs for a specific anime
export function getArcsForAnime(animeTitle) {
    const normalized = animeTitle.toLowerCase().trim();

    for (const [key, data] of Object.entries(ANIME_ARCS)) {
        if (normalized.includes(key)) {
            return data;
        }
    }

    return null; // No arcs defined for this anime
}

// Helper function to get episode range for an arc
export function getEpisodeRange(animeTitle, arcName) {
    const arcsData = getArcsForAnime(animeTitle);

    if (!arcsData || !arcsData.hasArcs) {
        return null;
    }

    const arc = arcsData.arcs.find(a => a.name === arcName);
    return arc ? { start: arc.start, end: arc.end } : null;
}

// Helper function to determine which arc an episode belongs to
export function getArcForEpisode(animeTitle, episode) {
    const arcsData = getArcsForAnime(animeTitle);

    if (!arcsData || !arcsData.hasArcs) {
        return null;
    }

    const episodeNum = parseInt(episode);
    const arc = arcsData.arcs.find(a => {
        if (a.end === null) {
            // Ongoing arc
            return episodeNum >= a.start;
        }
        return episodeNum >= a.start && episodeNum <= a.end;
    });

    return arc ? arc.name : null;
}
