import { getRepository } from "typeorm";
import { AgpaPhoto } from "../entities";
import { getMetaData } from "./agpaCommonHelpers";

/**
 * Récupère les informations pour présenter la cérémony des AGPA en ligne
 * @param year
 */
export async function ceremonyData(year: number) {
    // On récupère les photos
    const repo = getRepository(AgpaPhoto);
    const meta = await getMetaData(year);

    // Init data
    const edition = {
        stats: { totalPhotos: 0, totalAuthors: 0 },
        categories:
            year < 2012
                ? {
                      "1": { nominated: [] },
                      "2": { nominated: [] },
                      "3": { nominated: [] },
                      "4": { nominated: [] },
                      "5": { nominated: [] },
                      "6": { nominated: [] },
                      "-2": { nominated: [] },
                      "-1": { nominated: [] }
                  }
                : {
                      "1": { nominated: [] },
                      "2": { nominated: [] },
                      "3": { nominated: [] },
                      "4": { nominated: [] },
                      "5": { nominated: [] },
                      "6": { nominated: [] },
                      "7": { nominated: [] },
                      "8": { nominated: [] },
                      "-4": { nominated: [] },
                      "-3": { nominated: [] },
                      "-2": { nominated: [] },
                      "-1": { nominated: [] }
                  },
        authors: []
    };
    for (const catId in edition.categories) {
        edition.categories[catId].title = meta.categories[catId].title;
    }

    // On récupère les photos de chaque catégories
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", u.username 
        FROM agpa_award a
        LEFT JOIN agpa_photo p ON p.id = a."photoId"
        INNER JOIN "user" u ON u.id = p."userId" 
        WHERE a.year=${year} 
        ORDER BY a."categoryId" ASC, a.award DESC`;
    // On récupère les données, on ne conserve que les 5 meilleures photos par catégories
    const result = await repo.query(sql);
    for (const p of result) {
        if (p.award === "honor") {
            edition.categories[-4].nominated.push(p);
        } else {
            edition.categories[p.awardCategory].nominated.push(p);
        }
    }

    // On récupère les meilleurs photographes
    sql = `SELECT a."userId", u.username, a.award
        FROM agpa_award a 
        INNER JOIN "user" u ON u.id = a."userId" 
        WHERE "categoryId"=-1 AND year=${year}
        ORDER BY "year" DESC, a."award" DESC `;
    edition.categories[-1].nominated = await repo.query(sql);

    sql = `SELECT DISTINCT(p."userId"), u.username
        FROM agpa_photo p 
        INNER JOIN "user" u ON u.id = p."userId" 
        WHERE p.year=${year}`;
    edition.authors = await repo.query(sql);

    // On récupère les données
    sql = `SELECT year, COUNT(DISTINCT(id)) AS total FROM agpa_photo GROUP BY year ORDER BY year ASC`;
    edition.stats.totalPhotos = await repo.query(sql);
    sql = `SELECT year, COUNT(DISTINCT("userId")) AS total FROM agpa_photo GROUP BY year ORDER BY year ASC`;
    edition.stats.totalAuthors = await repo.query(sql);

    return edition;
}

// /**
//  * analyseHC1
//  * Effectue l'analyse necessaire pour afficher le resume du Hors Categorie (-1)
//  * En profite pour retourner le nombre de participant
//  *
//  * @param $infos,   [array] les donnees de la categorie HC1 (meilleur photographe)
//  *                  a analyser
//  *
//  */
// if ( ! function_exists('analyseHC1'))
// {
//     function analyseHC1( $infos)
//     {
//         global $template, $AGPA_MEMBERS, $AGPA_CATEGORIES, $AGPA_PHOTOS;

//         // Get Avatar of the winner
//         $avatar = '';
//         $avatar_type = $AGPA_MEMBERS[$infos['author']]['user_avatar_type'];
//         if ( $avatar_type == 3 )
//             $avatar = "{$phpbb_root_path}images/avatars/gallery/".$AGPA_MEMBERS[$infos['author']]['user_avatar'];
//         else
//             $avatar = "{$phpbb_root_path}images/avatars/upload/".$AGPA_MEMBERS[$infos['author']]['user_avatar'];

//         // Compter le nombre de photos du photographes et les points récoltés
//         $photosScore = 0;
//         $photosNumber = 0;
//         foreach($AGPA_PHOTOS as $catId => $category)
//             foreach($category as $photo)
//             {
//                 if ($photo['user_id'] == $infos['author'] && $catId != -2)
//                 {
//                     $photosScore += $photo['score'];
//                     ++$photosNumber;
//                 }
//             }

//         $template->assign_vars(array(
//             'PHOTOGRAPHER_AVATAR'     => $avatar,
//             'PHOTOGRAPHER_AWARD'      => ($infos['award'] == 'diamant') ? 'AGPA de diamant' : 'AGPA d\'or',
//             'PHOTOGRAPHER_NAME'       => $AGPA_MEMBERS[$infos['author']]['username'],
//             'PHOTOGRAPHER_NBR_PHOTOS' => $photosNumber,
//             'PHOTOGRAPHER_SCORE'      => $photosScore)
//         );
//     }
// }

// /**
//  * analyseHC2
//  * Effectue l'analyse necessaire pour afficher le resume du Hors Categorie (-2)
//  * En profite pour retourner le nombre de photos postees
//  *
//  * @param $infos,   [array] les donnees de la categorie HC1 (meilleur photographe)
//  *                  a analyser
//  */
// if ( ! function_exists('analyseHC2'))
// {
//     function analyseHC2( $infos)
//     {
//         global $template, $AGPA_MEMBERS, $AGPA_CATEGORIES, $AGPA_PHOTOS;

//         // retrieve Photography
//         $photo;
//         foreach($AGPA_PHOTOS as $category)
//         {
//             if (isset($category[$infos['photo']]))
//             {
//                 $photo = $category[$infos['photo']];
//             }
//         }

//         // Set template data
//         $template->assign_vars(array(
//             'PHOTOGRAPHY_URL_FULLSCR'  => AGPA_PATH_PHOTOS.$infos['year'].'/mini/'.$photo['filename'],
//             'PHOTOGRAPHY_URL_THUMB'    => AGPA_PATH_PHOTOS.$infos['year'].'/mini/vignette_'.$photo['filename'],
//             'PHOTOGRAPHY_TITLE'        => $photo['title'],
//             'PHOTOGRAPHY_AWARD'        => ($infos['award'] == 'diamant') ? 'AGPA de diamant' : 'AGPA d\'or',
//             'PHOTOGRAPHY_AUTHOR'       => $AGPA_MEMBERS[$infos['author']]['username'],
//             'PHOTOGRAPHY_SCORE'        => $photo['score'])
//         );
//     }
// }

// /**
//  * analyseSC
//  * Effectue l'analyse necessaire pour afficher le resume d'une Categorie simple (1 a 6 par exemple)
//  *
//  * @param $infos      [array]   les infos sur la photos nominées
//  *
//  * @return -
//  */
// if ( ! function_exists('analyseSC'))
// {
//     function analyseSC( $infos )
//     {
//         global $template, $AGPA_MEMBERS, $AGPA_CATEGORIES, $AGPA_PHOTOS;

//         $photo = $AGPA_PHOTOS[$infos['category']][$infos['photo']];
//         $place = array('diamant' => 1, 'or' => 1, 'argent' => 2, 'bronze' => 3);
//         // contruction du template !
//         $template->assign_block_vars('categories.photos', array(
//             'LAST'          => ($infos['award'] == 'bronze') ? true : false,
//             'AWARD'         => $infos['award'],
//             'URL_THUMB'     => AGPA_PATH_PHOTOS.$infos['year'].'/mini/vignette_'.$photo['filename'],
//             'URL_FULLSCR'   => AGPA_PATH_PHOTOS.$infos['year'].'/mini/'.$photo['filename'],
//             'URL_ORIGINAL'  => AGPA_PATH_PHOTOS.$infos['year'].'/'.$photo['filename'],
//             'RESOLUTION'    => $photo['resolution'],
//             'WEIGHT'        => $photo['weight'],
//             'TITLE'         => $photo['title'],
//             'AUTHOR'        => $AGPA_MEMBERS[$infos['author']]['username'],
//             'SCORE'         => $photo['score'].' ('.$photo['votes'].' vote'.(($photo['votes']>1)?'s':'').')',
//             'PLACE'         => $place[$infos['award']])
//         );
//     }
// }
