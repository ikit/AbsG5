import { getRepository } from "typeorm";
import { AgpaPhoto, AgpaCategory } from "../entities";


// // PALMARES -----------------------------------------------------------------------------------------------------------------------------------------





// /**
//  * getPalmaresData
//  * Construit la requête sql qui permettra de récupérer les infos palmarès a afficher en fonction des filtres
//  *
//  * @param $ctx [array], le contexte avec toutes les infos nécessaire.
//  * @param $filter_user      [dynamic]   si int : user_id (0 = current user)
//  *					si string : { 'gueudelot', 'guyomard', 'guibert'}
//  * @param $filter_year	    [dynamic]   si int : year (0 = all)
//  *                                        
//  * 
//  * @return [array] 
//  */
// if ( ! function_exists('getPalmaresData'))
// {
//     function getPalmaresData(&$ctx, $filter_user, $filter_year )
//     {
//         $CI = get_instance();
// 		$data = array();
		
		

		
// 		// On récupère les données
// 		$sql  = "SELECT a.year, a.award, a.photo_id, a.category_id, p.title, p.filename, u.user_id, u.username, up.rootfamilly ";
// 		$sql .= "FROM agpa_awards a ";
// 		$sql .= "INNER JOIN agpa_categories c ON a.category_id=c.category_id ";
// 		$sql .= "INNER JOIN absg_users u ON a.author_id=u.user_id ";
// 		$sql .= "INNER JOIN agenda_people up ON u.people_id=up.people_id ";
// 		$sql .= "LEFT JOIN agpa_photos p ON a.photo_id = p.photo_id ";
		
// 		// On affiche les palmarès de qui ?
//         if ($filter_user == 'gueudelot' || $filter_user == 'guibert' || $filter_user == 'guyomard')
//         {
// 			$sql .= "WHERE up.rootfamilly='$filter_user'";
// 			$data['palmaresUserData'] = array();
// 			$data['palmaresUserData']['displayAuthor'] = true;
// 			$data['palmaresUserData']['username'] = ucfirst($filter_user);
// 			$data['palmaresUserData']['fromUser'] = 'de la famille ' . ucfirst($filter_user);
// 			$data['palmaresUserData']['avatar'] = '';
// 			$data['palmaresUserData']['forYear'] = ($filter_year === 0) ? '' : $filter_year;
//         }
//         else
//         {
// 			$user_id = ($filter_user > 0) ? $filter_user : $user->user_id;
// 			$sql .= "WHERE author_id=$user_id ";
//         }
        
        
//         // On détermine la date limite
// 		$maxYear = date("Y");
// 		if ($ctx['current_phase'] <= 4) $maxYear--;
			
			
// 			// On affiche le palmarès de quelle année ?    
// 		if ($filter_year > 0 && $filter_year <= $maxYear)
// 		{
// 			$sql .= "AND a.year=$filter_year ";
// 		}
// 		else
// 		{
// 			$sql .= "AND a.year<=$maxYear ";
// 			$filter_year = 0;
// 		}
// 		$sql .= "ORDER BY a.category_id ASC, a.year ASC";
// 		$result = $CI->db->query($sql)->result();
			
// 		// On parse les résultats pour construire : le tableau résumé, calculer les scores totaux et partiels, ainsi que le tableau par catégories
// 		$resume = array();
// 		foreach ($CI->ctx['categories'] as $cat)
// 		{
// 			$resume[$cat->category_id] = array('totalAgpa' => 0, 'totalPoints' => 0);
// 		}
		
// 		$totalPoints = 0;
// 		foreach ($result as $row)
// 		{
// 			if (!isset($resume[$row->category_id][$row->award]))
// 			{
// 				$resume[$row->category_id][$row->award] = array();
// 			}
// 			$resume[$row->category_id][$row->award][] = array('year' => $row->year, 'photo_id' => $row->photo_id, 'filename' => $row->filename, 'title' => $row->title, 'user_id' => $row->user_id, 'username' => $row->username, 'avatar' => $CI->layout->asset_avatar_url($row->user_id));
			
// 			$resume[$row->category_id]['totalPoints'] += getPalmaresPoint($row->category_id, $row->award);
// 			$totalPoints += getPalmaresPoint($row->category_id, $row->award);
// 			if ($row->award != 'lice')
// 			{
// 				$resume[$row->category_id]['totalAgpa'] ++; 
// 			}
			
// 			if (!isset($data['palmaresUserData']))
// 			{
// 				$data['palmaresUserData'] = array();
// 				$data['palmaresUserData']['displayAuthor'] = false;
// 				$data['palmaresUserData']['forYear'] = ($filter_year === 0) ? '' : $filter_year;
// 				$data['palmaresUserData']['username'] = $row->username;
// 				$data['palmaresUserData']['fromUser'] = fromUsername($row->username);
// 				$data['palmaresUserData']['avatar'] = $CI->layout->asset_avatar_url($row->user_id);
// 			}
// 		}
			
			
// 		$data['filterYear'] = $filter_year;
// 		$data['maxYear'] = $maxYear;
// 		$data['resumeTotal'] = $totalPoints;
// 		$data['resume'] = $resume;
        
//         return $data;
//     }
// }




// /**
//  * buildPalmaresMenu
//  * Construit la requête sql qui permettra de récupérer les infos palmarès a afficher en fonction des filtres
//  *
//  * @param $ctx [array], le contexte avec toutes les infos nécessaire.
//  * @param $feature 	[string]	
//  * @param $filter_user  [dynamic]	si int : user_id (0 = current user)
//  *			 		si string : { 'gueudelot', 'guyomard', 'guibert'}
//  * @param $filter_year	[int]		si int : year (0 = all)
//  *                                        
//  * 
//  * @return [array] 
//  */
// if ( ! function_exists('buildPalmaresMenu'))
// {
//     function buildPalmaresMenu(&$ctx, $feature, $filter_user, $filter_year )
//     {
//         $CI = get_instance();
// 		$menu = array(
// 			'features' => array(
// 				'ranking' => 'Classement',
// 				'palmares' => 'Palmares'
// 			),
// 			'select' => array(
// 				'features'=> $feature,
// 				'userFilter' => $filter_user,
// 				'yearFilter' => $filter_year
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






// ARCHIVES -----------------------------------------------------------------------------------------------------------------------------------------




/**
 * archiveSummary
 * Récupère les infos a afficher pour le menu des archives
 *
 * @return les infos pour construire le menu principal des archives
 */
export async function archiveSummary(): Promise<any>
{
    const archivesSummary = [];
    // On récupère les photos et met à jour le contexte 
    const repo = getRepository(AgpaPhoto);

    // On récupère les meilleures photos (avec agpa) de chaque éditions

    // On récupère les meilleures photos de chaque éditions
    const photos = new Map<Number, AgpaPhoto[]>();
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", a."userId" from agpa_photo p
        INNER JOIN agpa_award a ON p.id = a."photoId"
        WHERE a."categoryId" = -2 
        ORDER BY p.year DESC, p.gscore DESC`;
    // On récupère les données
    let result = await repo.query(sql);
    for (const row of result)
    {
        const p = new AgpaPhoto();
        p.fromJSON(row);
        if (photos.has(p.year)) {
            photos.get(p.year).push(p);
        } else {
            photos.set(p.year, [p]);
        }
    }
    
    // On récupère les meilleurs photographes
    const authors = new Map<Number, any[]>();
    sql = `SELECT a.year, a."userId" as id, u.username as firstname, a.award 
        FROM agpa_award a 
        INNER JOIN "user" u ON u.id = a."userId" 
        WHERE "categoryId"=-1 
        ORDER BY "year" DESC, a."award" DESC `;
    result = await repo.query(sql);
    for (const row of result)
    {
        if (authors.has(row.year)) {
            authors.get(row.year).push(row);
        } else {
            authors.set(row.year, [row]);
        }
    }

    // On récupère les données
    sql = `SELECT year, count(*) AS photos FROM agpa_photo GROUP BY year ORDER BY year DESC`;
    result = await repo.query(sql);
    for (const row of result)
    {
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
 * archiveEdition
 * Récupère les infos a afficher pour le sommaire des archives d'une édition donnée
 *
 * @return les infos pour construire le menu des archives de l'édition demandée
 */
export async function archiveEdition(year: number): Promise<any>
{
    // On récupère les photos et met à jour le contexte 
    const repo = getRepository(AgpaPhoto);

    // On récupère les meilleures photos (avec AGPA) pour chaque éditions
    const photos = [];
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", a."userId" from agpa_photo p
        INNER JOIN agpa_award a ON p.id = a."photoId"
        WHERE p.year=${year}
        ORDER BY p.year DESC, p."categoryId" ASC, a.award ASC`;
    // On récupère les données
    let result = await repo.query(sql);
    for (const row of result)
    {
        const p = new AgpaPhoto();
        p.fromJSON(row);
        photos.push(p);
    }
    
    // On récupère les meilleurs photographes
    const authors = [];
    sql = `SELECT a."userId" as id, u.username as firstname, a.award 
        FROM agpa_award a 
        INNER JOIN "user" u ON u.id = a."userId" 
        WHERE "categoryId"=-1 AND year=${year}
        ORDER BY "year" DESC, a."award" DESC `;
    result = await repo.query(sql);
    for (const row of result)
    {
        authors.push(row);
    }

    // On récupère les données
    sql = `SELECT count(*) AS total FROM agpa_photo WHERE year=${year} GROUP BY year ORDER BY year DESC`;
    result = await repo.query(sql);
    return {
        year: year, 
        totalPhotos: +result[0].total,
        photos: photos,
        authors: authors
    };
}



export async function archiveCategory(year: number, catId: number) {
    const category = {
        totalPhotos: 0,
        totalUsers: 0,
        photos: null
    };
    // On récupère les photos et met à jour le contexte 
    const users = [];
    const photos = new Map<Number, AgpaPhoto>();
    const repo = getRepository(AgpaPhoto);

    // On récupère les photos pour chaque éditions
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", u.username 
        FROM agpa_photo p
        LEFT JOIN agpa_award a ON p.id = a."photoId"
        INNER JOIN "user" u ON u.id = p."userId" 
        WHERE p.year=${year} AND p."categoryId"=${catId}
        ORDER BY p.ranking ASC`;
    // On récupère les données
    let result = await repo.query(sql);
    for (const row of result)
    {
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
// const maxYear = new Date().getFullYear();

// if ($year >= 2006 && $year < $maxYear)
//     {
//         // On recupere toutes les donnees sur les photos de cette annee la
//         $AGPA_PHOTOS = initAGPA($year);

//         // Donnees generales du template
//         $l_title = 'AGPA - Les archives de l\'&eacute;dition '.$year;

//         $navbar[2] = array('Edition '.$year, append_sid("{$phpbb_root_path}agpa.$phpEx", "section=archives&amp;year=$year"));
//         $template->assign_vars(array('SOMMAIRE_ARCHIVES' => false));
        
        
//         // Analyser les principaux resultat pour l'annee $annee
//         $sql = "SELECT * FROM agpa_awards WHERE year = $year  ORDER BY category ASC, award ASC";
//         $result = $db->sql_query($sql);
        
//         // save informations about the edition
//         $infosEdition = array();
//         while ($row = $db->sql_fetchrow($result))
//         {
//             $infosEdition[$row['category']][$row['award']] = $row;
//         }
//         $db->sql_freeresult($result);
        
//         // foreach category, fill data template and complete some extra statistics
//         $usersNumber = 0;
//         $photosNumber = 0;
//         foreach ($infosEdition as $catId => $categoryInformations)
//         {
//             if ($catId == -1) // AGPA meilleur photographe
//             {
//                 if (isset($categoryInformations['diamant']))
//                 {
//                     analyseHC1( $categoryInformations['diamant'] );
//                 }
//                 else
//                 {
//                     analyseHC1( $categoryInformations['or'] );
//                 }
//             }
//             else if ($catId == -2) // AGPA de la meilleur photo
//             {
//                 if (isset($categoryInformations['diamant']))
//                 {
//                     analyseHC2( $categoryInformations['diamant'] );
//                 }
//                 else
//                 {
//                     analyseHC2( $categoryInformations['or'] );
//                 }
//             }
//             else // categorie normal
//             {
//                 $photosInTheCategory = 0;
//                 $photosNumber += sizeof($AGPA_PHOTOS[$catId]);
                
//                 $template->assign_block_vars('categories', array(
//                         'ID' => $catId,
//                         'TITLE'       => $ctx['categories'][$catId]['title'],
//                         'DESCRIPTION' => $ctx['categories'][$catId]['description'],
//                         'NBR_PHOTOS'  => $photosNumber,
//                         'SPECIAL'     => ($catId < 0) ? $catId : false)
//                     );
                
//                 // afficher les 3 meilleurs photos (ordre avec lequel on appel analyseSC est important)
//                 if (isset($categoryInformations['diamant']))
//                 {
//                     analyseSC( $categoryInformations['diamant'] );
//                 }
//                 else
//                 {
//                     analyseSC( $categoryInformations['or'] );
//                 }
//                 analyseSC( $categoryInformations['argent'] );
//                 analyseSC( $categoryInformations['bronze'] );
//             }

//         }
        
//         // TODO : récupérer le nombre de participant (requete SQL basique)
        
//         $template->assign_vars(array(
//             'EDITION_YEAR'     => $year,
//             'NBR_PHOTOS'       => $photosNumber,
//             'NBR_PHOTOGRAPHER' => $usersNumber)
//         );
//     }
//     else 
//     { 
//         // si pas d'annee precise, on considere qu'il s'agit de l'accueil des archives.
//         displayArchivesSummary(ctx, $page, 10);
//     }


// /**
//  * buildArchive
//  * Récupère les infos a afficher pour le menu des archives
//  *
//  * @param $ctx [array], le contexte avec toutes les infos nécessaire.
//  * @return $ctx [array] le contexte mis à jour avec les infos relatives aux anciennes éditions des agpas sélectionnée via les filtres
//  */
// if ( ! function_exists('buildArchive'))
// {
//     function buildArchive(&$ctx)
//     {
//         $CI = get_instance();

//         // On détermine la date limite
//         $maxYear = date("Y");
//         if ($ctx['current_phase'] <= 4) $maxYear --;
        
        
//         // On init les variables de filtre
//         $filters = $ctx['filters'];
//         $year = -1;
//         $category = -1;
//         $photographe = -1;
//         $family = -1;
//         $award = -1;
        

//         // On récupère les data en fonction des filtres
// 		$sql = "SELECT p.*, a.rootfamilly, w.award FROM agpa_photos p 
// 		INNER JOIN absg_users u ON p.user_id = u.user_id
// 		INNER JOIN agenda_people a ON a.people_id = u.people_id
// 		LEFT JOIN agpa_awards w ON w.photo_id = p.photo_id ";
	
// 		// La condition Where va être conditioné par le premier filtre
//     if (!isset($filters['f1_type']) || !isset ($filters['f1_value']))
//     {
//       $filters['f1_type'] = 'a';
//       $filters['f1_value'] = $maxYear;
//     }
   
// 		switch($filters['f1_type'])
//     {
// 			case 'a':
// 				$year = $filters['f1_value'];
// 				$year = ($year >= 2006 && $year <= $maxYear) ? $year : $maxYear;
// 				$sql .= "WHERE p.year = $year ";
        
// 				break;
// 			case 'c':
// 				$category = $filters['f1_value'];
// 				$sql .= "WHERE p.category_id = $category ";
// 				break;
// 			case 'p':
// 				$photographe = $filters['f1_value'];
// 				break;
// 			case 'f':
// 				$family = $filters['f1_value'];
// 				break;
// 			case 'w':
// 				$award = $filters['f1_value'];
// 				break;
//         }
//     if (isset($filters['f2_type']) && isset ($filters['f2_value']))
//     {
//   		switch($filters['f2_type'])
//   		{
//   			case 'c':
//   				$category = $filters['f2_value'];
//   				$sql .= "ORDER BY p.category_id ASC";
//   				break;
//   			case 'p':
//   				$photographe = $filters['f2_value'];
//   				$sql .= "ORDER BY u.username ASC";
//   				break;
//   			case 'w':
//   				$award = $filters['f2_value'];
//   				$sql .= "ORDER BY p.g_score DESC";
//   				break;
          
//   			case 'a':
//         default:
//           $filters['f2_type'] = 'a';
//   				$year = $filters['f2_value'];
//   				$sql .= "ORDER BY p.year DESC";
//   				break;
//   		}
//     }
			
		
		
// 		// On récupère les données
// 		$result = $CI->db->query($sql)->result();
		
// 		foreach($result as $row)
//     {
// 			if (!isset($infosEditions[$row->year][-1]->winners))
// 			{
// 			  $infosEditions[$row->year][-1]->winners = array();
// 			}
			
//       $infosEditions[$row->year][-1]->winners[] = $row;
//     }
		
// 		// l'organisation des données est conditionné par les deux filtres
		
		
//   }
// }






// /**
//  * afficher_sommaire_archives
//  * Affiche les résumés des éditions (sommaire des archives)
//  *
//  * @param $page,       [int] la page actuellement sélectionnée
//  * @param $maxPerPage, [int] le nombre d'édition à afficher par page
//  * 
//  */
// if ( ! function_exists('displayArchivesSummary'))
// {
//     function displayArchivesSummary(&$ctx, $page=0, $maxPerPage=10 )
//     {
//         $CI = get_instance(); 
// 		    $data = array();
        
//         // On détermine la date limite
//         $maxYear = date("Y");
//         if ($ctx['current_phase'] <= 4) $maxYear --;
        
        
//         // Les années des édition à afficher 
//         $lastEdition = max($maxYear - ($page) * $maxPerPage, 2006);
//         $oldestEdition = max(2006, $lastEdition - $maxPerPage);

//         // récupérer les données
//         $sql = "SELECT a.*, p.filename, p.title, p.photo_id FROM agpa_awards a
//             LEFT JOIN agpa_photos p ON a.photo_id = p.photo_id
//             WHERE a.year >= $oldestEdition AND a.year <= $lastEdition AND (a.award='diamant' OR a.award='or') 
//             ORDER BY a.year DESC, a.category_id ASC, a.award ASC";
//         $result = $CI->db->query($sql)->result();


//         // save informations about the edition
//         $infosEditions = array();
//         foreach($result as $idx => $row)
//         {
//             $infosEditions[$row->year][$row->category_id] = $row;
//         }

//         // On récupère les données spécifiques pour les hors cat -1 (meilleure photographe)
//         $sql = "SELECT * FROM agpa_awards 
//             WHERE year <= $lastEdition AND year >= $oldestEdition AND award<>'lice' 
//             AND category_id = -1 ORDER BY year DESC, category_id ASC";
//         $result = $CI->db->query($sql)->result();
        
        
//         foreach($result as $row)
//         {
// 			if (!isset($infosEditions[$row->year][-1]->winners))
// 			{
// 				$infosEditions[$row->year][-1]->winners = array();
// 			}
			
//             $infosEditions[$row->year][-1]->winners[] = $row;
//         }
        
//         // On met en forme les données pour l'affichage
//         foreach($infosEditions as $year => $edition)
//         {
// 			$data[$year] = array();
// 			$data[$year]['winners'] = array();
			
// 			foreach($edition[-1]->winners as $winner)
// 			{
				
// 				$data[$year]['winners'][orderAccordingToAward($winner->award)] = array(
// 					'name' => $ctx['members'][$winner->author_id]->username,
// 					'award' => $winner->award,
// 					'avatar' => $CI->layout->asset_avatar_url($winner->author_id)
// 				);
// 			}

// 			$data[$year]['bestPhoto_filename'] = $edition[-2]->filename;
// 			$data[$year]['bestPhoto_title'] = $edition[-2]->title;
// 			$data[$year]['diaporama'] = array();
			
// 			foreach($edition as $catId => $catData)
// 			{
// 				if ($catId > 0)
// 				{
// 					$data[$year]['diaporama'][] = array(
// 						'filename' => $catData->filename,
// 						'photoTitle' => $catData->title,
// 						'photoAward' => $catData->award,
// 						'category' => $catId
// 					);
// 				}
// 			}
//         }

//         return $data;
//     }

    
//     function orderAccordingToAward($award)
//     {
// 		switch($award)
// 		{
// 			case 'diamand':
// 			case 'or':
// 				return 0;
// 				break;
// 			case 'argent':
// 				return 1;
// 				break;
// 			case 'bronze':
// 				return 2;
// 				break;
// 		}
// 		return 10;
//     }
    
    
// }




// /**
//  * buildArchiveSQLQuery
//  * Construit la requete correspondant aux critere de selection et d'affichage voulus.
//  * Analyse des filtres :
//  * -> argument par paire : nom_filtre + valeur
//  * Ordre des filtres tres important : 1 > 2 > 3 > ...
//  *
//  * @param $filters,       [array] le nom des filtres qu'on souhaite appliquer {year, author, category}
//  * @param $values,        [array] la valeurs de ces filtres                   [int]  [int]   [int]
//  * @param $display,       [array] references vers les donnees des membres  {year, author, category, score, number, award}
//  *                                                                          desc  asc     asc       desc   asc     asc
//  * 
//  * @return [string1, string2n string3] 
//  *                            string1 => la requete sql correctement construite
//  *                            string2 => le texte a afficher décrivant les filtres appliquer pour sélectionner les photos 
//  */
// if ( ! function_exists('buildArchiveSQLQuery'))
// {
//     function buildArchiveSQLQuery(&$ctx, $filters)
//     {
//         $CI = get_instance(); 
// 		$data = array();
            
//         // construction de la requete mysql
//         $sql = "SELECT p.photo_id, p.year, p.category_id, p.user_id, p.filename, p.title, a.award FROM agpa_photos p LEFT JOIN agpa_awards a ON a.photo_id = p.photo_id ";
//         //    WHERE a.year >= $oldestEdition AND a.year <= $lastEdition AND (a.award='diamant' OR a.award='or') 
//         //    ORDER BY a.year DESC, a.category_id ASC, a.award ASC
//         $result = $CI->db->query($sql)->result();
        
//         // Selection des bonnes donnees
//         $first = true;
//         $titleFilters = '';
//         $numberOfFilters = sizeof($filters);
//         $displayFilter = array();
//         $titleDisplay = '';
        

//         // filter 1
//         switch($filters['f1_type'])
//         {
//     			case 'a':
//     				$year = $filters['f1_value'];
//                     $maxYear = $ctx['current_year'];
//     				$year = ($year >= 2006 && $year < $maxYear) ? $year : $maxYear - 1;
//     				$sql .= "WHERE p.year = $year ";
            
//                     $titleFilters .= 'Photos de l\'année '. $year;
//                     $displayFilter[] = 'year';
//     				break;
//     			case 'c':
//     				$category = $filters['f1_value'];
//     				$sql .= "WHERE p.category_id = $category ";


//                     $titleFilters .= 'Photos de la catégorie '.$ctx['categories'][$category]['title'];
//                     $displayFilter[] = 'category';
//     				break;
//     			case 'p':
//     				$photographe = $filters['f1_value'];

//                     $titleFilters .= 'Photos du photographe ' . $ctx['members'][$photographe]['username'];
//                     $displayFilter[] = 'author';
//     				break;
//     			case 'f':
//     				$family = $filters['f1_value'];
//                     $titleFilters .= 'Photos de la famille ' . $family;
//                     $displayFilter[] = 'family';
//     				break;
//     			case 'w':
//     				$award = $filters['f1_value'];
//                     $titleFilters .= "AGPA d\'" . $award;
//                     $displayFilter[] = 'award';
//     				break;
//         }
//         if (isset($filters['f2_type']) && isset ($filters['f2_value']) && trim($filters['f2_type']) != '' && trim($filters['f2_value']) != '')
//         {
//       		switch($filters['f2_type'])
//       		{
//       			case 'c':
//       				$category = $filters['f2_value'];
//       				$sql .= "AND p.category_id = $category ";
//                     $displayFilter[] = 'category';
//                     $titleFilters .= ' de la catégorie '. $category;
//       				break;
//       			case 'p':
//       				$photographe = $filters['f2_value'];
//       				$sql .= "AND p.author = $photographe ";
//                     $displayFilter[] = 'author';
//                     $titleFilters .= ' de '. $photographe;
//       				break;
//       			case 'w':
//       				$award = $filters['f2_value'];
//       				$sql .= "todo ";
//                     $displayFilter[] = 'award';
//       				break;
              
//       			case 'a':
//                 default:
//                     $filters['f2_type'] = 'a';
//       				$year = $filters['f2_value'];
//       				$sql .= "AND p.year = $year";
//                     $displayFilter[] = 'year';
//       				break;
//       		}
//         }
        
//         // Trie et affichage de la requete
//         $sql_order = '';
//         $first = true;
//         foreach ( $displayFilter as $df)
//         {
//             switch($df)
//             {
//                 case 'year':
//                     if (!$first) $sql_order .= ', ';
//                     $sql_order .= ' year ASC';
//                     $first = false;
//                 break;
//                 case 'author':
//                     if (!$first) $sql_order .= ', ';
//                     $sql_order .= ' user_id ASC';
//                     $first = false;
//                 break;
//                 case 'category':
//                     if (!$first) $sql_order .= ', ';
//                     $sql_order .= ' category_id ASC';
//                     $first = false;
//                 break;
//                 case 'score':
//                     if (!$first) $sql_order .= ', ';
//                     $sql_order .= ' score DESC';
//                     $first = false;
//                 break;
//                 case 'number':
//                     if (!$first) $sql_order .= ', ';
//                     $sql_order .= ' number ASC';
//                     $first = false;
//                 break;
//                 case 'award':
//                     if (!$first) $sql_order .= ', ';
//                     $sql_order .= ' ranking ASC';
//                     $first = false;
//                 break;
//             }
//         }
        
//         // Quel que soit les filtres precedant, on termine toujours par ordonner en fonction du score puis du numero attribue a la photo
//         if (!$first) { $sql_order .= ', '; }
//         $sql_order .= 'score ASC, number ASC';
        
        
//         $sql .= " ORDER BY $sql_order";
//         return array($sql,$titleFilters) ;
//     }
// }


// /**
//  * buildArchiveView
//  * trouve la vue a utiliser pour afficher les donnees en fonction des filtres choisis
//  *
//  * @param $filters,       [array] le nom des filtres qu'on souhaite appliquer {year, author, category}
//  * @param $values,        [array] la valeurs de ces filtres                   [int]  [int]   [int]
//  * @param $display,       [array] references vers les donnees des membres  {year, author, category, score, number, award}
//  *                                                                          desc  asc     asc       desc   asc     asc
//  * 
//  * @return string,          le nom de la vue
//  */
// if ( ! function_exists('buildArchiveView'))
// {
//     function buildArchiveView(&$ctx, $filters)
//     {
//         $CI = get_instance(); 
//         $data = array();
            
//         $view = '';
        

//         if (isset($filters['f2_type']) && trim($filters['f2_type']) != '')
//         {
//             $view = $filters['f2_type'];
//         }
//         else
//         {
//             $view = 'Menu';
//         }

//         if (isset($filters['f1_type']) && trim($filters['f1_type']) != '')
//         {
//             $view = $filters['f1_type'];
//         }
//         else
//         {
//             $view = 'a';
//         }


//         return $view ;
//     }
// }

