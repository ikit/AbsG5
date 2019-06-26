
// /**
//  * actualPhase1
//  * Gère la phase 1 de l'édition actuelle : Enregistrement / Edition de ses photos
//  * @param $ctx [array], le contexte des agpa
//  * @param $user [array], les informations relative à l'utilisateur
//  * @return $ctx [array], le contexte mis à jour les informations nécessaire à l'affichage de la phase 1.
//  */
// if ( ! function_exists('actualPhase1'))
// {
//     function actualPhase1($ctx, $user)
//     {
//         // Pour chaques catégories
//         foreach($ctx['categories'] as $k => $categorie)
//         {
//             if ($categorie->category_id < 0) continue;

//             $catId = $categorie->category_id;

//             // On affiche les photos dans les slots
//             $numPhoto = 0;
//             foreach($ctx['photos'][$catId] as $photo)
//             {
//                 if ($photo->user_id != $user->user_id) continue;
//                 ++$numPhoto ;

//                 $categorie->photos[] =  array(
//                     'num'            => $numPhoto,
//                     'empty'          => false,
//                     'id'             => $photo->photo_id,
//                     'url_hd'         => base_url() . 'assets/img/agpa/'.$photo->year.'/'.$photo->filename,
//                     'url_fullscreen' => base_url() . 'assets/img/agpa/'.$photo->year.'/mini/'.$photo->filename,
//                     'url_thumb'      => base_url() . 'assets/img/agpa/'.$photo->year.'/mini/vignette_'.$photo->filename,
//                     'title'          => $photo->title
//                 );

//                 $ctx['categories'][$k] = $categorie;
//             }
            
//             for ($slot = $numPhoto+1; $slot <= 2 ; $slot++)
//             {
//                 $categorie->photos[] =  array(
//                     'num'    => $slot,
//                     'empty'  => true
//                 );
//                 $ctx['categories'][$k] = $categorie;
//             }
//         }

//         return $ctx;
//     }
// }


// /**
//  * actualPhase2Resume
//  * Résume la phase 2 du concours. Si pas de catégorie d'indiquée, on affiche 
//  * le résumé, ainsi que la liste des photos posant problèmes...
//  *
//  * @param $ctx [array], le contexte des agpa
//  * @param $user [array], les informations relative à l'utilisateur
//  * @return $ctx [array], le contexte mis à jour les informations nécessaire à l'affichage du résumé de la phase 2.
//  */
// if ( ! function_exists('actualPhase2Resume'))
// {
//     function actualPhase2Resume(&$ctx, $user)
//     {
//         $badPhotos = array();

//         // Rechercher les mauvaises photos
//         $badPhotos = array();
//         foreach($ctx['photos'] as $cat)
//             foreach($cat as $photo)
//                 if ($photo->error != NULL) $badPhotos[] = $photo;

//         $ctx['have_photos_error'] = !empty($badPhotos);

//         if  (!empty($badPhotos))
//         {
//             $ctx['photos_error'] = $badPhotos;
//         }
//     }
// }




// /**
//  * actualPhase3Resume
//  * Résume la phase 3 du concours. On resumes les categories de l'annee 
//  * actuelle avec d'affiche pour chacune les 3 votes
//  *
//  * @param $ctx [array], le contexte des agpa
//  * @param $user [array], les informations relative à l'utilisateur
//  * @return $ctx [array], le contexte mis à jour les informations nécessaire à l'affichage du résumé de la phase 2.
//  */
// if ( ! function_exists('actualPhase3Resume'))
// {
//     function actualPhase3Resume(&$ctx, $user)
//     {
//         $CI = get_instance();
//         $ctx['photos'][-3] = array();
        


//     // 1- Informations participations par categories
//         foreach($ctx['categories'] as $cat)
//         {
//             if ($cat->category_id > 0)
//             {
//                 $ctx['categories'][$cat->category_id]->star_used = 0;
//                 $ctx['categories'][$cat->category_id]->star_available = 0;
//                 $ctx['categories'][$cat->category_id]->star_ok = false;
                
//                 foreach($ctx['photos'][$cat->category_id] as $p)
//                 {
// 		    if ($p->error === null)
// 		    $ctx['categories'][$cat->category_id]->star_available ++;
//                 }
//                 $ctx['categories'][$cat->category_id]->star_available = round($ctx['categories'][$cat->category_id]->star_available / 2, 0);
                
//             }
//             if ($cat->category_id == -3)
//             {
//                 $ctx['categories'][-3]->feather = 0;
//                 $ctx['categories'][-3]->feather_ok = false;
//             }
//         }

//     // 2- On recupere les votes du membre ainsi que les photos qui y sont liee
//         $sql = "SELECT p.*, v.score as `user_vote` FROM agpa_votes v, agpa_photos p 
//             WHERE v.year={$ctx['current_phase_year']}
//                 AND v.user_id={$user->user_id}
//                 AND v.photo_id=p.photo_id
//             ORDER BY category_id ASC, user_vote DESC ";
//         $votes = array();
//         $result = $CI->db->query($sql)->result();
//         foreach ($result as $photo) 
//         {
//             // cas général
//             if ($photo->user_vote > 0)
//             {
//                 $ctx['categories'][$photo->category_id]->star_used += $photo->user_vote;
//                 $ctx['photos'][$photo->category_id][$photo->photo_id]->user_vote = $photo->user_vote;
//                 if ($ctx['categories'][$photo->category_id]->star_used >= $ctx['categories'][$photo->category_id]->star_available / 2) 
//                 {
//                     $ctx['categories'][$photo->category_id]->star_ok = true;
//                 }
//             }
//             // cas meilleur titre
//             else if ($photo->user_vote == 0)
//             {
//                 ++$ctx['categories'][-3]->feather;
//                 $ctx['photos'][-3][] = $photo;
//                 $ctx['photos'][$photo->category_id][$photo->photo_id]->title_selection = true;
//                 if ($ctx['categories'][-3]->feather >= ($ctx['max_feather']/2) && $ctx['categories'][-3]->feather <= $ctx['max_feather']) 
//                 {
//                     $ctx['categories'][-3]->feather_ok = true;
//                 }
//             }
//         }
//     }
// }


// /**
// * actualPhase4DeliberationsEngine
// * Effectue la série d'action nécessaire (étape par étape) pour calculer les points
// * de chaques de photos et leur attribuer les récompenses en départageant les exaequos
// * @param $ctx [array], le contexte des agpa
// * @param $user [array], les informations relative à l'utilisateur
// * @param $checkStep [int], l'étape à laquelle on arrête le processus afin de permettre de le suivre étape par étape
// */
// if ( ! function_exists('actualPhase4DeliberationsEngine'))
// {
//     function actualPhase4DeliberationsEngine(&$ctx, $user, $checkStep)
//     {
//     // 1- Récupérer les votes et les vérifier
//         $votes = checkVotes($ctx, (($checkStep == 1)? true : false));
        
//         // Est-ce qu'il faut arrêter là ou continuer ?
//         if ($checkStep == 1) return;

//     // 2- Comptabiliser les votes correctes et calculer les notes pour chaque photo
//         $categories = computeNotes($ctx, $votes, (($checkStep == 2)? true : false));

//         // Est-ce qu'il faut arrêter là ou continuer ?
//         if ($checkStep == 2) return;

//     // 3- Attributions AGPA et création palmares
//         // evaluation des notes et classement des photos / photographes
//         // attribution des AGPA (or,argent,bronze)
//         $evalResult = evalNote($ctx, $categories, (($checkStep == 3)? true : false));
//         //printCategoriesArray($evalResult);

//         // Est-ce qu'il faut arrêter là ou continuer ?
//         if ($checkStep == 3) return;

//     // 4- Attribution des AGPA de diamant
//         $finalResult = deliverAwards($ctx, $evalResult, (($checkStep == 4)? true : false));
//         //printCategoriesArray($finalResult);

//         // Est-ce qu'il faut arrêter là ou continuer ?
//         if ($checkStep == 4) return;

//     // 5- Clore les stats pour l'édition actuelle (maj bdd)
//         closeEdition($ctx, $finalResult);
//     }
// }



// /**
// * actualPhase5Resume
// * Résumé des récompenses obtenu cette année (seulement les AGPA or/diamant)
// * @param $ctx [array], le contexte des agpa
// * @param $user [array], les informations relative à l'utilisateur
// */
// if ( ! function_exists('actualPhase5Resume'))
// {
//     function actualPhase5Resume(&$ctx, $user)
//     {
// 		$CI = get_instance();
//         $ctx['photos'][-3] = array();


//     // 1- Informations participations par categories
//         /*foreach($ctx['categories'] as $cat)
//         {
//             if ($cat->category_id > 0)
//             {
//                 $ctx['categories'][$cat->category_id]->star_used = 0;
//                 $ctx['categories'][$cat->category_id]->star_available = round(count($ctx['photos'][$cat->category_id]) / 2, 0);
//             }
//             else if ($cat->category_id == -1)
//             {
//                 $ctx['categories'][-3]->feather = 0;
//             }
//             else if ($cat->category_id == -3)
//             {
//                 $ctx['categories'][-3]->feather = 0;
//             }
//         }*/
// /*
//     // 2- On recupere les votes du membre ainsi que les photos qui y sont liées
//         $sql = "SELECT p.*, v.score as `user_vote` FROM agpa_votes v, agpa_photos p 
//             WHERE v.year={$ctx['current_phase_year']}
//                 AND v.user_id={$user->user_id}
//                 AND v.photo_id=p.photo_id
//             ORDER BY category_id ASC, user_vote DESC ";
//         $votes = array();
//         $result = $CI->db->query($sql)->result();
//         foreach ($result as $photo) 
//         {
//             // cas général
//             if ($photo->user_vote > 0)
//             {
//                 $ctx['categories'][$photo->category_id]->star_used += $photo->user_vote;
//                 $ctx['photos'][$photo->category_id][$photo->photo_id]->user_vote = $photo->user_vote;
//                 if ($ctx['categories'][$photo->category_id]->star_used >= $ctx['categories'][$photo->category_id]->star_available / 2) 
//                 {
//                     $ctx['categories'][$photo->category_id]->star_ok = true;
//                 }
//             }
//             // cas meilleur titre
//             else if ($photo->user_vote == 0)
//             {
//                 ++$ctx['categories'][-3]->feather;
//                 $ctx['photos'][-3][] = $photo;
//                 $ctx['photos'][$photo->category_id][$photo->photo_id]->title_selection = true;
//                 if ($ctx['categories'][-3]->feather >= 4 && $ctx['categories'][-3]->feather <= 8) 
//                 {
//                     $ctx['categories'][-3]->feather_ok = true;
//                 }
//             }
//         }
//         */
        
// 		return;
    
//         $CI = get_instance();
//         // 1- On récupère les données de l'édition terminée
//         $sql = "SELECT * FROM agpa_awards WHERE year = {$ctx['current_phase_year']}  ORDER BY category ASC, award ASC";
//         $result = $CI->db->query($sql)->result();
//         $infosEdition = array();
//         foreach ($result as $row) 
//         {
//             $infosEdition[$row->category][$row->award] = $row;
//         }
        
//         // 2- On recupere toutes les données sur les photos de cette année la
//         //$AGPA_PHOTOS = initAGPA($ctx['current_phase_year']);
        
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
//     }
// }
