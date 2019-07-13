import { format, addDays } from "date-fns";
import { AgpaPhoto, AgpaAward, AgpaAwardType, AgpaCategory, AgpaVote, User } from "../entities";
import { AgpaContext } from "./model/AgpaContext";
import { getRepository } from "typeorm";
import { stringify } from "querystring";
import { AgpaPhase } from "./model/AgpaPhase";

export const agpaCtx = new AgpaContext();



/**
 * initPhotosData
 * Crée le "contexte" pour une édition des agpa, c'est à dire l'ensemble des données concernant l'édition
 *
 * @param date, la date à prendre en compte pour l'édition
 * @return le "contexte"
 */
export async function initAGPAContext(date: Date)
{
    return agpaCtx.checkForReset();
}


/**
 * shuffleArray
 * Mélange les éléments d'un tableau. Attention, le tableau d'entré est mélangé
 * @param {Array} array, le tableau à mélanger
 
function shuffleArray(array: any[]) {
    let j, tmp;
    for (let i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
}
*/

/**
 * sufflePhotos
 * Attribut un numéro aléatoire aux photos d'une même édition
 * et met à jour en même temps ce tableau avec les numéros générés
 *
 * @param photos,  les photos de l'éditions, triés par catégories.
 * @return ctx le contexte mis à jour avec le tableau récapitulatif des photos de l'edition des AGPA (triées par catégories)

export function sufflePhotos(photos)
{
    const newPhotos = [];
    // On concatène toutes les photos dans un même tableau
    for(const cat of photos) {
        for (const photo of cat) {
            newPhotos.push(photo);
        }
    }
    // On mélange
    shuffleArray(newPhotos);

    // Maj MySQL
    let num = 1;
    let sql = '';
    for(const photo of newPhotos)
    {
        sql += `UPDATE agpa_photo SET number = '${num}' WHERE id=${photo.id};`;
        photo.number = num;
        ++num;
    }
    return sql;
}
*/




/**
 * Calcule l'année de l'édition en fonction de la date courante
 * @return l'année de l'édition en cours
 */
export function getCurrentEdition(): number {
    // Une édition commence au 1er octobre pour se terminer fin décembre
    // Mais en fonction du calendrier, peut déborder sur janvier/février de l'année suivante
    // Donc si on est avant octobre, il s'agit de l'édition précédente, sinon il s'agit de l'année courante :)
    const date = new Date();
    let editionYear = date.getFullYear();
    if (date.getMonth() < 9) {
        editionYear--;
    }
    return editionYear;
}

/**
 * Calcule la phase de l'édition en cours
 * @return la phase de l'édition en cours
 */
export function getCurrentPhase(): number {
    agpaCtx.checkForReset();
    return agpaCtx.phase;
}

/**
 * Calcule les phases pour l'édition courante
 * @return la liste des phases
 */
export function getPhasesBoundaries(): AgpaPhase[] {
    // Les durées des phases par défaut sont :
    //   1 : enregistrement des oeuvre        [ du 1er octobre au 15 décembre ] => 76 jours
    //   2 : vérification des photos          [ du 15 au 17 décembre ] => 2 jours
    //   3 : votes                            [ du 17 au 21 décembre ] => 4 jours
    //   4 : calculs et préparation cérémonie [ du 21 au 24 décembre ] => 3 jours
    //   5 : post cérémonie                   [ du 24 jusqu'au démarrage de la prochaine édition ] 
    // Mais pour l'année en cours, on récupère les durées via la DB car on peut les modifier
    // pour s'adapter au contraintes des agendas des participants
    const currentYear = new Date().getFullYear();
    const phases = [];
    let startDate =  new Date(getCurrentEdition(), 9, 1, 0, 0, 0);
    const phasesDayDurations = [76,2,4,3, null];
    
    // TODO: récupérer les valeurs en bases de données

    for (let idx=0; idx < phasesDayDurations.length; idx++) {
        const p = new AgpaPhase();
        p.id = idx + 1;
        p.startDate = new Date(startDate);
        if (phasesDayDurations[idx]) {
            startDate = addDays(startDate, phasesDayDurations[idx]);
            p.endDate = new Date(startDate);
        } else {
            p.endDate = new Date(startDate.getFullYear() + 1, 8, 31);
        }
        phases.push(p);
        
    }
    return phases;
}

/**
 * Calcule l'année de la dernière édition publiable dans les archives
 * Tiens compte de la phase de l'édition courante.
 * @return l'année de la dernière édition
 */
export function getMaxArchiveEdition(): number {
    const now = new Date();
    return  getCurrentPhase() < 5 ? getCurrentEdition() -1 : getCurrentEdition();
}












// export function convertCatIdToCssId(caId)
// {
//     let result = caId;
    
//     switch(caId)
//     {
//         case -3:
//             result = 'x3';
//             break;
//         case -2:
//             result = 'x2';
//             break;
//         case -1:
//             result = 'x1';
//             break;
//     }
    
//     return result;
// }




// /**
//  * showRules
//  * Affiche le réglement en ligne. L'essentiel du réglement est écrit directement dans le template chargé... 
//  * Cette fonction s'occupe essentiellement de calculer les dates afin que le réglement colle avec l'édition courante.
//  *
//  * @param ctx, le contexte avec toutes les infos nécessaire.
//  * @param user, les informations relatives à l'utilisateur.
//  * @param year, l'année de l'édition
//  * @return ctx, le contexte mis à jour avec les dates de l'année courante
//  */
// export function showRules(ctx, user, year)
// {    
//     const days = ['lundi ', 'mardi ', 'mercredi ', 'jeudi ', 'vendredi ', 'samedi ', 'dimanche '];
//     let info = {
//         p1End: new Date(year, 11, ctx.phasesBoundaries[0]1][1],ctx.phasesBoundaries[1][0]-1, year); // moins 1 car (" on inclus" la journée ds le texte du réglement")
//         p2Start: new Date(year, 11, ctx.phasesBoundaries[1][1],ctx.phasesBoundaries[1][0], year);
//         p2End: new Date(year, 11, ctx.phasesBoundaries[2][1],ctx.phasesBoundaries[2][0]-1, year);
//         p3Start: new Date(year, 11, ctx.phasesBoundaries[2][1],ctx.phasesBoundaries[2][0], year);
//         p3End: new Date(year, 11, ctx.phasesBoundaries[3][1],ctx.phasesBoundaries[3][0], year);
//     }
    
    
    
    
//     // on met à jour le contexte avec les nouvelles infos
//     $ctx['prev_year']     = $year -1;
//     $ctx['p1_end_date']   = $days[date('N',$phase1End)-1].date('j',$phase1End);
//     $ctx['p2_start_date'] = $days[date('N',$phase2Start)-1].date('j',$phase2Start);
//     $ctx['p2_end_date']   = $days[date('N',$phase2End)-1].date('j',$phase2End);
//     $ctx['p3_start_date'] = $days[date('N',$phase3Start)-1].date('j',$phase3Start);
//     $ctx['p3_end_date']   = $days[date('N',$phase3End)-1].date('j',$phase3End);
    
    

//     return $ctx;
// }
