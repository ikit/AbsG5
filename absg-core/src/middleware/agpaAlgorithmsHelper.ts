
import { AgpaPhoto, AgpaVote } from "../entities";
import { getRepository } from "typeorm";

/**
 * vérifie l'intégrité des votes : cohérance aux niveaux des différents identifiants, des années,
 * des catégories, des photos, des auteurs, etc
 * @param $ctx [array], le contexte des agpa
 * @param $display, boolean, true : affichage dans le template du resultat
 *
 * @return array[mixed], les identifiants des votes acceptés et à prendre en compte pour le calcul des notes
 */
export async function p4CheckVotes(context) {
    // On récupère le contexte sql
    const repo = getRepository(AgpaVote);

    // Récupérer votes, avec les données des photos associées
    const sql = `SELECT v.*, p."categoryId" as "pCategoryId", p."userId" as "pUserId", p.year as "pYear", p.title, u.username, a."dateOfBirth" 
        FROM agpa_vote v, agpa_photo p, "user" u, person a 
        WHERE v.year=${context.year}
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

    // Analyse des votes...
    for (const catId in votes) {
        // On ignore les catégories spéciales meilleur auteur et meilleur photo pour l'instant
        if (!(+catId > 0 || +catId === -3)) {
            continue;
        }

        const maxVotePhoto = Math.round(context.categories[catId].totalPhotos / 2.0);
        const minVotePhoto = Math.round(maxVotePhoto / 2.0);
        context.categories[catId].maxVotePhoto = maxVotePhoto;
        context.categories[catId].minVotePhoto = minVotePhoto;
        context.categories[catId].votes = [];

        // Analyse des votes des utilisateurs pour la catégorie en cours
        for (const userId in votes[catId]) {
            // résumé de l'utilisateur
            const stats = {
                user: "",
                age: 0,
                votesScore: 0,
                valid: false,
                errors: {
                    authorError: false,
                    categoryError: false,
                    yearError: false,
                    votesNumberError: false,
                    scoreError: false,
                    childError: false
                },
                votes: []
            };

            // Pour chacun des votes de l'utilisateur :
            for (const vote of votes[catId][userId]) {
                stats.votesScore += vote.score;
                stats.votes.push(vote);
                stats.user = vote.username;
                stats.age = context.year - new Date(vote.dateOfBirth).getFullYear();
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

                // Vérification de l'âge du juré (doit avoir 10 ans pour être pris en compte)
                if (stats.age < 10) {
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

            context.categories[catId].votes.push(stats);
        }
    }

    return context;
}

/**
 * computeNotes
 * à partir du tableau de votes qu'on lui fournis, calcul les notes de chaques photos suivant
 * l'algorithme du réglement 2008 des AGPA
 * @param ctx, les données retournées lors de l'étape 1 (cf p4CheckVotes)
 *
 * @return array[mixed], les identifiant des votes acceptés et à prendre en compte pour le calcul des notes
 */
export async function p4ComputeNotes(ctx) {
    // On récupère le contexte sql
    const repo = getRepository(AgpaPhoto);

    // Récupérer les photos (init votes/notes etc à 0)
    let sql = `SELECT p.*, u.username FROM agpa_photo p INNER JOIN "user" u ON u.id = p."userId" WHERE year=${ctx.year}`;
    const raw = await repo.query(sql);
    ctx.photos = {};
    for (const p of raw) {
        // On réinitialise les scores calculés par sécurité
        p.votes = 0;
        p.votesTitle = 0;
        p.score = 0;
        p.gscore = 0;
        p.awards = null;
        ctx.photos[p.id] = p;
    }

    // Décompte des votes (passe 1 -> calcul note simple)
    for (const catId in ctx.categories) {
        // On ignore les catégories spéciales meilleur auteur et meilleur photo pour l'instant
        if (!(+catId > 0 || +catId === -3)) {
            continue;
        }

        ctx.categories[catId].judgesNumber = ctx.categories[catId].votes.length;
        ctx.categories[catId].scoresSum = 0;
        ctx.categories[catId].votesSum = 0;

        for (const userId in ctx.categories[catId].votes) {
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
        ctx.photos[photoId].gScore = Math.round(scoreNote + votesScore);

        sql += `UPDATE agpa_photos SET g_score=${ctx.photos[photoId].gScore}, votes=${photo.votes}, score=${photo.score} WHERE id=${photo.id};`;
    }

    // 3- On trie les photos par ordre decroissant de note globale
    const photos = Object.values(ctx.photos);
    photos.sort((a: any, b: any) => b.gScore - a.gScore);
    ctx.photos = photos;

    return ctx;
}

// /**
//  * evalNote
//  * récupère les photos d'une année, et effectue le trie pour toutes les catégories afin d'attribuer les AGPA -> création palmares
//  * Nécessite les appels aux méthodes checkVotes et computeNotes au préalable
//  * @param $ctx [array], le contexte des agpa
//  * @param &$categories, les photos triées par catégories obtenue lors de l'appel à la méthode computeNote
//  * @param $display, boolean, true : affichage dans le template du resultat
//  *
//  * @return array[mixed], par catégorie, les 4 meilleurs photos avec des
//  *                       indications sur le type d'AGPA et les cas d'ex-aequo
//  */
// if ( ! function_exists('evalNote'))
// {
//     function evalNote(&$ctx, &$categories, $display)
//     {
//         global $AGPA_CTX;
//         $CI = get_instance();
//         $awards=array('diamant','or','argent','bronze');

//     // 1- Contruction des tableaux pour les Hors-catégories -1 et -2
//         $photosPerPhotographes = array();
//         $categories[-2] = array();

//         foreach($categories as $idCat => $category)
//         {
//             if ($idCat < 0 ) continue;
//             foreach($category['photos'] as $i => $photo)
//             {
// 				// On rempli le taleau des photos de chaque auteur
// 				if ($idCat > 0)
// 				{
// 					$photosPerPhotographes[$photo->user_id][] = $categories[$idCat]['photos'][$i];
//                 }

//                 // On donne une référence au tableau principale ds chaque photos (utile plus tard (cf 3- ) lors du tri automatique des photos)
//                 $categories[$idCat]['photos'][$i]->refRoot = &$categories;
// 				$categories[-2]['photos'][] = $categories[$idCat]['photos'][$i];

//             }
//         }

//         function compare($a, $b)
//         {
//             // on trie dans l'ordre décroissant
//             return $b->g_score - $a->g_score;
//         }

//     // 2- Meilleurs photograhes : agregation des données
//         foreach($photosPerPhotographes as $photoIdgraphe => $photos)
//         {
//             // 2.1- Trier les tableaux de photos
//             usort($photosPerPhotographes[$photoIdgraphe], "compare");
// 			// pour simplifier la lecture du code, on place le taleau trié sur lequel on travail dans la variable $photos
// 			$photos = $photosPerPhotographes[$photoIdgraphe];
//             $photographeDatas = array();

//             // On ne garde que les 8 (= nbr de catégorie) meilleurs photos
//             $sumPhotos = 0; $nbrPhotos = 0; $sum4Photos = 0; $sum8Photos = 0; $nbrVotes = 0; $sumScores = 0;
//             for ($i=0; $i < sizeof($photos); $i++)
//             {
//                 if ($i < 4) $sum4Photos += $photos[$i]->g_score;
//                 if ($i < 8) $sum8Photos += $photos[$i]->g_score;
//                 $photographeDatas[$i] = $photos[$i];
//                 $sumPhotos += $photos[$i]->g_score;
//                 ++$nbrPhotos;
//                 $nbrVotes += $photos[$i]->votes;
//                 $sumScores += $photos[$i]->score;
//             }
//             // on calcul la moyenne des 6 meilleurs photos ainsi que la plus basse
//             // note récupérée par l'auteur au cours de l'édition
//             $photographeDatas['sum8'] = $sum8Photos;
//             $photographeDatas['sum4'] = $sum4Photos;
//             $photographeDatas['average'] = $sumPhotos/$nbrPhotos;
//             $photographeDatas['lower'] = $photos[sizeof($photos)-1]->g_score;
//             $photographeDatas['sumScores'] = $sumScores;
//             $photographeDatas['votesNumber'] = $nbrVotes;
//             $photographeDatas['photosNumber'] = $nbrPhotos;

//             // on sauvegarde
//             foreach($photographeDatas as $k => $row)
//             {
//                 if (is_string($k))
//                 $categories[-1][$photoIdgraphe][$k] = $row;
//             }
//         }

//         // 2.2 - Calcul des palmares des editions précédentes
//         $sql = 'SELECT * FROM agpa_awards WHERE year < '.$ctx['current_phase_year'].' ORDER BY author_id ASC, year ASC';
//         $datas = array(); // contenaire temporaire
//         $actualUser = 0;

//         $result = $CI->db->query($sql)->result();
//         foreach ($result as $row)
//         {
//             if ($actualUser != $row->author_id)
//             {
//                 $actualUser = $row->author_id;
//                 $datas[$actualUser] = 0;
//             }

//             $datas[$actualUser] += getPalmaresPoint($row->category_id, $row->award);
//         }

//         // on garde le palmares des années précédentes dans le contenaires principale $categories
//         foreach($datas as $photoIdgraphe => $score)
//         {
//             $ctx['members'][$photoIdgraphe]->PreviousWinners = $score;
//         }

//         // On s'assure que l'attribut "PreviousWinners" est bien défini même pour ceux qui n'ont pas de palmares.
//         foreach( $ctx['members'] as $id => $userData)
//         {
//             if (!isset($userData->PreviousWinners))
//             {
//                 $ctx['members'][$id]->PreviousWinners = 0;
//             }
//         }

//         // On met à jour le contexte global avec les dernières données.
//         $AGPA_CTX = $ctx;

//     // 3- On retrie les photos de chaque catégorie, avec une méthode qui départage les ex-aequos

//         function sortPhotos(&$a, &$b)
//         {
//             // On récupère le contexte global
//             global $AGPA_CTX;

//             // on trie dans l'ordre décroissant
//             $res = $b->g_score - $a->g_score;
//             if ( $res != 0) return $res;

//             // Si exaquo, photo ayant titre gagne :
//             $res = ( ($a->title != "")? 1 : 0) - ( ($b->title != "")? 1 : 0);
//             if ( $res != 0) return $res;

//             // Si exaequo, avantage à la photo appartenant à la categorie la plus importante (en nombre de photo)
//             $res = $a->refRoot[$a->category_id]['photosNumber'] - $b->refRoot[$b->category_id]['photosNumber'];
//             if ( $res != 0) return $res;

//             // Si exaequo, avantage à la photo de l'édition la plus récente
//             $res = $a->year - $b->year;
//             if ( $res != 0) return $res;

//             // Si exaequo, avantage au photographe ayant le moins bon palamarès cumulé sur l'ensemble des éditions précédentes
//             $res = $AGPA_CTX['members'][$a->user_id]->PreviousWinners - $AGPA_CTX['members'][$b->user_id]->PreviousWinners;
//             if ( $res != 0) return $res;

//             // Si toujours exaequos, on tire au sort
//             $res = rand(0,1);
//             if ( $res == 0) return -1;
//             return 1;
//         }

//         function sortPhotographes(&$a, &$b)
//         {
//             // On trie dans l'ordre décroissant en fonction de la moyenne des 6 meilleurs photos des photographes
//             $res = $b['sum8'] - $a['sum8'];
//             if ( $res != 0) return $res;

//             // si exaequo, avantage au photographe dont la note moyenne sur l'ensemble de ses photos est la plus élevée pour l'édition en cours
//             $res = $a['average'] - $b['average'];
//             if ( $res != 0) return $res;

//             // Si exaequo, avantage au photographe dont la plus mauvaise photo a la meilleur note
//             $res = $a['lower'] - $b['lower'];
//             if ( $res != 0) return $res;

//             // Si exaequo, avantage au photograhe ayant le meilleur palmarès sur l'édition en cours
//             // TODO : PAS FAIT !!!!!!
//             $res = $a['ActualWinners'] - $b['ActualWinners'];
//             if ( $res != 0) return $res;

//             // Si exaequo, avantage au photographe ayant le moins bon palamarès cumulé sur l'ensemble des éditions précédentes
//             $res = $ctx['members'][$a['user_id']]['PreviousWinners'] - $ctx['members'][$b['user_id']]['PreviousWinners'];
//             if ( $res != 0) return $res;

//             // Si toujours exaequos, on tire au sort
//             $res = rand(0,1);
//             if ( $res == 0) return -1;
//             return 1;
//         }

//         function sortTitles(&$a, &$b)
//         {
//             // On trie dans l'ordre décroissant en fonction du nombre de fois où une photo a été sélectionné pour le meilleur titre
//             $res = $b->scoreTitle - $a->scoreTitle;
//             if ( $res != 0) return $res;

//             // si exaequo, avantage à la photo ayant le plus petit score
//             $res = $a->g_score - $b->g_score;
//             if ( $res != 0) return $res;

//             // Si toujours exaequos, on tire au sort
//             $res = rand(0,1);
//             if ( $res == 0) return -1;
//             return 1;
//         }

//         // 3.1- Déroulement du trie
//         // 3.1.1- pour les catégories simples
//         foreach($categories as $idCat => $cat)
//         {
//             if ($idCat > 0 || $idCat == -2)
//             usort($categories[$idCat]['photos'], "sortPhotos"); // NE SURTOUT PAS UTILISER $cat qui est une copie et non une ref !!!
//         }

//         // 3.1.2- Trie de la catégorie -3 : meilleur titre
//         usort($categories[-3]['photos'], "sortTitles");

//         // 3.2- Déroulement du trie pour le HC "Meilleur photographe"
//         // Compter les points palmares pour l'édition en cours.
//         $datas = array(); // contenaire temporaire

//         // 3.2.1- Effectuer une première passe pour attribuer les AGPA (sans les agpa diamant)
//         deliverAwardsPasse1($categories);

//         // 3.2.2- Calculer les points-palmares de chaque photographe pour l'edition actuelle
//         foreach ($categories as $categoryId => $category)
//         {
//             if ($categoryId == -1) continue;
//             foreach($category['photos'] as $positionInLeaderboard => $photo)
//             {
//                 if (!isset($datas[$photo->user_id])) $datas[$photo->user_id] = 0;
//                 if (!isset($photo->award)) break;

//                 $datas[$photo->user_id] += getPalmaresPoint($categoryId, $photo->award);
//             }
//         }

//         // 3.2.3- on sauvegarde dans le contenaire principal $categories
//         foreach($datas as $photoIdgraphe => $score)
//         {
//             $categories[-1][$photoIdgraphe]['ActualWinners'] = $score;
//             $categories[-1][$photoIdgraphe]['IdPhotographe'] = $photoIdgraphe; // on duplique l'id car avec le trie, la clés va changer
//         }

//         // On s'assure que tout les participants sont créés même si ils n'ont rien récolé
//         foreach ($ctx['members'] as $id => $memberData)
//         {
//             if (isset($categories[-1][$id]))
//             {
//                 if (!isset($categories[-1][$id]['IdPhotographe']))
//                     $categories[-1][$id]['IdPhotographe'] = $id;
//                 if (!isset($categories[-1][$id]['sum8']))
//                 {
//                     $categories[-1][$id]['sum8'] = 0;
//                     $categories[-1][$id]['sum4'] = 0;
//                     $categories[-1][$id]['average'] = 0;
//                     $categories[-1][$id]['lower'] = 0;
//                     $categories[-1][$id]['sumScores'] = 0;
//                     $categories[-1][$id]['votesNumber'] = 0;
//                     $categories[-1][$id]['photosNumber'] = 0;
//                 }
//             }
//         }

//         // 3.2.3- Trie de la catégorie -1 : meilleur photographe
//         usort($categories[-1], "sortPhotographes");

//         // 3.2.5- On attribue les récompenses aux photographes
//         deliverAwardsPasse2($categories);

//     // 4- Affichage

//         if ($display)
//         {
//             foreach ($categories as $categoryId => $category)
//             {
//                 if ($categoryId > 0)
//                 {
//                     $ctx['computeStep'][$categoryId] =  array(
//                         'id' => $categoryId,
//                         'judges_number' => $category['judgesNumber'],
//                         'photos_number' => $category['photosNumber'],
//                         'title' => $ctx['categories'][$categoryId]->title
//                     );
//                 }
//                 else if ($categoryId < -1)
//                 {
//                     $ctx['computeStep'][$categoryId] =  array(
//                         'id' => $categoryId,
//                         'title' => $ctx['categories'][$categoryId]->title
//                     );
//                 }

//                 // affichage categorie simple ou meilleures photos
//                 if ($categoryId > 0 or $categoryId == -2)
//                 {
//                     foreach($category['photos'] as $positionInLeaderboard => $photo)
//                     {
//                         $ctx['computeStep'][$categoryId]['photos'][] = array(
//                             'leaderbord_rank' => $positionInLeaderboard+1,
//                             'photo' => $photo,
//                             'author' => $ctx['members'][$photo->user_id]->username
//                         );
//                     }
//                 }
//                 // Meilleurs titre
//                 elseif ($categoryId == -3)
//                 {
//                     foreach($category['photos'] as $positionInLeaderboard => $photo)
//                     {
//                         $ctx['computeStep'][$categoryId]['photos'][] = array(
//                             'leaderbord_rank' => $positionInLeaderboard +1,
//                             'author' => $ctx['members'][$photo->user_id]->username,
//                             'title' => $photo->title,
//                             'scoreTitle' => $photo->scoreTitle
//                         );
//                     }
//                 }
//                 // Meilleurs photographes
//                 elseif ($categoryId == -1)
//                 {
//                     foreach($category as $position => $data)
//                     {
//                         $ctx['computeStep'][$categoryId]['photos'][] = array(
//                             'leaderbord_rank' => $position,
//                             'author' => $ctx['members'][$data['IdPhotographe']]->username,
//                             'sum8' => $data['sum8'],
//                             'average' => $data['average'],
//                             'lower' => $data['lower'],
//                             'sumpoints' => $data['sumScores'],
//                             'votes_number' => $data['votesNumber']
//                         );
//                     }
//                 }
//             }
//         }

//         return $categories;
//     }
// }

// /**
// * deliverAwardsPasse1
// * Première passe pour l'attribution des AGPA (or, argent, bronze)
// * Lors de cette première passe, on ne traite pas le HC "meilleur photographe"
// * @param $categories, les données obtenues lors de l'appel à evalNote
// */
// if ( ! function_exists('deliverAwardsPasse1'))
// {
//     function deliverAwardsPasse1(&$categories)
//     {
//         $awards=array('diamant','or','argent','bronze');

//         // On attribut simplement les agpa or, diamant et bronze au 1ere, deuxième et troisième photos
//         foreach($categories as $idCat => &$category)
//         {
//             if ($idCat > 0)
//             {

//                 // test du double agpa d'or
//                 if ($category['photos'][0]->user_id == $category['photos'][1]->user_id and
//                     $category['photos'][0]->score   == $category['photos'][1]->score )
//                 {
//                     $category['photos'][0]->award = $awards[1];
//                     $category['photos'][1]->award = $awards[1];
//                     $category['photos'][2]->award = $awards[2];
//                     $category['photos'][3]->award = $awards[3];
//                 }
//                 else
//                 {
//                     $category['photos'][0]->award = $awards[1];
//                     $category['photos'][1]->award = $awards[2];
//                     $category['photos'][2]->award = $awards[3];
//                 }
//             }
//             elseif ($idCat == -3)
//             {
//                 // test du double agpa d'or
//                 if ($category['photos'][0]->user_id == $category['photos'][1]->user_id and
//                     $category['photos'][0]->score   == $category['photos'][1]->score )
//                 {
//                     $category['photos'][0]->awardTitle = $awards[1];
//                     $category['photos'][1]->awardTitle = $awards[1];
//                     $category['photos'][2]->awardTitle = $awards[2];
//                     $category['photos'][3]->awardTitle = $awards[3];
//                 }
//                 else
//                 {
//                     $category['photos'][0]->awardTitle = $awards[1];
//                     $category['photos'][1]->awardTitle = $awards[2];
//                     $category['photos'][2]->awardTitle = $awards[3];
//                 }
//             }
//             elseif ($idCat == -2)
//             {
//                 // test du double agpa d'or
//                 if ($category['photos'][0]->user_id == $category['photos'][1]->user_id and
//                     $category['photos'][0]->score   == $category['photos'][1]->score )
//                 {
//                     $category['photos'][0]->awardPhoto = $awards[1];
//                     $category['photos'][1]->awardPhoto = $awards[1];
//                     $category['photos'][2]->awardPhoto = $awards[2];
//                     $category['photos'][3]->awardPhoto = $awards[3];
//                 }
//                 else
//                 {
//                     $category['photos'][0]->awardPhoto = $awards[1];
//                     $category['photos'][1]->awardPhoto = $awards[2];
//                     $category['photos'][2]->awardPhoto = $awards[3];
//                 }
//             }
//         }
//     }
// }

// /**
// * deliverAwardsPasse2
// * Première passe pour l'attribution des AGPA (or, argent, bronze)
// * Lors de cette seconde passe, on ne traite que le HC "meilleur photographe"
// * @param $categories, les données obtenues lors de l'appel à evalNote
// */
// if ( ! function_exists('deliverAwardsPasse2'))
// {
//     function deliverAwardsPasse2(&$categories)
//     {
//         $categories[-1][0]['award'] = 'or';
//         $categories[-1][1]['award'] = 'argent';
//         $categories[-1][2]['award'] = 'bronze';
//     }
// }



// /**
//  * deliverAwards
//  * récupère les données retournées par la méthode evalNote(year, $categorie)
//  * et retourne pour chaque catégorie (hors-catégorie compris) les récompenses obtenues
//  * @param $ctx [array], le contexte des agpa
//  * @param &$categories, les photos triées par catégories obtenue lors de l'appel à la méthode evalNote(year, $categorie)
//  * @param $display, boolean, true : affichage dans le template du resultat
//  *
//  * @return array[mixed], par catégorie, les 4 meilleurs photos avec des
//  *                       indications sur le type d'AGPA et les cas d'ex-aequo
//  */
// if ( ! function_exists('deliverAwards'))
// {
//     function deliverAwards(&$ctx, &$categories, $display)
//     {

//     // 2- Attribuer les AGPA de diamant
//         foreach ($categories as $idCat => &$category)
//         {
//             if ($idCat != -1)
//             {
//                 if (checkDiamant($idCat, $category['photos'][0], $category['photos'][1]))
//                 $category['photos'][0]->award = 'diamant';
//             }
//             else
//             {
//                 if (checkDiamant($idCat, $category[0], $category[1]))
//                 $category[0]['award'] = 'diamant';
//             }
//         }

//     // 2- Affichage
//         if ($display)
//         {
//             // Meilleurs photographes - BUG BIZARRE > si on essaye de mettre ce code dans le foreach sur $categories : NE FONCTIONNE PAS
//             foreach($categories[-1] as $position => $data)
//             {
//                 $ctx['computeStep'][-1]['photos'][] = array(
//                     'leaderbord_rank' => $position,
//                     'author' => $ctx['members'][$data['IdPhotographe']]->username,
//                     'sum8' => $data['sum8'],
//                     'average' => $data['average'],
//                     'lower' => $data['lower'],
//                     'sumpoints' => $data['sumScores'],
//                     'votes_number' => $data['votesNumber'],
//                     'award' => isset($data['award']) ? $data['award'] : ""
//                 );
//             }

//             // Les autres catégories
//             foreach ($categories as $categoryId => $category)
//             {

//                 if ($categoryId > 0)
//                 {
//                     $ctx['computeStep'][$categoryId] =  array(
//                         'id' => $categoryId,
//                         'judges_number' => $category['judgesNumber'],
//                         'photos_number' => $category['photosNumber'],
//                         'title' => $ctx['categories'][$categoryId]->title
//                     );
//                 }
//                 else if ($categoryId < -1)
//                 {
//                     $ctx['computeStep'][$categoryId] =  array(
//                         'id' => $categoryId,
//                         'title' => $ctx['categories'][$categoryId]->title
//                     );
//                 }

//                 // affichage categorie simple ou meilleures photos
//                 if ($categoryId > 0 or $categoryId == -2)
//                 {
//                     foreach($category['photos'] as $positionInLeaderboard => $photo)
//                     {
//                         $ctx['computeStep'][$categoryId]['photos'][] = array(
//                             'leaderbord_rank' => $positionInLeaderboard+1,
//                             'photo' => $photo,
//                             'author' => $ctx['members'][$photo->user_id]->username
//                         );
//                     }
//                 }
//                 // Meilleurs titres
//                 elseif ($categoryId == -3)
//                 {
//                     foreach($category['photos'] as $positionInLeaderboard => $photo)
//                     {
//                         $ctx['computeStep'][$categoryId]['photos'][] = array(
//                             'leaderbord_rank' => $positionInLeaderboard +1,
//                             'author' => $ctx['members'][$photo->user_id]->username,
//                             'photo' => $photo
//                         );

//                     }

//                 }
//             }

//         }
//         return $categories;
//     }
// }

// /**
//  * checkDiamant
//  * Retourne vraie si la première photo de la catégorie mérite un agpa de diamant
//  *
//  * @param $idCat, l'id de la catégorie
//  * @param $a, la première photo de la catégorie
//  * @param $b, la deuxième photo de la catégorie
//  *
//  * @return boolean, vraie si diamant, faux sinon
//  */
// if ( ! function_exists('checkDiamant'))
// {
//     function checkDiamant($idCat, $a, $b)
//     {
//         $idCat = ($idCat > 0) ? 0 : $idCat;
//         $result = false;
//         switch($idCat)
//         {
//             // Catégorie simple (1 à 8)
//             case 0 :
//             if ( $a->g_score > 50000 and
//                  $a->g_score > 2 * $b->g_score)
//             $result = true;
//             break;

//             // Hors catégorie : meilleure titre
//             case -3 :
//             if ( $a->scoreTitle >= 2*  $b->scoreTitle )
//             $result = true;
//             break;

//             // Hors catégorie : meilleure photo
//             case -2 :
//             if ( $a->g_score > 50000 and
//                  $a->g_score > 2 * $b->g_score and
//                  $a->vote == $a->refRoot[$a->category_id]->judgesNumber-1)
//             $result = true;
//             break;

//             // Hors catégorie : meilleure photographe
//             case -1 :
// 			/*
//             // Si ses 4 meilleurs photos > 100 000 et si auteur des 3 meilleurs photos
//             if ( $a['sum4'] > 100000 and
//                  $a->refRoot[-2]['photos'][0]['user_id'] == $a['IdPhotographe'] and
//                  $a->refRoot[-2]['photos'][1]['user_id'] == $a['IdPhotographe'] and
//                  $a->refRoot[-2]['photos'][2]['user_id'] == $a['IdPhotographe']
//                  )
// 				$result = true;

//             // si il totalise 33 point au palmares actuel (sans conversion agpa diamant)
//             if ($a['ActualWinners'] >= 33)
// 				$result = true;
// 				*/
// 				$result = false;
//             break;
//         }
//         return $result;
//     }
// }

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
