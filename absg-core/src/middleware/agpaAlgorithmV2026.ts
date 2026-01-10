import { AgpaPhoto, AgpaVote } from "../entities";
import { getRepository } from "./database";

/**
 * Types pour l'algorithme V2026
 */
export interface FamilyStats {
    votes: number;
    points: number;
    rank: number;
}

export interface PhotoV2026Details {
    gueudelot: FamilyStats;
    guibert: FamilyStats;
    guyomard: FamilyStats;
    avgRank: number;
    rankMin: number;
    rankMax: number;
    calculatedAt: string;
}

type FamilyName = "gueudelot" | "guibert" | "guyomard";
const FAMILIES: FamilyName[] = ["gueudelot", "guibert", "guyomard"];

/**
 * Structure interne pour le calcul
 */
interface PhotoCalcData {
    id: number;
    categoryId: number;
    userId: number;
    title: string;
    families: {
        gueudelot: { votes: number; points: number; rank: number };
        guibert: { votes: number; points: number; rank: number };
        guyomard: { votes: number; points: number; rank: number };
    };
    avgRank: number;
    scoreV2026: number;
}

/**
 * Algorithme V2026 : Calcul des scores basé sur la moyenne des rangs par famille
 *
 * Principe :
 * 1. Pour chaque photo, calculer votes et points par famille
 * 2. Dans chaque catégorie, classer les photos par points de chaque famille
 * 3. Calculer le rang moyen des 3 familles
 * 4. Convertir en score 0-100 (100 = meilleur, 0 = dernier)
 *
 * Règles de départage des ex-aequo (pour attribution AGPA) :
 * 1. Avantage à la photo qui a un titre
 * 2. Avantage à la photo dont la catégorie a le plus de photos
 * 3. Avantage à la photo qui a reçu le plus de votes
 * 4. Avantage à la photo dont l'auteur a le plus petit palmarès sur les 3 éditions précédentes
 * 5. Tirage au sort
 *
 * Règle de vote : Seul l'auteur ne peut pas voter pour ses propres photos.
 * Les membres d'une même famille peuvent voter les uns pour les autres.
 */
export async function computeScoresV2026(ctx: any): Promise<any> {
    const repo = getRepository(AgpaVote);

    // Étape 1 : Récupérer tous les votes valides avec la famille du votant
    const votesQuery = `
        SELECT
            v.id as "voteId",
            v."photoId",
            v."userId" as "voterId",
            v.score,
            v."categoryId",
            p."userId" as "authorId",
            p."categoryId" as "photoCategoryId",
            u."rootFamily" as "voterFamily"
        FROM agpa_vote v
        INNER JOIN agpa_photo p ON p.id = v."photoId"
        INNER JOIN "user" u ON u.id = v."userId"
        WHERE v.year = $1
        AND v.score > 0
        AND p.error IS NULL
        AND v."userId" != p."userId"
    `;

    const votes = await repo.query(votesQuery, [ctx.year]);

    // Étape 2 : Récupérer toutes les photos de l'année
    const photosQuery = `
        SELECT
            p.id,
            p."categoryId",
            p."userId",
            p.title
        FROM agpa_photo p
        WHERE p.year = $1
        AND p.error IS NULL
    `;

    const photos = await repo.query(photosQuery, [ctx.year]);

    // Initialiser les données de calcul pour chaque photo
    const photoData: Map<number, PhotoCalcData> = new Map();

    for (const photo of photos) {
        photoData.set(photo.id, {
            id: photo.id,
            categoryId: photo.categoryId,
            userId: photo.userId,
            title: photo.title || "",
            families: {
                gueudelot: { votes: 0, points: 0, rank: 0 },
                guibert: { votes: 0, points: 0, rank: 0 },
                guyomard: { votes: 0, points: 0, rank: 0 }
            },
            avgRank: 0,
            scoreV2026: 0
        });
    }

    // Étape 3 : Agréger les votes par famille pour chaque photo
    for (const vote of votes) {
        const photo = photoData.get(vote.photoId);
        if (!photo) continue;

        const family = vote.voterFamily as FamilyName;
        if (!FAMILIES.includes(family)) continue;

        // Seule la catégorie du vote correspondant à la catégorie de la photo est prise en compte
        // (sauf catégorie -3 meilleur titre qui peut voter pour n'importe quelle photo)
        if (vote.categoryId !== vote.photoCategoryId && vote.categoryId !== -3) continue;

        photo.families[family].votes += 1;
        photo.families[family].points += vote.score;
    }

    // Étape 4 : Calculer les rangs par famille et par catégorie
    // Grouper les photos par catégorie
    const photosByCategory: Map<number, PhotoCalcData[]> = new Map();

    for (const photo of photoData.values()) {
        if (!photosByCategory.has(photo.categoryId)) {
            photosByCategory.set(photo.categoryId, []);
        }
        photosByCategory.get(photo.categoryId)!.push(photo);
    }

    // Pour chaque catégorie, calculer les rangs par famille
    for (const [categoryId, categoryPhotos] of photosByCategory) {
        // Ignorer les catégories spéciales pour le calcul des rangs
        if (categoryId < 0) continue;

        for (const family of FAMILIES) {
            // Vérifier si cette famille a voté dans cette catégorie
            const familyHasVotes = categoryPhotos.some(p => p.families[family].points > 0);

            if (!familyHasVotes) {
                // Option A : ignorer cette famille pour le calcul (mettre rank à 0)
                for (const photo of categoryPhotos) {
                    photo.families[family].rank = 0; // 0 signifie "non pris en compte"
                }
                continue;
            }

            // Trier les photos par points décroissants pour cette famille
            const sortedPhotos = [...categoryPhotos].sort((a, b) =>
                b.families[family].points - a.families[family].points
            );

            // Attribuer les rangs avec gestion des ex-aequo
            let currentRank = 1;
            let previousPoints = -1;
            let sameRankCount = 0;

            for (let i = 0; i < sortedPhotos.length; i++) {
                const photo = sortedPhotos[i];
                const points = photo.families[family].points;

                if (points === previousPoints) {
                    // Ex-aequo : même rang que le précédent
                    photo.families[family].rank = currentRank;
                    sameRankCount++;
                } else {
                    // Nouveau rang = rang actuel + nombre d'ex-aequo
                    currentRank = currentRank + sameRankCount;
                    photo.families[family].rank = currentRank;
                    sameRankCount = 1;
                    previousPoints = points;
                }
            }
        }
    }

    // Étape 5 : Calculer le rang moyen pour chaque photo
    for (const [categoryId, categoryPhotos] of photosByCategory) {
        if (categoryId < 0) continue;

        for (const photo of categoryPhotos) {
            const ranksToAverage: number[] = [];

            for (const family of FAMILIES) {
                // rank = 0 signifie que la famille n'a pas voté, on l'ignore
                if (photo.families[family].rank > 0) {
                    ranksToAverage.push(photo.families[family].rank);
                }
            }

            if (ranksToAverage.length > 0) {
                photo.avgRank = ranksToAverage.reduce((a, b) => a + b, 0) / ranksToAverage.length;
            } else {
                // Aucune famille n'a voté pour cette catégorie (cas très rare)
                photo.avgRank = categoryPhotos.length; // Dernier rang par défaut
            }
        }
    }

    // Étape 6 : Convertir le rang moyen en score 0-100 par catégorie et calculer le classement par catégorie
    for (const [categoryId, categoryPhotos] of photosByCategory) {
        if (categoryId < 0) continue;

        // Trouver le rang moyen min et max de la catégorie
        const avgRanks = categoryPhotos.map(p => p.avgRank);
        const rankMin = Math.min(...avgRanks);
        const rankMax = Math.max(...avgRanks);

        for (const photo of categoryPhotos) {
            if (rankMax === rankMin) {
                // Toutes les photos ont le même rang moyen
                photo.scoreV2026 = 100;
            } else {
                // Score = 100 × (rangMax - rangMoyen) / (rangMax - rangMin)
                photo.scoreV2026 = Math.round(100 * (rankMax - photo.avgRank) / (rankMax - rankMin));
            }
        }

        // Trier les photos de la catégorie par score décroissant pour calculer le rang dans la catégorie
        const sortedCategoryPhotos = [...categoryPhotos].sort((a, b) => {
            // Tri par score décroissant
            if (b.scoreV2026 !== a.scoreV2026) {
                return b.scoreV2026 - a.scoreV2026;
            }
            // Départage par rang moyen croissant
            if (a.avgRank !== b.avgRank) {
                return a.avgRank - b.avgRank;
            }
            // Règle 1 : Avantage à la photo qui a un titre
            const hasValidTitleA = a.title && a.title.trim() !== "" && a.title !== "(sans titre)" ? 1 : 0;
            const hasValidTitleB = b.title && b.title.trim() !== "" && b.title !== "(sans titre)" ? 1 : 0;
            if (hasValidTitleB !== hasValidTitleA) {
                return hasValidTitleB - hasValidTitleA;
            }
            // Règle 3 : Avantage à la photo qui a reçu le plus de votes
            const totalVotesA = FAMILIES.reduce((sum, f) => sum + a.families[f].votes, 0);
            const totalVotesB = FAMILIES.reduce((sum, f) => sum + b.families[f].votes, 0);
            if (totalVotesB !== totalVotesA) {
                return totalVotesB - totalVotesA;
            }
            // Tirage au sort
            return Math.random() - 0.5;
        });

        // Attribuer le rang dans la catégorie à chaque photo
        const categoryRankMap: Map<number, number> = new Map();
        for (let i = 0; i < sortedCategoryPhotos.length; i++) {
            categoryRankMap.set(sortedCategoryPhotos[i].id, i + 1);
        }

        // Stocker les détails dans le contexte
        for (const photo of categoryPhotos) {
            if (ctx.photos && ctx.photos[photo.id]) {
                ctx.photos[photo.id].scoreV2026 = photo.scoreV2026;
                ctx.photos[photo.id].scoreDetails = ctx.photos[photo.id].scoreDetails || {};
                ctx.photos[photo.id].scoreDetails.v2026 = {
                    gueudelot: { ...photo.families.gueudelot },
                    guibert: { ...photo.families.guibert },
                    guyomard: { ...photo.families.guyomard },
                    avgRank: Math.round(photo.avgRank * 100) / 100, // Arrondir à 2 décimales
                    rankMin: Math.round(rankMin * 100) / 100,
                    rankMax: Math.round(rankMax * 100) / 100,
                    rankInCategory: categoryRankMap.get(photo.id), // Classement dans la catégorie
                    calculatedAt: new Date().toISOString()
                };
            }
        }
    }

    // Étape 7 : Récupérer le palmarès des auteurs sur les 3 éditions précédentes
    const palmaresQuery = `
        SELECT a."userId", COUNT(*) as "awardCount",
            SUM(CASE WHEN a.award = 'diamond' THEN 100
                     WHEN a.award = 'gold' THEN 50
                     WHEN a.award = 'sylver' THEN 30
                     WHEN a.award = 'bronze' THEN 20
                     WHEN a.award = 'nominated' THEN 10
                     ELSE 0 END) as "palmaresPoints"
        FROM agpa_award a
        WHERE a.year >= $1 AND a.year < $2
        GROUP BY a."userId"
    `;
    const palmaresData = await repo.query(palmaresQuery, [ctx.year - 3, ctx.year]);
    const authorPalmares: Map<number, number> = new Map();
    for (const row of palmaresData) {
        authorPalmares.set(row.userId, parseInt(row.palmaresPoints) || 0);
    }

    // Calculer le nombre de photos par catégorie
    const photosCountByCategory: Map<number, number> = new Map();
    for (const [categoryId, categoryPhotos] of photosByCategory) {
        if (categoryId > 0) {
            photosCountByCategory.set(categoryId, categoryPhotos.length);
        }
    }

    // Étape 8 : Calculer le classement global V2026 (toutes catégories confondues)
    const allPhotosWithScores = Array.from(photoData.values())
        .filter(p => p.categoryId > 0) // Exclure catégories spéciales
        .sort((a, b) => {
            // Tri par score décroissant
            if (b.scoreV2026 !== a.scoreV2026) {
                return b.scoreV2026 - a.scoreV2026;
            }

            // Départage par rang moyen croissant (meilleur rang = plus petit)
            if (a.avgRank !== b.avgRank) {
                return a.avgRank - b.avgRank;
            }

            // Règle 1 : Avantage à la photo qui a un titre
            const hasValidTitleA = a.title && a.title.trim() !== "" && a.title !== "(sans titre)" ? 1 : 0;
            const hasValidTitleB = b.title && b.title.trim() !== "" && b.title !== "(sans titre)" ? 1 : 0;
            if (hasValidTitleB !== hasValidTitleA) {
                return hasValidTitleB - hasValidTitleA;
            }

            // Règle 2 : Avantage à la photo dont la catégorie a le plus de photos
            const catPhotosA = photosCountByCategory.get(a.categoryId) || 0;
            const catPhotosB = photosCountByCategory.get(b.categoryId) || 0;
            if (catPhotosB !== catPhotosA) {
                return catPhotosB - catPhotosA;
            }

            // Règle 3 : Avantage à la photo qui a reçu le plus de votes
            const totalVotesA = FAMILIES.reduce((sum, f) => sum + a.families[f].votes, 0);
            const totalVotesB = FAMILIES.reduce((sum, f) => sum + b.families[f].votes, 0);
            if (totalVotesB !== totalVotesA) {
                return totalVotesB - totalVotesA;
            }

            // Règle 4 : Avantage à l'auteur avec le plus petit palmarès sur les 3 éditions précédentes
            const palmaresA = authorPalmares.get(a.userId) || 0;
            const palmaresB = authorPalmares.get(b.userId) || 0;
            if (palmaresA !== palmaresB) {
                return palmaresA - palmaresB; // Plus petit palmarès gagne
            }

            // Règle 5 : Tirage au sort
            return Math.random() - 0.5;
        });

    // Attribuer les rangs globaux V2026
    let globalRank = 1;
    for (let i = 0; i < allPhotosWithScores.length; i++) {
        const photo = allPhotosWithScores[i];
        if (ctx.photos && ctx.photos[photo.id]) {
            ctx.photos[photo.id].rankingV2026 = globalRank;
        }
        globalRank++;
    }

    return ctx;
}

/**
 * Sauvegarde les scores V2026 en base de données
 */
export async function saveScoresV2026(ctx: any): Promise<void> {
    const repo = getRepository(AgpaPhoto);

    for (const photoId in ctx.photos) {
        const photo = ctx.photos[photoId];

        if (photo.scoreV2026 !== undefined) {
            await repo.query(
                `UPDATE agpa_photo
                SET "scoreV2026" = $1,
                    "rankingV2026" = $2,
                    "scoreDetails" = $3
                WHERE id = $4`,
                [
                    photo.scoreV2026,
                    photo.rankingV2026,
                    JSON.stringify(photo.scoreDetails),
                    photo.id
                ]
            );
        }
    }
}
