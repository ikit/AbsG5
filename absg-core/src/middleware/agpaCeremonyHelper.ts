


// /**
// * ceremonyOnline
// * La cérémonie de remise des AGPA online
// * @param $ctx [array], le contexte des agpa
// * @param $category [int], la catégorie en cours
// * @param $step [int] l'étape courante : 0=Présentation, 1=nominés, 2=Bronze, 3=argent, 4=or/diamant
// */
// if ( ! function_exists('ceremonyOnline'))
// {
//     function ceremonyOnline(&$ctx, $year, $category, $step)
//     {
// 		$CI = get_instance();
// 		$data = array();
		
// 		// On récupère les données
// 		$sql  = "SELECT a.year, a.award, a.photo_id, a.category_id, p.title, p.filename, p.ranking,  u.user_id, u.username, up.rootfamilly ";
// 		$sql .= "FROM agpa_awards a ";
// 		$sql .= "INNER JOIN agpa_categories c ON a.category_id=c.category_id ";
// 		$sql .= "INNER JOIN absg_users u ON a.author_id=u.user_id ";
// 		$sql .= "INNER JOIN agenda_people up ON u.people_id=up.people_id ";
// 		$sql .= "LEFT JOIN agpa_photos p ON a.photo_id = p.photo_id ";
        
//         // On détermine la date limite
// 		$maxYear = date("Y");
// 		if ($ctx['current_phase'] <= 4) $maxYear--;
	    
//         // On affiche le palmarès de quelle année ?    
// 		if ($year <= 0 || $year > $maxYear)
// 		{
// 			$year = $maxYear;
// 		}
// 		$sql .= "WHERE a.year=$maxYear AND a.category_id=$category ";
// 		$sql .= "ORDER BY  p.ranking ASC";
	
// 		// On récupère les données de l'édition terminée
//         $data = $CI->db->query($sql)->result();

		
// 		return $data;
// 	}
	
// }








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






