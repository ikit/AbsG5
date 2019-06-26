import { format, addDays } from "date-fns";
import { AgpaPhoto, AgpaAward, AgpaAwardType, AgpaCategory, AgpaVote, User } from "../entities";
import { AgpaContext } from "./model/AgpaContext";
import { getRepository } from "typeorm";
import { stringify } from "querystring";

// Les informations utiles pour chaque phase du concours
export const phasesData =  [
    { id:1, pxlStart: 1,   pxlSize: 238, startDate: null}, 
    { id:2, pxlStart: 239, pxlSize: 88,  startDate: null}, 
    { id:3, pxlStart: 327, pxlSize: 153, startDate: null}, 
    { id:4, pxlStart: 481, pxlSize: 135, startDate: null},
    { id:5, pxlStart: 500, pxlSize: 0,   startDate: null}
];

/**
 * Retourne les informations de la phase du concours correspondant à la date donnée
 * @param date
 * @return phase data
 */
export function getPhase(date: Date): any {
    if (!phasesData[0].startDate) {
        console.log('ERROR: phasesData not initialized. Call initPhotosAwardsData first');
        return null;
    }

    let result = phasesData[0];
    for (let idx=0; idx < phasesData.length; idx++) {
        if (date > phasesData[idx].startDate) {
            result = phasesData[idx];
        } else {
            break;
        }
    }
    return result;
}



/**
 * setupTimeLine
 * Fait les calcul nécéssaire afin d'afficher la frise chronologique des AGPA
 *
 * @param ctx, le contexte avec toutes les infos nécessaire.
 * @param phaseDate, la date à prendre en compte pour le calcul de phase
 * @param phasesDayDuration, le nombre de jour que dure chaque phases des AGPA.
 * @return [int] le nombre de seconde qu'il reste avant de passer à la phase suivante
 *               renvoie false si la phase indiqué ne correspond pas aux dates.
 *
 * Rappel des phase :
 *   1 : enregistrement des oeuvre        [ du 1er au 15 décembre ]
 *   2 : vérification des photos          [ du 15 au 17 décembre ]
 *   3 : votes                            [ du 17 au 21 décembre ]
 *   4 : calculs et préparation cérémonie [ du 21 au 24 décembre ]
 *   5 : post cérémonie                   [ du 24 jusqu'au démarrage de la prochaine édition ]
 */
export function setupTimeLine(ctx: AgpaContext, phaseDate: Date, phasesDayDuration: number[])
{
    /*
    // init 
    let pixels = 0;
    let timeLeft = -1;
    let timeLeftLabel = '';

    // init phases limit with date
    const now = new Date(Date.now());
    const year = now.getFullYear();
    phasesData[0].startDate = new Date(year, 11, 1);
    for (let phase = 1; phase < phasesData.length; phase ++) {
        phasesData[phase].startDate = addDays(phasesData[phase-1].startDate, phasesDayDuration[phase-1])
    }
    
    if (getPhase(phaseDate).id == 5)
    {
        pixels = phasesData[4].pxlStart + phasesData[4].pxlSize;
    }
    else
    {

        const endMkt   = new Date( phasesLimits[phase][1],   phasesLimits[phase][0], date('Y'));
        const startMkt = new Date( phasesLimits[phase-1][1], phasesLimits[phase-1][0], date('Y'));
        const actualMkt = Date.now();

        // le nombre d'heure entre la date de début de la phase et aujourd'hui
        const deltaHr  = Math.max ( (actualMkt - startMkt) / 3600, 0) ;
        // le nombre d'heure que dure la phase en entier (du début à la fin)
        const totalHr  = (endMkt-startMkt) / 3600;
        
        // le nombre de pixel a afficher de l'image
        pixels = phasesPixelsLenght[phase].pxlStart + Math.min( ( (phasesPixelsLenght[phase].pxlSize * deltaHr) / totalHr * 100 ) / 100, phasesPixelsLenght[phase].pxlSize);
        


        timeLeft = endMkt-actualMkt;
    }



    // Conversion du temps restant en string
    if (timeLeft)
    {
        const jours = timeLeft/86400;
        timeLeft -= jours*86400;
        const heures = timeLeft/3600;
        timeLeft -= heures*3600;
        const minutes = timeLeft/60;

        timeLeftLabel  = `${jours} jour` + ((jours > 1)?'s':'');
        timeLeftLabel += `, ${heures} heure` + ((heures > 1)?'s':'');
        timeLeftLabel += ` et ${minutes} minute` + ((minutes > 1)?'s':'');
    }

    ctx.phaseTimelineProgression = pixels;
    ctx.phaseTimeleft = timeLeftLabel;
    */
}


/**
 * initPhotosData
 * Crée le "contexte" pour une édition des agpa, c'est à dire l'ensemble des données concernant l'édition
 *
 * @param year, l'année de l'édition
 * @return le "contexte"
 */
export async function initAGPAContext(year: number): Promise<AgpaContext>
{
    const repo = getRepository(AgpaPhoto);
    const photos = [];  // l'ensemble des photos du concours (de l'édition en cours)
    let sql = `SELECT p.*, U.username, a.award, a."categoryId" as "awardCategoryId"
        FROM agpa_photo p 
            INNER JOIN "user" u ON U.id = p."userId" 
            LEFT JOIN agpa_award a ON a."photoId" = p.id 
        WHERE p.year=${year}
        ORDER BY p."categoryId" ASC, p.gscore DESC, p.number ASC`;
    
    
    // On réinit les infos
    const ctx = new AgpaContext();
    await ctx.reset(year);

    // On récupère les données
    const result = await repo.query(sql);
    for (const row of result)
    {
        // On vérifie que la photo n'est pas déjà enregistré (peux arriver si la photo à plusieurs award (Agpa bronze + meilleur titre par exemple)
        if (!ctx.photos.has(row.id))
        {
            // On augmente le nombre de photo inscrite dans la catégorie concernée
            ctx.categories.get(row.categoryId).photos.push(row.id);
            ctx.categories.get(row.categoryId).nbrPhotos++;
            ctx.totalPhotos++;
            
            // On ajoute l'autheur si il ne l'a pas déjà été
            if (!ctx.authors.has(row.userId)) {
                ctx.authors.set(row.userId, row.username);
                ctx.totalAuthors++;
            }
            
            // On reformate les infos des awards (en liste car une photos peut en avoir plusieurs)
            let awards = new Map<string, string>();
            if (row.award != null)
            {
                awards.set(row.awardCategoryId, row.award);
            }
            
            // On stocke les infos de la photo
            const photo = new AgpaPhoto();
            photo.fromJSON(row);
            photo.awards = awards;

            ctx.photos.set(photo.id, photo);
        }
        else
        {
            // on ajoute l'award 
            ctx.photos.get(row.id).awards.set(row.awardCategoryId, row.award);
        }
    }

    return ctx;
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
