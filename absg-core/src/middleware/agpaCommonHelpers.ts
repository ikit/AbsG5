import { format, addDays } from "date-fns";
import { AgpaPhoto, AgpaAward, AgpaAwardType, AgpaCategory, AgpaVote, User } from "../entities";
import { AgpaContext } from "./model/AgpaContext";
import { getRepository } from "typeorm";
import { stringify } from "querystring";
import { AgpaPhase } from "./model/AgpaPhase";

export const agpaCtx = new AgpaContext();

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
 * showRules
 * Affiche le réglement en ligne. L'essentiel du réglement est écrit directement dans le template chargé... 
 * Cette fonction s'occupe essentiellement de calculer les dates afin que le réglement colle avec l'édition courante.
 *
 * @return 
 */
export async function getMetaData()
{
    const repo = getRepository(AgpaPhoto);
    const currentYear = getCurrentEdition();

    let data = {
        currentYear: currentYear,
        maxYear: currentYear - 1,
        minYear: 2006,
        catBefore2012: [1, 2, 3, 4, 5, 6, -2, -1],
        catSince2012: [1, 2, 7, 3, 4, 5, 8, 6 ,-2, -3, -1],
        boudaries: getPhasesBoundaries(),
        categories: {},
    }

    // On récupère les données des catégories
    let sql = `SELECT id, title, description, color FROM agpa_category`;
    let result = await repo.query(sql);
    for (const row of result)
    {
        data.categories[row.id] = row;
    }
	
    // On récupère les données des catégories spéciales
    sql = `SELECT id, year, title, description FROM agpa_category_variation WHERE year > 0`;
    result = await repo.query(sql);
    const cat8 = data.categories[8];
    cat8.variants = {};
    for (const row of result)
    {
        cat8.variants[row.year] = { title:row.title,  description:row.description };
    }


    return data;
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




