import { getRepository } from "typeorm";
import { AgpaPhoto, AgpaCategory, User } from "../entities";
import { checkValidYear, getCurrentEdition, getPhasesBoundaries } from "./agpaCommonHelpers";
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

/**
 * Récupère l'ensemble des données palmares pour une période demandé
 * @param from  première année prise en compte (par défaut 2006)
 * @param to  dernière année à prendre en compte (par défaut l'année de la dernière édition terminée)
 */
export async function palmaresData(from: number = null, to: number = null) {
    from = checkValidYear(from, 2006);
    to = checkValidYear(to);
    // On récupère le contexte sql
    const repo = getRepository(AgpaPhoto);
    // On récupère les données
    let sql = `SELECT a.year, a.award, a."photoId", a."categoryId", c.title as "catTitle", c.order, c.color, p.title, p.filename, a."userId", u.username, u."rootFamily"
        FROM agpa_award a
        INNER JOIN agpa_category c ON a."categoryId" = c.id
        INNER JOIN public."user" u ON a."userId" = u.id
        INNER JOIN person up ON u."personId" = up.id
        LEFT JOIN agpa_photo p ON a."photoId" = p.id 
        ORDER BY a."categoryId" ASC, a.year ASC`;
    let result = await repo.query(sql);

    const tmp = new Map<number, AgpaPalmares>();
    for (const a of result) {
        if (a.userId in tmp) {
            tmp[a.userId].addAward(a);
        } else {
            tmp[a.userId] = new AgpaPalmares(a.userId, from, to);
            tmp[a.userId].username = a.username;
            tmp[a.userId].rootFamily = a.rootFamily;
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

    // On récupère la participation de chaque photographe
    sql = `SELECT "userId", COUNT(DISTINCT(year)) as total, MIN(year) as first, MAX(year) as last
        FROM agpa_photo GROUP BY "userId"`;
    const participation = await repo.query(sql);
    for (const row of participation) {
        const item = result.find(e => e.userId === row.userId);
        if (item) {
            item.participation = { total: row.total, first: row.first, last: row.last };
        }
    }

    console.log(result)

    return result;
}
