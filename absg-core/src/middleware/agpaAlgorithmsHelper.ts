import { AgpaPhoto, AgpaVote, AgpaAwardType } from "../entities";
import { palmaresPoints } from "./agpaPalmaresHelper";
import { getRepository } from "typeorm";

/**
 * Attribution des AGPA (or, argent et bronze) pour une liste de photos donnée
 * La liste des photos doit déjà être triée et ordonnée
 * Cette première passe ne traite pas les AGPA de diamant
 * @param pIds liste des photos
 * @param catId la catégorie concernée
 * @param ctx le context de donnée à mettre à jours
 */
function deliverAwardsPhotos(pIds: number[], catId: number, ctx: any) {
    // On vérifie si tout est correctement initialisé
    for (let idx = 0; idx < 4; idx++) {
        if (!ctx.photos[pIds[idx]].awards) {
            ctx.photos[pIds[idx]].awards = [];
        }
    }

    // On attribut simplement les agpa or, diamant et bronze aux 1ere, deuxième et troisième photos
    if (
        ctx.photos[pIds[0]].userId === ctx.photos[pIds[1]].userId &&
        ctx.photos[pIds[0]].score === ctx.photos[pIds[1]].score
    ) {
        // Test du double agpa d'or
        ctx.photos[pIds[0]].awards.push({ award: AgpaAwardType.gold, categoryId: catId });
        ctx.photos[pIds[1]].awards.push({ award: AgpaAwardType.gold, categoryId: catId });
        ctx.photos[pIds[2]].awards.push({ award: AgpaAwardType.sylver, categoryId: catId });
        ctx.photos[pIds[3]].awards.push({ award: AgpaAwardType.bronze, categoryId: catId });
    } else {
        ctx.photos[pIds[0]].awards.push({ award: AgpaAwardType.gold, categoryId: catId });
        ctx.photos[pIds[1]].awards.push({ award: AgpaAwardType.sylver, categoryId: catId });
        ctx.photos[pIds[2]].awards.push({ award: AgpaAwardType.bronze, categoryId: catId });
        ctx.photos[pIds[3]].awards.push({ award: AgpaAwardType.nominated, categoryId: catId });
    }
    // On met à jour le palmarès (de l'édition) des auteurs
    for (let idx = 0; idx < 4; idx++) {
        const p = ctx.photos[pIds[idx]];
        ctx.users[p.userId].palmares += palmaresPoints(p.awards.find(a => a.categoryId === catId).award);
    }
}

/**
 * Attribution des AGPA (or, argent et bronze) pour une liste de photographes
 * La liste des photographes doit déjà être triée et ordonnée
 * Cette première passe ne traite pas les AGPA de diamant
 * @param pIds liste des photographes
 * @param ctx le context de donnée à mettre à jours
 */
function deliverAwardsPhotographes(pIds: number[], ctx: any) {
    // On attribut simplement les agpa or, diamant et bronze aux 1er, deuxième et troisième photographes
    ctx.users[pIds[0]].award = AgpaAwardType.gold;
    ctx.users[pIds[1]].award = AgpaAwardType.sylver;
    ctx.users[pIds[2]].award = AgpaAwardType.bronze;
    // On met à jour le palmarès (de l'édition) des auteurs
    for (let idx = 0; idx < 3; idx++) {
        ctx.users[pIds[idx]].palmares += palmaresPoints(ctx.users[pIds[idx]].award);
    }
}

/**
 * vérifie l'intégrité des votes : cohérance aux niveaux des différents identifiants, des années,
 * des catégories, des photos, des auteurs, etc
 * @param ctx le contexte des agpa
 *
 * @return le contexte des agpa avec les données sur les votes pour chaques catégories
 */
export async function p4CheckVotes(ctx) {
    // On récupère le contexte sql
    const repo = getRepository(AgpaVote);

    // Récupérer votes, avec les données des photos associées
    const sql = `SELECT v.*, p."categoryId" as "pCategoryId", p."userId" as "pUserId", p.year as "pYear", p.title, u.username, a."dateOfBirth" 
        FROM agpa_vote v, agpa_photo p, "user" u, person a 
        WHERE v.year=${ctx.year}
        AND p.id = v."photoId" 
        AND p.error IS NULL 
        AND v."userId" = u.id 
        AND u."personId" = a.id 
        ORDER BY p."categoryId" ASC, v."userId" ASC, score ASC`;

    const raw = await repo.query(sql);
    const votes = {};
    for (const v of raw) {
        if (!votes[v.categoryId]) {
            votes[v.categoryId] = {};
        }
        if (!votes[v.categoryId][v.userId]) {
            votes[v.categoryId][v.userId] = [];
        }
        votes[v.categoryId][v.userId].push(v);
    }

    // Vérification des votes
    for (const catId in votes) {
        // On ignore les catégories spéciales meilleur auteur et meilleur photo pour l'instant
        if (!(+catId > 0 || +catId === -3)) {
            continue;
        }

        const maxVotePhoto = Math.round(ctx.categories[catId].totalPhotos / 2.0);
        const minVotePhoto = Math.round(maxVotePhoto / 2.0);
        ctx.categories[catId].maxVotePhoto = maxVotePhoto;
        ctx.categories[catId].minVotePhoto = minVotePhoto;
        ctx.categories[catId].votes = [];

        // Analyse des votes des utilisateurs pour la catégorie en cours
        for (const userId in votes[catId]) {
            // résumé de l'utilisateur
            const stats = {
                userId: -1,                     // L'id de l'utilisateur
                username: "",                   // Le nom de l'utilisateur
                // eslint-disable-next-line prettier/prettier
                age: 0,                         // Son age
                votesScore: 0,                  // Le nombre total de points qu'il a attribué dans la catégorie
                valid: false,                   // Si ses votes sont considérés comme valides pour cette catégorie
                errors: {                       // La liste des problèmes rencontrés
                    authorError: false,         // erreur: à voter pour ses propres photos
                    categoryError: false,       // erreur: des votes comptés pour cette catégorie sont attribués à des photos d'une autre catégorie
                    yearError: false,           // erreur: des votes comptés pour cette année sont attribués à des photos d'une autre année
                    votesNumberError: false,    // erreur: a attribué trop ou pas assez de vote
                    scoreError: false,          // erreur: a attribué trop ou pas assez de points
                    childError: false           // erreur: trop jeune pour prendre en compte ses votes
                },
                votes: []                       // la liste des votes de l'utilisateur pour la catégorie
            };

            // Pour chacun des votes de l'utilisateur :
            for (const vote of votes[catId][userId]) {
                stats.votesScore += vote.score;
                stats.votes.push(vote);
                stats.userId = vote.userId;
                stats.username = vote.username;
                stats.age = ctx.year - new Date(vote.dateOfBirth).getFullYear();
                vote.error = false;

                // Vérification note du vote compris entre 1 et 2 (on accepte les vote zéro utilisé pour le meilleur titre)
                if (vote.score < 0 || vote.score > 2) {
                    vote.error = true;
                    stats.errors.scoreError = true;
                }

                // Vérification auteur de la photo (interdit de voter pour ses propres photos)
                if (vote.pUserId === vote.userId) {
                    vote.error = true;
                    stats.errors.authorError = true;
                }

                // Vérification catégorie de la photo (categorie du vote doit correspondre à la catégorie de la photo concernée par le vote)
                if (vote.categoryId != vote.pCategoryId && vote.categoryId != -3) {
                    vote.error = true;
                    stats.errors.categoryError = true;
                }

                // Vérification année de la photo
                if (vote.year != vote.pYear) {
                    vote.error = true;
                    stats.errors.yearError = true;
                }

                // Vérification de l'âge du juré (doit avoir 12 ans pour être pris en compte)
                if (stats.age < 12) {
                    stats.errors.childError = true;
                }
            }

            // Est-ce que le juré à donné suffisamment de vote pour être pris en compte
            if (+catId > 0) {
                stats.errors.votesNumberError = stats.votesScore < minVotePhoto || stats.votesScore > maxVotePhoto;
            } else {
                stats.errors.votesNumberError = votes[catId][userId].length < 5 || votes[catId][userId].length > 10;
            }

            // une fois qu'on a analysé tout les vote d'un utilisateur pour une catégorie, on décide si on en tient compte ou pas.
            stats.valid =
                !stats.errors.authorError &&
                !stats.errors.categoryError &&
                !stats.errors.yearError &&
                !stats.errors.votesNumberError &&
                !stats.errors.scoreError &&
                !stats.errors.childError;

            ctx.categories[catId].votes.push(stats);
        }
    }

    return ctx;
}

/**
 * Calcul les notes de chaques photos suivant l'algorithme du réglement 2008 des AGPA
 * @param ctx les données retournées lors de l'étape 1 (cf p4CheckVotes)
 *
 * @return le contexte des agpa avec les notes calculées pour chaque photos
 */
export async function p4ComputeNotes(ctx) {
    // On récupère le contexte sql
    const repo = getRepository(AgpaPhoto);

    // Récupérer les photos (init votes/notes etc à 0)
    let sql = `SELECT p.*, u.username FROM agpa_photo p INNER JOIN "user" u ON u.id = p."userId" WHERE year=${ctx.year}`;
    const raw = await repo.query(sql);
    ctx.photos = {};
    for (const p of raw) {
        // On garde en mémoire les anciennes valeurs calculées pour comparer si besoin
        p.formerStats = {
            votes: p.votes,
            votesTitle: p.votesTitle,
            score: p.score,
            gscore: p.gscore
        };
        // On réinitialise les scores
        p.votes = 0;            // Le nombre de vote "étoile" d'utilisateurs différents obtenu
        p.votesTitle = 0;       // Le nombre de vote "plume" d'utilisateurs différents obtenu
        p.score = 0;            // Le score "étoile" total obtenu
        p.gscore = 0;           // Le score calculé
        p.awards = null;        // Les récompenses obtenues
        ctx.photos[p.id] = p;
    }

    // Décompte des votes (passe 1 -> calcul note simple)
    for (const catId in ctx.categories) {
        // On ignore les catégories spéciales meilleur auteur et meilleur photo pour l'instant
        if (!(+catId > 0 || +catId === -3)) {
            continue;
        }

        ctx.categories[catId].judgesNumber = 0;     // Nombre de jurés dont les votes sont pris en compte dans la catégorie
        ctx.categories[catId].scoresSum = 0;        // Somme total du nombre de points attribués par l'ensemble des jurés dans la catégorie
        ctx.categories[catId].votesSum = 0;         // Somme total du nombre de vote attribués par l'ensemble des jurés dans la catégorie

        for (const userId in ctx.categories[catId].votes) {
            // Si les votes ne sont pas valides, on les ignores
            if (!ctx.categories[catId].votes[userId].valid) continue;

            ctx.categories[catId].judgesNumber += 1;
            for (const vote of ctx.categories[catId].votes[userId].votes) {
                if (+catId === -3) {
                    // calculs pour les plumes
                    ctx.photos[vote.photoId].votesTitle += 1;
                } else {
                    // calculs des étoiles

                    // Décompte pour la photo concernée
                    ctx.photos[vote.photoId].votes += 1;
                    ctx.photos[vote.photoId].score += vote.score;

                    // Décompte total pour la catégorie
                    ctx.categories[catId].scoresSum += vote.score;
                    ctx.categories[catId].votesSum += 1;
                }
            }
        }
    }

    // Décompte des votes (passe 2 -> calcul note G)
    const scoreCoef = 9990.00999001; //10000000 / 1001;
    const votesCoef = 9.99000999001; //10000 / 1001;
    sql = "";
    for (const photoId in ctx.photos) {
        const photo = ctx.photos[photoId];
        const cat = ctx.categories[photo.categoryId];

        const scoreNote = photo.score * (cat.totalPhotos / cat.scoresSum) * scoreCoef;
        const votesScore = photo.votes * (cat.totalPhotos / cat.votesSum) * votesCoef;
        ctx.photos[photoId].gscore = Math.round(scoreNote + votesScore);

        sql += `UPDATE agpa_photos SET g_score=${ctx.photos[photoId].gscore}, votes=${photo.votes}, score=${photo.score} WHERE id=${photo.id};`;
    }

    // 3- On trie les photos par ordre decroissant de note globale
    ctx.photosOrder = Object.values(ctx.photos)
        .sort((a: any, b: any) => b.gscore - a.gscore)
        .map(e => (e as any).id);

    return ctx;
}

/**
 * Classe les photos pour toutes les catégories afin d'attribuer les AGPA et établie le palmares
 * @param ctx les données retournées lors de l'étape 2 (cf p4ComputeNotes)
 *
 * @return le contexte des agpa avec les awards obtenu pour chaque photos et utilisateurs
 */
export async function p4AgpaAttribution(ctx: any) {
    // On récupère le contexte sql
    const repo = getRepository(AgpaPhoto);
    const userData = {};
    const catNumber = Object.values(ctx.categories).filter(c => (c as any).id > 0).length;

    // Intialisation et calcul de différentes infos pour chaque participants de l'édition
    for (const pId in ctx.photos) {
        const p = ctx.photos[pId];
        if (!(p.userId in userData)) {
            userData[p.userId] = {
                id: p.userId,           // Son id
                username: p.username,   // Son nom
                photos: [],             // Les photos de l'utilisateurs
                scoreOf8: 0,            // Score aux votes obtenu par les 8 (8 = nombre de catégorie en jeux pour cette édition) meilleurs photos
                scoreOf4: 0,            // Score aux votes obtenu par les 4 meilleurs photos (agpa de diamants meilleur photographe)
                average: 0,             // Score moyen obtenu sur l'ensemble des photos posté de l'utilisateur
                lower: 0,               // Plus petit score obtenu par les photos de l'utilisateur
                formerPalmares: 0,      // Palmares cumulés des éditions précédantes
                palmares: 0,            // total de points obtenu au palmares de l'édition actuelle
            };
        }
        if (userData[p.userId].photos.length < catNumber) {
            userData[p.userId].photos.push(p);
            userData[p.userId].scoreOf8 += p.gscore;

            if (userData[p.userId].photos.length <= 4) {
                userData[p.userId].scoreOf4 += p.gscore;
            }
        }
    }

    const photos = Object.values(ctx.photos) as Array<any>;
    for (const uId in userData) {
        const uPhotos = photos.filter(p => +p.userId === +uId);
        const count = uPhotos.length;
        userData[uId].lower = uPhotos[count - 1].gscore;
        userData[uId].average = uPhotos.reduce((sum, e) => e.gscore + sum, 0) / count;
    }

    ctx.users = userData;

    // Calcul des palmares des editions précédentes
    const sql = `SELECT * FROM agpa_award WHERE year < ${ctx.year} ORDER BY "userId" ASC, year ASC`;
    const raw = await repo.query(sql);
    for (const p of raw) {
        // On ne prend en compte que les palmarès des utilisateurs qui ont participés cette année
        if (p.userId in ctx.users) {
            ctx.users[p.userId].formerPalmares += palmaresPoints(p.award);
        }
    }

    // Définition des méthodes pour trier et départager les ex-aequos
    function sortPhotos(aId, bId) {
        const a = ctx.photos[aId];
        const b = ctx.photos[bId];

        // On trie dans l'ordre décroissant
        let res = b.gscore - a.gsscore;
        if (res != 0) return res;

        // Si exaquo, photo ayant titre gagne
        res = (b.title != "" ? 1 : 0) - (a.title != "" ? 1 : 0);
        if (res != 0) return res;

        // Si exaequo, avantage à la photo appartenant à la categorie la plus importante (en nombre de photo)
        res = ctx.categories[b.categoryId].photosNumber - ctx.categories[a.categoryId].photosNumber;
        if (res != 0) return res;

        // Si exaequo, avantage à la photo de l'édition la plus récente
        res = b.year - a.year;
        if (res != 0) return res;

        // Si exaequo, avantage au photographe ayant le moins bon palamarès cumulé sur l'ensemble des éditions précédentes
        res = ctx.users[a.userId].formerPalmares - ctx.users[b.userId].formerPalmares;
        if (res != 0) return res;

        // Si toujours exaequos, on tire au sort
        res = Math.random();
        return res > 0.5 ? 1 : -1;
    }

    function sortPhotographes(a, b) {
        // On trie dans l'ordre décroissant en fonction de la moyenne des 8 meilleurs photos des photographes
        let res = b.scoreOf8 - a.scoreOf8;
        if (res != 0) return res;

        // Si exaequo, avantage au photographe dont la note moyenne sur l'ensemble de ses photos est la plus élevée pour l'édition en cours
        res = b.average - a.average;
        if (res != 0) return res;

        // Si exaequo, avantage au photographe dont la plus mauvaise photo a la meilleur note
        res = b.lower - a.lower;
        if (res != 0) return res;

        // Si exaequo, avantage au photograhe ayant le meilleur palmarès sur l'édition en cours
        res = ctx.users[b.userId].palmares - ctx.users[a.userId].palmares;
        if (res != 0) return res;

        // Si exaequo, avantage au photographe ayant le moins bon palamarès cumulé sur l'ensemble des éditions précédentes
        res = ctx.users[a.userId].formerPalmares - ctx.users[b.userId].formerPalmares;
        if (res != 0) return res;

        // Si toujours exaequos, on tire au sort
        res = Math.random();
        return res > 0.5 ? 1 : -1;
    }

    function sortTitles(aId, bId) {
        const a = ctx.photos[aId];
        const b = ctx.photos[bId];

        // On trie dans l'ordre décroissant en fonction du nombre de fois où une photo a été sélectionné pour le meilleur titre
        let res = b.scoreTitle - a.scoreTitle;
        if (res != 0) return res;

        // Si exaequo, avantage à la photo ayant le plus petit score
        res = b.gscore - a.gscore;
        if (res != 0) return res;

        // Si exaequo, avantage au photograhe ayant le moins bon palmarès sur l'édition en cours
        res = ctx.users[a.userId].palmares - ctx.users[b.userId].palmares;
        if (res != 0) return res;

        // Si exaequo, avantage au photographe ayant le moins bon palamarès cumulé sur l'ensemble des éditions précédentes
        res = ctx.users[a.userId].formerPalmares - ctx.users[b.userId].formerPalmares;
        if (res != 0) return res;

        // Si toujours exaequos, on tire au sort
        res = Math.random();
        return res > 0.5 ? 1 : -1;
    }

    // Palmarès des catégories "simples"
    // (afin de calculer un premier palmarès de l'édition en cours utilisé pour départager les ex-aequos des catégories spéciales)
    for (const catId in ctx.categories) {
        if (+catId < 0) continue;

        ctx.categories[catId].photos = ctx.photosOrder
            .filter(pId => ctx.photos[pId].categoryId == catId)
            .sort(sortPhotos);
        deliverAwardsPhotos(ctx.categories[catId].photos, +catId, ctx);
    }

    // Palmarès "Meilleur titre" (à partir de 2011)
    if (ctx.categories[-3]) {
        ctx.categories[-3].photos = ctx.photosOrder.filter(pId => ctx.photos[pId].votesTitle > 0).sort(sortTitles);
        deliverAwardsPhotos(ctx.categories[-3].photos, -3, ctx);
    }

    // // Palmarès "Meilleur photographie"
    ctx.photosOrder.sort(sortPhotos);
    deliverAwardsPhotos(ctx.photosOrder, -2, ctx);

    // // Palmarès "Meilleur photographe"
    ctx.usersOrder = Object.values(ctx.users)
        .sort(sortPhotographes)
        .map(u => (u as any).id);
    deliverAwardsPhotographes(ctx.usersOrder, ctx);

    return ctx;
}

/**
 * Modifie les AGPA d'or en AGPA de diamant si les conditions sont réunis.
 * @param ctx les données retournées lors de l'étape 3 (cf p4AgpaAttribution)
 *
 * @return boolean, vraie si diamant, faux sinon
 */
export async function p4DiamondAttribution(ctx: any) {
    // Pour chaque catégories:
    for (const cat of ctx.categories) {
        // Il faut au moins 2 photos dans la catégorie
        if (cat.photos.length <= 2) continue;
        const p1 = ctx.photos[cat.photos[0]];
        const p2 = ctx.photos[cat.photos[1]];

        if (cat.id > 0 && p1.gscore > 2 * p2.gscore && p1.gscore > 50000) {
            // Catégorie "simple"
            const idxAward = ctx.photos[cat.photos[0]].awards.findIndex(a => a.categoryId === cat.id);
            ctx.photos[cat.photos[0]].awards[idxAward].award = AgpaAwardType.diamond;
        } else if (cat.id === -3 && p1.votesTitle > 2 * p2.votesTitle) {
            // Catégorie "Meilleur titre"
            const idxAward = ctx.photos[cat.photos[0]].awards.findIndex(a => a.categoryId === cat.id);
            ctx.photos[cat.photos[0]].awards[idxAward].award = AgpaAwardType.diamond;
        } else if (cat.id === -2) {
            // Catégorie "Meilleure photo"
            let isDiamond = p1.awards.find(a => a.categoryId > 0);
            isDiamond = isDiamond ? isDiamond.award === AgpaAwardType.diamond : false;

            const maxJudgesNumber = ctx.categories[p1.categoryId].votes.filter(j => j.age >= 12).length;
            if (isDiamond && p1.votes >= maxJudgesNumber - 1) {
                const idxAward = ctx.photos[cat.photos[0]].awards.findIndex(a => a.categoryId === cat.id);
                ctx.photos[cat.photos[0]].awards[idxAward].award = AgpaAwardType.diamond;
            }
        } else if (cat.id === -1) {
            // Catégorie "Meilleur photographe"
            const p3 = ctx.photos[ctx.categories[-2][2]];
            const author = p1.userId === p2.userId && p2.userId === p3.userId;
            const total = p1.gscore + p2.gscore + p3.gscore;
            if (author && p1.userId === ctx.usersOrder[0] && total >= 100000) {
                ctx.users[p1.userId].award = AgpaAwardType.diamond;
            }
        }
    }

    // On emet à zéros le palmarès de tout le monde
    for (const userId in ctx.users) {
        ctx.users[userId].awards = [];
        ctx.users[userId].palmares = 0;

        // On en profite pour compte l'agpa du meilleur photographe
        if (ctx.users[userId].award) {
            ctx.users[userId].awards.push({ categoryId: -1, award: ctx.users[userId].award });
            ctx.users[userId].palmares += palmaresPoints(ctx.users[userId].award);
        }
    }

    // On recompte les palmarès photos de chaque personnes
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

// /**
//  * closeEdition
//  * récupère les données retournées par la méthode deliverAwards($categories) et enregistre
//  * dans la base de données les résultats.
//  * @param $ctx [array], le contexte des agpa
//  * @param &$categories, les photos triées par catégories obtenue lors de l'appel à la méthode deliverAwards($categories)
//  */
// if ( ! function_exists('closeEdition'))
// {
//     function closeEdition(&$ctx, &$categories)
//     {

//         $CI = get_instance();

//     // 1- Mettre à jours les données "classement" des photos
//         foreach ($categories as $idCat => $category)
//         {
//             if ($idCat < 0) continue;
//             $leaderBoardRanking = 1;
//             foreach($category['photos'] as $leaderBoardRanking => $photo)
//             {
//                 // On enregistre
//                 $sql = 'UPDATE agpa_photos SET ranking='.($leaderBoardRanking+1)
//                       .' WHERE photo_id='.$photo->photo_id.' LIMIT 1 ;';
//                 $CI->db->query($sql);
//             }
//         }

//     // 2- Enregistrer les données palmares
//         $sql = 'INSERT INTO agpa_awards (`year`,`category_id`,`author_id`,`award`,`photo_id`) VALUES';

//         foreach ($categories as $idCat => $category)
//         {
//             $max = ($idCat != -1)? min(sizeof($category['photos']), 4) : min(sizeof($category),4);
//             $previousAward = '';

//             for($i=0; $i<$max;  $i++)
//             {
//                 if ($idCat == -1)
//                 {
//                     $author = $category[$i]['IdPhotographe'];
//                     $award  = (isset($category[$i]['award'])) ? $category[$i]['award'] : 'lice';
//                     $photo  = 0;
//                 }
//                 elseif ($idCat == -2)
//                 {
//                     $author = $category['photos'][$i]->user_id;
//                     $award  = (isset($category['photos'][$i]->awardPhoto)) ? $category['photos'][$i]->awardPhoto : 'lice';
//                     $photo  = $category['photos'][$i]->photo_id;
//                 }
//                 elseif ($idCat == -3)
//                 {
//                     $author = $category['photos'][$i]->user_id;
//                     $award  = (isset($category['photos'][$i]->awardTitle)) ? $category['photos'][$i]->awardTitle : 'lice';
//                     $photo  = $category['photos'][$i]->photo_id;
//                 }
//                 else
//                 {
//                     $author = $category['photos'][$i]->user_id;
//                     $award  = (isset($category['photos'][$i]->award)) ? $category['photos'][$i]->award : 'lice';
//                     $photo  = $category['photos'][$i]->photo_id;
//                 }

//                 $sql .= "('{$ctx['current_phase_year']}','$idCat','$author','$award','$photo'),";
//             }
//         }
//         // On supprime la dernière virgule en trop
//         $sql = substr($sql,0,strlen($sql)-1);

//         // Précaution, avant d'enregistrer, on supprime tout le palmares de l'année
//         $CI->db->query('DELETE FROM agpa_awards WHERE year='.$ctx['current_phase_year']);

//         // On enregistre
//         $CI->db->query($sql);
//     }
// }
