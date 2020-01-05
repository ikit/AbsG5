import { getRepository } from "typeorm";
import { AgpaPhoto, AgpaCategory } from "../entities";
import { getCurrentEdition, getPhasesBoundaries } from "./agpaCommonHelpers";
import { AgpaPalmares } from "./model/AgpaPalmares";

// // PALMARES -----------------------------------------------------------------------------------------------------------------------------------------

// /**
//  * buildPalmaresMenu
//  * Construit la requête sql qui permettra de récupérer les infos palmarès a afficher en fonction des filtres
//  *
//  * @param $ctx [array], le contexte avec toutes les infos nécessaire.
//  * @param $feature 	[string]
//  * @param user  [dynamic]	si int : user_id (0 = current user)
//  *			 		si string : { 'gueudelot', 'guyomard', 'guibert'}
//  * @param year	[int]		si int : year (0 = all)
//  *
//  *
//  * @return [array]
//  */
// if ( ! function_exists('buildPalmaresMenu'))
// {
//     function buildPalmaresMenu(&$ctx, $feature, user, year )
//     {
//         $CI = get_instance();
// 		$menu = array(
// 			'features' => array(
// 				'ranking' => 'Classement',
// 				'palmares' => 'Palmares'
// 			),
// 			'select' => array(
// 				'features'=> $feature,
// 				'userFilter' => user,
// 				'yearFilter' => year
// 			)
// 		);

// 		// On construit le menu user
// 		$members = array();
// 		foreach($ctx['members'] as $member)
// 		{
// 			if (!empty($member->rootfamilly))
// 			{
// 				$members[$member->rootfamilly][$member->user_id] = $member->username;
// 			}
// 		}

// 		asort($members['gueudelot']);
// 		asort($members['guibert']);
// 		asort($members['guyomard']);
// 		$menu['userFilter'] = $members;

// 		// On construit les années
// 		$menu['yearFilter'] = array(0=> 'Global');

// 		// On détermine la date limite
// 		$maxYear = date("Y");
// 		if ($ctx['current_phase'] <= 4) $maxYear--;

// 		for($i=$maxYear; $i>= 2006; $i--)
// 		{
// 			$menu['yearFilter'][$i] = $i;
// 		}

// 		return $menu;
//     }
// }


/**
 * Retourne le nombre de point palmares correspondant à une récompense
 *
 * @param award, le type de l'award (lice, bronze, argent, or, diamant)
 * @return la valeur en point
 */
export function palmaresPoints(award: string) {
    const palmaresPoints = {
        diamond: 5,
        gold: 4,
        sylver: 3,
        bronze: 2,
        nominated: 1
    };
    return award in palmaresPoints ? palmaresPoints[award] : 0;
}


export async function palmaresData(user: string, year: number) {
    // On récupère le contexte sql
    const repo = getRepository(AgpaPhoto);
    // On récupère les données
    let sql = `SELECT a.year, a.award, a."photoId", a."categoryId", c.title as "catTitle", c.order, c.color, p.title, p.filename, a."userId", u.username, u."rootFamily"
        FROM agpa_award a
        INNER JOIN agpa_category c ON a."categoryId" = c.id
        INNER JOIN public."user" u ON a."userId" = u.id
        INNER JOIN person up ON u."personId" = up.id
        LEFT JOIN agpa_photo p ON a."photoId" = p.id `;

    // On affiche les palmarès de qui ?
    if (user == "gueudelot" || user == "guibert" || user == "guyomard") {
        sql += `WHERE u."rootFamily"='${user} '`;
    } else {
        const userId = Number.parseInt(user);
        if (userId) {
            sql += `WHERE a."userId"=${user} `;
        }
    }

    // On détermine la date limite
    let maxYear = getCurrentEdition();
    const phases = getPhasesBoundaries();
    if (phases[4].startDate > new Date()) {
        maxYear -= 1;
    }

    // On affiche le palmarès de quelle année ?
    if (year > 0 && year <= maxYear) {
        sql += `AND a.year=${year} `;
    } else {
        sql += `AND a.year<=${maxYear} `;
        year = 0;
    }
    sql += `ORDER BY a."categoryId" ASC, a.year ASC`;
    let result = await repo.query(sql);

    const tmp = new Map<number, AgpaPalmares>();
    for (const a of result) {
        if (a.userId in tmp) {
            tmp[a.userId].addAward(a);
        } else {
            tmp[a.userId] = new AgpaPalmares(a.userId, year !== 0 ? year : 2006, year !== 0 ? year : maxYear);
            tmp[a.userId].username = a.username;
            tmp[a.userId].addAward(a);
        }
    }

    // On reforme sous forme de liste le palmarès
    result = [];
    for (const k in tmp) {
        result.push(tmp[k]);
    }

    // On trie par ordre décroissant
    result.sort((a: { totalPoints: number }, b: { totalPoints: number }) => {
        return b.totalPoints - a.totalPoints;
    });

    return {
        data: result,
        filer: {
            user,
            year
        },
        selectedUser: null
    };
}

// ARCHIVES -----------------------------------------------------------------------------------------------------------------------------------------

/**
 * Récupère les infos de chaque édition à afficher pour le sommaire des archives
 *
 * @return any
 */
export async function archiveSummary(): Promise<any> {
    const archivesSummary = [];
    // On récupère les photos et met à jour le contexte
    const repo = getRepository(AgpaPhoto);

    // On récupère les meilleures photos de chaque éditions
    const photos = new Map<number, AgpaPhoto[]>();
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", a."userId" from agpa_photo p
        INNER JOIN agpa_award a ON p.id = a."photoId"
        WHERE a."categoryId" = -2 
        ORDER BY p.year DESC, p.gscore DESC`;
    // On récupère les données
    let result = await repo.query(sql);
    for (const row of result) {
        const p = new AgpaPhoto();
        p.fromJSON(row);
        if (photos.has(p.year)) {
            photos.get(p.year).push(p);
        } else {
            photos.set(p.year, [p]);
        }
    }

    // On récupère les meilleurs photographes
    const authors = new Map<number, any[]>();
    sql = `SELECT a.year, a."userId" as id, u.username as firstname, a.award 
        FROM agpa_award a 
        INNER JOIN "user" u ON u.id = a."userId" 
        WHERE "categoryId"=-1 
        ORDER BY "year" DESC, a."award" DESC `;
    result = await repo.query(sql);
    for (const row of result) {
        if (authors.has(row.year)) {
            authors.get(row.year).push(row);
        } else {
            authors.set(row.year, [row]);
        }
    }

    // On récupère les données
    sql = `SELECT year, count(*) AS photos FROM agpa_photo GROUP BY year ORDER BY year DESC`;
    result = await repo.query(sql);
    for (const row of result) {
        archivesSummary.push({
            year: row.year,
            totalPhotos: +row.photos,
            photos: photos.has(row.year) ? photos.get(row.year) : [],
            authors: authors.has(row.year) ? authors.get(row.year) : []
        });
    }

    return archivesSummary;
}

/**
 * Récupère les infos d'une édition donnée pour afficher son résumé
 *
 * @return any
 */
export async function archiveEdition(year: number): Promise<any> {
    // On récupère les photos
    const repo = getRepository(AgpaPhoto);

    // Init data
    const edition = {
        categories:
            year < 2012
                ? {
                      "1": { photos: [], mines: [] },
                      "2": { photos: [], mines: [] },
                      "3": { photos: [], mines: [] },
                      "4": { photos: [], mines: [] },
                      "5": { photos: [], mines: [] },
                      "6": { photos: [], mines: [] },
                      "-2": { photos: [], mines: [] },
                      "-1": []
                  }
                : {
                      "1": { photos: [], mines: [] },
                      "2": { photos: [], mines: [] },
                      "3": { photos: [], mines: [] },
                      "4": { photos: [], mines: [] },
                      "5": { photos: [], mines: [] },
                      "6": { photos: [], mines: [] },
                      "7": { photos: [], mines: [] },
                      "8": { photos: [], mines: [] },
                      "-3": { photos: [], mines: [] },
                      "-2": { photos: [], mines: [] },
                      "-1": []
                  },
        authors: []
    };

    // On récupère les photos de chaque catégories
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", u.username 
        FROM agpa_photo p
        INNER JOIN "user" u ON u.id = p."userId" 
        LEFT JOIN agpa_award a ON p.id = a."photoId"
        WHERE p.year=${year} AND p."categoryId" > 0
        ORDER BY p.gscore DESC`;
    // On récupère les données, on ne conserve que les 5 meilleures photos par catégories
    let result = await repo.query(sql);
    for (const row of result) {
        const p = new AgpaPhoto();
        p.fromJSON(row);
        edition.categories[p.categoryId].photos.push(p);
        if (p.user.id == 2) {
            // TODO: do it with authenticated session user
            edition.categories[p.categoryId].mines.push(p);
        }
    }

    // On récupère les meilleurs photographes
    const authors = [];
    sql = `SELECT a."userId" as id, u.username as firstname, a.award 
        FROM agpa_award a 
        INNER JOIN "user" u ON u.id = a."userId" 
        WHERE "categoryId"=-1 AND year=${year}
        ORDER BY "year" DESC, a."award" DESC `;
    result = await repo.query(sql);
    for (const row of result) {
        authors.push(row);
    }
    edition.authors = authors;

    // On récupère les données
    sql = `SELECT count(*) AS total FROM agpa_photo WHERE year=${year} GROUP BY year ORDER BY year DESC`;
    result = await repo.query(sql);

    return edition;
}

/**
 * Récupère les infos d'une catégorie pour afficher ses détails
 */
export async function archiveCategory(year: number, catId: number) {
    const category = {
        totalPhotos: 0,
        totalUsers: 0,
        photos: null
    };
    // On récupère les photos et met à jour le contexte
    const users = [];
    const photos = new Map<number, AgpaPhoto>();
    const repo = getRepository(AgpaPhoto);

    // On récupère les photos
    const sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", u.username 
        FROM agpa_photo p
        LEFT JOIN agpa_award a ON p.id = a."photoId"
        INNER JOIN "user" u ON u.id = p."userId" 
        WHERE p.year=${year} AND p."categoryId"=${catId}
        ORDER BY p.gscore DESC`;
    // On récupère les données
    const result = await repo.query(sql);
    for (const row of result) {
        const p = new AgpaPhoto();
        p.fromJSON(row);

        if (photos.has(p.id)) {
            photos.get(p.id).awards.set(row.awardCategory, row.award);
        } else {
            photos.set(p.id, p);
        }

        if (!(p.user.id in users)) {
            category.totalUsers += 1;
            users.push(p.user.id);
        }
    }
    category.photos = Array.from(photos.values());
    category.totalPhotos = category.photos.length;

    return category;
}

