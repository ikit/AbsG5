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
export async function initAGPAContext(date: Date): Promise<AgpaContext>
{
    if (!agpaCtx.shallBeReset(date)) return agpaCtx;

    // On intiitalise le contexte en fonction de la date
    await agpaCtx.reset(date);

    // On récupère les photos et met à jour le contexte 
    const repo = getRepository(AgpaPhoto);
    let sql = `SELECT p.*, U.username, a.award, a."categoryId" as "awardCategoryId"
        FROM agpa_photo p 
            INNER JOIN "user" u ON U.id = p."userId" 
            LEFT JOIN agpa_award a ON a."photoId" = p.id 
        WHERE p.year=${agpaCtx.editionYear}
        ORDER BY p."categoryId" ASC, p.gscore DESC, p.number ASC`;

    // On récupère les données
    const result = await repo.query(sql);
    for (const row of result)
    {
        // On vérifie que la photo n'est pas déjà enregistré (peux arriver si la photo à plusieurs award (Agpa bronze + meilleur titre par exemple)
        if (!agpaCtx.photos.has(row.id))
        {
            // On augmente le nombre de photo inscrite dans la catégorie concernée
            agpaCtx.categories.get(row.categoryId).photos.push(row.id);
            agpaCtx.categories.get(row.categoryId).nbrPhotos++;
            agpaCtx.totalPhotos++;
            
            // On ajoute l'autheur si il ne l'a pas déjà été
            if (!agpaCtx.authors.has(row.userId)) {
                agpaCtx.authors.set(row.userId, row.username);
                agpaCtx.totalAuthors++;
            }
            
            // On reformate les infos des awards (en liste car une photos peut en avoir plusieurs)
            let awards = new Map<number, string>();
            if (row.award != null)
            {
                awards.set(row.awardCategoryId, row.award);
            }
            
            // On stocke les infos de la photo
            const photo = new AgpaPhoto();
            photo.fromJSON(row);
            photo.awards = awards;

            agpaCtx.photos.set(photo.id, photo);
        }
        else
        {
            // on ajoute l'award 
            agpaCtx.photos.get(row.id).awards.set(row.awardCategoryId, row.award);
        }
    }

    return agpaCtx;
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



/**
 * shuffleArray
 * Mélange les éléments d'un tableau. Attention, le tableau d'entré est mélangé
 * @param {Array} array, le tableau à mélanger
 */
function shuffleArray(array: any[]) {
    let j, tmp;
    for (let i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
}


/**
 * sufflePhotos
 * Attribut un numéro aléatoire aux photos d'une même édition
 * et met à jour en même temps ce tableau avec les numéros générés
 *
 * @param photos,  les photos de l'éditions, triés par catégories.
 * @param user, les informations relatives à l'utilisateur.
 * @param year, l'année de l'édition
 * @return ctx le contexte mis à jour avec le tableau récapitulatif des photos de l'edition des AGPA (triées par catégories)
 */

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
