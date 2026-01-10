import { AgpaPhoto, AgpaVote, AgpaAwardType } from "../entities";
import { palmaresPoints } from "./agpaPalmaresHelper";
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

// =============================================================================
// ATTRIBUTION DES AGPA (V2026)
// Ces méthodes utilisent scoreV2026 au lieu de gscore (V2010)
// =============================================================================

/**
 * Attribution des AGPA (or, argent et bronze) pour une liste de photos donnée
 * La liste des photos doit déjà être triée et ordonnée
 * Cette première passe ne traite pas les AGPA de diamant
 * @param pIds liste des photos
 * @param catId la catégorie concernée
 * @param ctx le context de donnée à mettre à jours
 */
function deliverAwardsPhotosV2026(pIds: number[], catId: number, ctx: any) {
    // On vérifie si tout est correctement initialisé
    for (let idx = 0; idx < 4; idx++) {
        if (ctx.photos[pIds[idx]] && !ctx.photos[pIds[idx]].awards) {
            ctx.photos[pIds[idx]].awards = [];
        }
    }

    // On attribut simplement les agpa or, argent et bronze aux 1ere, deuxième et troisième photos
    // Test du double agpa d'or : même auteur et même score
    if (
        ctx.photos[pIds[0]] && ctx.photos[pIds[1]] &&
        ctx.photos[pIds[0]].userId === ctx.photos[pIds[1]].userId &&
        ctx.photos[pIds[0]].scoreV2026 === ctx.photos[pIds[1]].scoreV2026
    ) {
        if (ctx.photos[pIds[0]]) ctx.photos[pIds[0]].awards.push({ award: AgpaAwardType.gold, categoryId: catId });
        if (ctx.photos[pIds[1]]) ctx.photos[pIds[1]].awards.push({ award: AgpaAwardType.gold, categoryId: catId });
        if (ctx.photos[pIds[2]]) ctx.photos[pIds[2]].awards.push({ award: AgpaAwardType.sylver, categoryId: catId });
        if (ctx.photos[pIds[3]]) ctx.photos[pIds[3]].awards.push({ award: AgpaAwardType.bronze, categoryId: catId });
    } else {
        if (ctx.photos[pIds[0]]) ctx.photos[pIds[0]].awards.push({ award: AgpaAwardType.gold, categoryId: catId });
        if (ctx.photos[pIds[1]]) ctx.photos[pIds[1]].awards.push({ award: AgpaAwardType.sylver, categoryId: catId });
        if (ctx.photos[pIds[2]]) ctx.photos[pIds[2]].awards.push({ award: AgpaAwardType.bronze, categoryId: catId });
        if (ctx.photos[pIds[3]]) ctx.photos[pIds[3]].awards.push({ award: AgpaAwardType.nominated, categoryId: catId });
    }
    // On met à jour le palmarès (de l'édition) des auteurs
    for (let idx = 0; idx < 4; idx++) {
        const p = ctx.photos[pIds[idx]];
        if (p && ctx.users[p.userId]) {
            const award = p.awards.find(a => a.categoryId === catId);
            if (award) {
                ctx.users[p.userId].palmares += palmaresPoints(award.award);
            }
        }
    }
}

/**
 * Attribution des AGPA (or, argent et bronze) pour une liste de photographes
 * La liste des photographes doit déjà être triée et ordonnée
 * @param pIds liste des photographes
 * @param ctx le context de donnée à mettre à jours
 */
function deliverAwardsPhotographesV2026(pIds: number[], ctx: any) {
    // On attribut simplement les agpa or, argent et bronze aux 1er, deuxième et troisième photographes
    if (ctx.users[pIds[0]]) ctx.users[pIds[0]].award = AgpaAwardType.gold;
    if (ctx.users[pIds[1]]) ctx.users[pIds[1]].award = AgpaAwardType.sylver;
    if (ctx.users[pIds[2]]) ctx.users[pIds[2]].award = AgpaAwardType.bronze;
    // On met à jour le palmarès (de l'édition) des auteurs
    for (let idx = 0; idx < 3; idx++) {
        if (ctx.users[pIds[idx]]) {
            ctx.users[pIds[idx]].palmares += palmaresPoints(ctx.users[pIds[idx]].award);
        }
    }
}

/**
 * Classe les photos pour toutes les catégories afin d'attribuer les AGPA et établie le palmares
 * Version V2026 : utilise scoreV2026 au lieu de gscore
 * @param ctx les données retournées lors du calcul des scores
 *
 * @return le contexte des agpa avec les awards obtenu pour chaque photos et utilisateurs
 */
export async function p4AgpaAttributionV2026(ctx: any) {
    const repo = getRepository(AgpaPhoto);
    const userData = {};
    const catNumber = Object.values(ctx.categories).filter(c => (c as any).id > 0).length;

    // Intialisation et calcul de différentes infos pour chaque participants de l'édition
    // On trie d'abord les photos par scoreV2026 décroissant
    const sortedPhotoIds = Object.keys(ctx.photos)
        .filter(pId => ctx.photos[pId].categoryId > 0)
        .sort((a, b) => (ctx.photos[b].scoreV2026 || 0) - (ctx.photos[a].scoreV2026 || 0));

    for (const pId of sortedPhotoIds) {
        const p = ctx.photos[pId];
        if (!(p.userId in userData)) {
            userData[p.userId] = {
                id: p.userId,
                username: p.username,
                photos: [],
                scoreOf8: 0,    // Score V2026 obtenu par les 8 meilleurs photos
                scoreOf4: 0,    // Score V2026 obtenu par les 4 meilleurs photos
                average: 0,     // Score moyen V2026
                lower: Infinity, // Plus petit score V2026
                formerPalmares: 0,
                palmares: 0,
                age: 0
            };
        }
        if (userData[p.userId].photos.length < catNumber) {
            userData[p.userId].photos.push(p);
            userData[p.userId].scoreOf8 += p.scoreV2026 || 0;

            if (userData[p.userId].photos.length <= 4) {
                userData[p.userId].scoreOf4 += p.scoreV2026 || 0;
            }
        }
    }

    // Calcul des moyennes et scores minimaux
    for (const uId in userData) {
        const uPhotos = sortedPhotoIds
            .map(pId => ctx.photos[pId])
            .filter(p => +p.userId === +uId);
        const count = uPhotos.length;
        if (count > 0) {
            userData[uId].lower = uPhotos[count - 1].scoreV2026 || 0;
            userData[uId].average = uPhotos.reduce((sum, e) => (e.scoreV2026 || 0) + sum, 0) / count;
        }
    }

    // On récupère l'age des utilisateurs qui ont participé à l'édition
    let sql = `SELECT DISTINCT (p."userId"), a."dateOfBirth"
        FROM agpa_photo p
        INNER JOIN "user" u ON p."userId" = u.id
        INNER JOIN person a ON u."personId" = a.id
        WHERE p.year=${ctx.year}`;

    let raw = await repo.query(sql);
    for (const r of raw) {
        if (userData[r.userId]) {
            userData[r.userId].age = ctx.year - new Date(r.dateOfBirth).getFullYear();
        }
    }

    ctx.users = userData;

    // Calcul des palmares des editions précédentes
    sql = `SELECT * FROM agpa_award WHERE year < ${ctx.year} ORDER BY "userId" ASC, year ASC`;
    raw = await repo.query(sql);
    for (const p of raw) {
        if (p.userId in ctx.users) {
            ctx.users[p.userId].formerPalmares += palmaresPoints(p.award);
        }
    }

    // Définition des méthodes pour trier et départager les ex-aequos
    // Version V2026 : utilise scoreV2026 et les règles de départage V2026
    function sortPhotosV2026(aId, bId) {
        const a = ctx.photos[aId];
        const b = ctx.photos[bId];

        // Tri par scoreV2026 décroissant
        let res = (b.scoreV2026 || 0) - (a.scoreV2026 || 0);
        if (res !== 0) return res;

        // Règle 1 : Avantage à la photo qui a un titre
        const hasValidTitleA = a.title && a.title.trim() !== "" && a.title !== "(sans titre)" ? 1 : 0;
        const hasValidTitleB = b.title && b.title.trim() !== "" && b.title !== "(sans titre)" ? 1 : 0;
        res = hasValidTitleB - hasValidTitleA;
        if (res !== 0) return res;

        // Règle 2 : Avantage à la photo de la catégorie avec le plus de photos
        res = (ctx.categories[b.categoryId]?.totalPhotos || 0) - (ctx.categories[a.categoryId]?.totalPhotos || 0);
        if (res !== 0) return res;

        // Règle 3 : Avantage à la photo qui a reçu le plus de votes
        res = (b.votes || 0) - (a.votes || 0);
        if (res !== 0) return res;

        // Règle 4 : Avantage au photographe ayant le moins bon palmarès sur les éditions précédentes
        res = (ctx.users[a.userId]?.formerPalmares || 0) - (ctx.users[b.userId]?.formerPalmares || 0);
        if (res !== 0) return res;

        // Règle 5 : Tirage au sort
        return Math.random() - 0.5;
    }

    function sortPhotographesV2026(a, b) {
        // Tri par scoreOf8 décroissant (somme des 8 meilleures photos V2026)
        let res = (b.scoreOf8 || 0) - (a.scoreOf8 || 0);
        if (res !== 0) return res;

        // Si exaequo, avantage à la meilleure moyenne V2026
        res = (b.average || 0) - (a.average || 0);
        if (res !== 0) return res;

        // Si exaequo, avantage à celui dont la plus mauvaise photo a le meilleur score
        res = (b.lower || 0) - (a.lower || 0);
        if (res !== 0) return res;

        // Si exaequo, avantage au meilleur palmarès de l'édition en cours
        res = (ctx.users[b.id]?.palmares || 0) - (ctx.users[a.id]?.palmares || 0);
        if (res !== 0) return res;

        // Si exaequo, avantage au moins bon palmarès cumulé
        res = (ctx.users[a.id]?.formerPalmares || 0) - (ctx.users[b.id]?.formerPalmares || 0);
        if (res !== 0) return res;

        // Tirage au sort
        return Math.random() - 0.5;
    }

    function sortTitlesV2026(aId, bId) {
        const a = ctx.photos[aId];
        const b = ctx.photos[bId];

        // Tri par nombre de votes titre décroissant
        let res = (b.votesTitle || 0) - (a.votesTitle || 0);
        if (res !== 0) return res;

        // Si exaequo, avantage au plus petit score V2026 (pour diversifier les lauréats)
        res = (b.scoreV2026 || 0) - (a.scoreV2026 || 0);
        if (res !== 0) return res;

        // Si exaequo, avantage au moins bon palmarès de l'édition
        res = (ctx.users[a.userId]?.palmares || 0) - (ctx.users[b.userId]?.palmares || 0);
        if (res !== 0) return res;

        // Si exaequo, avantage au moins bon palmarès cumulé
        res = (ctx.users[a.userId]?.formerPalmares || 0) - (ctx.users[b.userId]?.formerPalmares || 0);
        if (res !== 0) return res;

        // Tirage au sort
        return Math.random() - 0.5;
    }

    // Ordre des photos par scoreV2026 décroissant
    ctx.photosOrderV2026 = sortedPhotoIds.sort(sortPhotosV2026);

    // Palmarès des catégories "simples"
    for (const catId in ctx.categories) {
        if (+catId < 0) continue;

        ctx.categories[catId].photosV2026 = ctx.photosOrderV2026
            .filter(pId => ctx.photos[pId].categoryId == catId)
            .sort(sortPhotosV2026);
        deliverAwardsPhotosV2026(ctx.categories[catId].photosV2026, +catId, ctx);
    }

    // Palmarès "Meilleur titre" (à partir de 2011)
    if (ctx.categories[-3]) {
        ctx.categories[-3].photosV2026 = ctx.photosOrderV2026
            .filter(pId => ctx.photos[pId].votesTitle > 0)
            .sort(sortTitlesV2026);
        if (ctx.categories[-3].photosV2026.length > 0) {
            deliverAwardsPhotosV2026(ctx.categories[-3].photosV2026, -3, ctx);
        }
    }

    // Palmarès "Meilleure photographie"
    ctx.photosOrderV2026.sort(sortPhotosV2026);
    deliverAwardsPhotosV2026(ctx.photosOrderV2026, -2, ctx);

    // Palmarès "Meilleur photographe"
    ctx.usersOrderV2026 = Object.values(ctx.users)
        .sort(sortPhotographesV2026)
        .map(u => (u as any).id);
    deliverAwardsPhotographesV2026(ctx.usersOrderV2026, ctx);

    return ctx;
}

/**
 * Modifie les AGPA d'or en AGPA de diamant si les conditions sont réunis.
 * Version V2026 : utilise scoreV2026 avec seuils adaptés (score sur 100)
 * @param ctx les données retournées lors de l'attribution
 *
 * @return le contexte mis à jour
 */
export async function p4DiamondAttributionV2026(ctx: any) {
    // Pour chaque catégorie
    if (!ctx.categories || !Array.isArray(ctx.categories)) {
        // ctx.categories peut être un objet, on le convertit en array
        const categoriesArray = Object.values(ctx.categories);
        for (const cat of categoriesArray) {
            await processCategoryDiamondV2026(cat as any, ctx);
        }
    } else {
        for (const cat of ctx.categories) {
            await processCategoryDiamondV2026(cat, ctx);
        }
    }

    // Recompte des palmarès
    for (const userId in ctx.users) {
        ctx.users[userId].awards = [];
        ctx.users[userId].palmares = 0;

        if (ctx.users[userId].award) {
            ctx.users[userId].awards.push({ categoryId: -1, award: ctx.users[userId].award });
            ctx.users[userId].palmares += palmaresPoints(ctx.users[userId].award);
        }
    }

    for (const pId in ctx.photos) {
        const photo = ctx.photos[pId];
        if (Array.isArray(photo.awards)) {
            for (const a of photo.awards) {
                ctx.users[photo.userId].awards.push(a);
                ctx.users[photo.userId].palmares += palmaresPoints(a.award);
            }
        }
    }

    return ctx;
}

async function processCategoryDiamondV2026(cat: any, ctx: any) {
    const photosKey = cat.photosV2026 ? "photosV2026" : "photos";
    if (!cat[photosKey] || cat[photosKey].length <= 2) return;

    const p1 = ctx.photos[cat[photosKey][0]];
    const p2 = ctx.photos[cat[photosKey][1]];

    if (!p1 || !p2) return;

    if (cat.id > 0) {
        // Catégorie "simple"
        // Pour V2026: Diamant si la photo a obtenu le rang 1 chez les 3 familles
        const details = p1.scoreDetails?.v2026;
        if (details) {
            const hasRank1AllFamilies =
                details.gueudelot?.rank === 1 &&
                details.guibert?.rank === 1 &&
                details.guyomard?.rank === 1;

            if (hasRank1AllFamilies) {
                const idxAward = p1.awards?.findIndex(a => a.categoryId === cat.id);
                if (idxAward !== undefined && idxAward >= 0) {
                    p1.awards[idxAward].award = AgpaAwardType.diamond;
                }
            }
        }
    } else if (cat.id === -3) {
        // Catégorie "Meilleur titre"
        if ((p1.votesTitle || 0) > 2 * (p2.votesTitle || 1)) {
            const idxAward = p1.awards?.findIndex(a => a.categoryId === cat.id);
            if (idxAward !== undefined && idxAward >= 0) {
                p1.awards[idxAward].award = AgpaAwardType.diamond;
            }
        }
    } else if (cat.id === -2) {
        // Catégorie "Meilleure photo"
        let isDiamond = p1.awards?.find(a => a.categoryId > 0);
        isDiamond = isDiamond ? isDiamond.award === AgpaAwardType.diamond : false;

        const maxJudgesNumber = ctx.categories[p1.categoryId]?.votes?.filter(j => j.age >= 12).length || 0;
        if (isDiamond && (p1.votes || 0) >= maxJudgesNumber - 1) {
            const idxAward = p1.awards?.findIndex(a => a.categoryId === cat.id);
            if (idxAward !== undefined && idxAward >= 0) {
                p1.awards[idxAward].award = AgpaAwardType.diamond;
            }
        }
    } else if (cat.id === -1) {
        // Catégorie "Meilleur photographe"
        const cat2Photos = ctx.categories[-2]?.photosV2026 || ctx.categories[-2]?.photos || [];
        if (cat2Photos.length >= 3) {
            const p3 = ctx.photos[cat2Photos[2]];
            if (p3) {
                const author = p1.userId === p2.userId && p2.userId === p3.userId;
                // Pour V2026: score sur 100, donc total >= 240 (équiv 100000 pour V2010)
                const total = (p1.scoreV2026 || 0) + (p2.scoreV2026 || 0) + (p3.scoreV2026 || 0);
                const usersOrder = ctx.usersOrderV2026 || ctx.usersOrder || [];
                if (author && p1.userId === usersOrder[0] && total >= 240) {
                    ctx.users[p1.userId].award = AgpaAwardType.diamond;
                }
            }
        }
    }
}

/**
 * Attribue les agpa d'honneur aux enfants de moins de 12 ans qui ont participés.
 * @param ctx les données retournées lors de l'attribution des diamants
 */
export async function p4HonorAttributionV2026(ctx: any) {
    if (!ctx.users) {
        return ctx;
    }
    for (const uid in ctx.users) {
        const u = ctx.users[uid];
        if (u.age < 12 && (!Array.isArray(u.awards) || u.awards.length === 0)) {
            u.awards = [
                {
                    categoryId: u.photos[0]?.categoryId,
                    userId: u.id,
                    photoId: u.photos[0]?.id,
                    award: AgpaAwardType.honor
                }
            ];
        }
    }
    return ctx;
}

/**
 * Calcul les statistiques affichées dans la section "monitoring" de l'édition des agpa
 * Version V2026 (identique à V2010 car ne dépend pas du score)
 * @param ctx les données "contexte" de l'édition des AGPA
 */
export async function monitoringStatsV2026(ctx: any) {
    const repo = getRepository(AgpaPhoto);

    // On rajoute la notion de famille aux utilisateurs
    const users = await repo.query('SELECT * from "user"');
    for (const u of users) {
        if (!ctx.users[u.id]) {
            continue;
        }
        ctx.users[u.id].rootFamily = u.rootFamily;
    }

    // Répartitions des photos
    const total = {
        catId: 0,
        name: "Total",
        total: 0,
        totalByAge: {
            adults: 0,
            childdren: 0
        },
        totalByFamilies: {
            gueudelot: 0,
            guibert: 0,
            guyomard: 0
        }
    };
    ctx.photosStats = ctx.categoriesOrders.map(e => ({
        catId: e,
        name: ctx.categories[e].title,
        total: 0,
        totalByAge: {
            adults: 0,
            childdren: 0
        },
        totalByFamilies: {
            gueudelot: 0,
            guibert: 0,
            guyomard: 0
        }
    }));
    for (const pId of Object.keys(ctx.photos)) {
        const p = ctx.photos[pId];
        const cat = ctx.photosStats.find(c => c.catId === p.categoryId);
        if (!cat) continue;
        cat.total += 1;
        total.total += 1;
        cat.totalByAge[ctx.users[p.userId]?.age < 12 ? "childdren" : "adults"] += 1;
        total.totalByAge[ctx.users[p.userId]?.age < 12 ? "childdren" : "adults"] += 1;
        cat.totalByFamilies[ctx.users[p.userId]?.rootFamily] += 1;
        total.totalByFamilies[ctx.users[p.userId]?.rootFamily] += 1;
    }
    ctx.photosStats.push(total);

    // Répartition des votes (qui vote pour qui)
    const sql = `SELECT u1.username as "from", u2.username as "to", SUM(v.score)
        FROM public.agpa_vote v
        INNER JOIN "user" u1 ON v."userId" = u1.id
        INNER JOIN "agpa_photo" p ON p.id = v."photoId"
        INNER JOIN "user" u2 ON p."userId" = u2.id
        WHERE v.year = ${ctx.year} AND v.score > 0
        GROUP BY "from", "to"`;

    ctx.votesStats = await repo.query(sql);
    ctx.votesStats = ctx.votesStats.map(r => [r.from, r.to, +r.sum]);

    return ctx;
}
