import { addDays } from "date-fns";
import { AgpaPhoto } from "../entities";
import { AgpaContext } from "./model/AgpaContext";
import { getRepository } from "typeorm";
import { AgpaPhase } from "./model/AgpaPhase";

export const agpaCtx = new AgpaContext();

/**
 * Calcule l'année de l'édition en fonction de la date courante
 * @return l'année de l'édition en cours
 */
export function getCurrentEdition(): number {
    // Une édition commence toujours au 1er octobre pour se terminer fin décembre
    // Mais en fonction du calendrier, peut déborder sur janvier de l'année suivante
    // Donc si on est avant 1er février, il s'agit de l'édition précédente, sinon il s'agit de l'année courante
    const date = new Date();
    let editionYear = date.getFullYear();
    // Si en janvier
    if (date.getMonth() == 0) {
        editionYear--;
    }
    return editionYear;
}

/**
 * Vérifie que l'année est une année valide pour les AGPA.
 * @param year l'année à tester, retourne l'année de l'édition en cours sinon
 */
export function checkValidYear(year, defaultYear: number = null): number {
    const currentYear = getCurrentEdition();
    if (!Number.isInteger(year) || year < 2006 || year >= currentYear) {
        year = defaultYear ? checkValidYear(defaultYear) : currentYear;
    }
    return year;
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
    const phases = [];
    let startDate = new Date(getCurrentEdition(), 9, 1, 0, 0, 0);
    const phasesDayDurations = [76, 2, 4, 3, null];

    // TODO: récupérer les valeurs en bases de données

    for (let idx = 0; idx < phasesDayDurations.length; idx++) {
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
 * initPhotosData
 * Crée le "contexte" pour une édition des agpa, c'est à dire l'ensemble des données concernant l'édition
 *
 * @param date, la date à prendre en compte pour l'édition
 * @return le "contexte"
 */
export async function initAGPAContext(date: Date) {
    return agpaCtx.checkForReset(date.getFullYear());
}

/**
 * getMetaData
 * Récupère toutes les informations concernant une édition
 *
 * @return
 */
export async function getMetaData(year = null): Promise<any> {
    const repo = getRepository(AgpaPhoto);
    const currentYear = getCurrentEdition();
    year = checkValidYear(year);

    const data = {
        year, // L'année de l'édition en cours
        maxYear: currentYear - 1, // L'année max pour les archives
        minYear: 2006,
        boudaries: getPhasesBoundaries(),
        categoriesOrders: [], // La liste ordonnées des (id des) catégories de l'année en cours
        categories: {} // Données sur chaques catégories
    };

    // On récupère les données des catégories
    const sql = `SELECT c.* , v.title as "vTitle", v.description as "vDescription"
        FROM agpa_category c
        LEFT JOIN agpa_category_variation v ON v.id = c.id AND v.year = ${year}
        WHERE (c.to IS NULL OR c.to >= ${year}) AND c.from <= ${year}
        ORDER BY c."order"`;
    const result = await repo.query(sql);
    for (const row of result) {
        if (row.id > 0) {
            data.categoriesOrders.push(row.id);
        }
        data.categories[row.id] = {
            id: row.id,
            title: row.id === 8 ? row.vTitle : row.title,
            description: row.id === 8 ? row.vDescription : row.description,
            color: row.color
        };
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
 * Calcule l'année de la dernière édition publiable dans les archives
 * Tiens compte de la phase de l'édition courante.
 * @return l'année de la dernière édition
 */
export function getMaxArchiveEdition(): number {
    const now = new Date();
    return getCurrentPhase() < 5 ? getCurrentEdition() - 1 : getCurrentEdition();
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
