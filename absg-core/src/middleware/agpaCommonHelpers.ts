import { addDays, addSeconds } from "date-fns";
import { AgpaPhoto, Parameter } from "../entities";
import { AgpaContext } from "./model/AgpaContext";
import { getRepository } from "./database";
import { AgpaPhase } from "./model/AgpaPhase";

export const agpaCtx = new AgpaContext();

/**
 * Calcule l'année de l'édition en fonction de la date courante
 * @return l'année de l'édition en cours
 */
export function getCurrentEdition(): number {
    // DEBUG: Si la variable d'environnement AGPA_FORCE_EDITION est définie, on force l'édition
    if (process.env.AGPA_FORCE_EDITION) {
        const forcedEdition = parseInt(process.env.AGPA_FORCE_EDITION, 10);
        if (!isNaN(forcedEdition) && forcedEdition >= 2006) {
            return forcedEdition;
        }
    }

    // Timeline d'une édition:
    // - Phase 1-4: 1er octobre année N → cérémonie (décembre N ou janvier N+1)
    // - Phase 5: Fin cérémonie → fin janvier année N+1
    // - Interlude: Février-Septembre → affichage "prochaine édition année N+1"
    // - Phase 1 nouvelle édition: 1er octobre année N+1

    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // 0-11

    // Si on est entre février et septembre (mois 1-8), on est dans l'interlude
    // On affiche donc l'édition qui démarrera en octobre
    if (currentMonth >= 1 && currentMonth <= 8) {
        return currentYear;
    }

    // Si on est en octobre, novembre, décembre ou janvier
    // On est dans l'édition de l'année où a démarré le 1er octobre
    if (currentMonth >= 9) {
        // Octobre, novembre, décembre de l'année N = édition N
        return currentYear;
    } else {
        // Janvier de l'année N+1 = édition N (phase 5)
        return currentYear - 1;
    }
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
export async function getPhasesBoundaries(): Promise<AgpaPhase[]> {
    // Les durées des phases par défaut sont :
    //   1 : enregistrement des oeuvre        [ du 1er octobre au 15 décembre ] => 76 jours
    //   2 : vérification des photos          [ du 15 au 17 décembre ] => 2 jours
    //   3 : votes                            [ du 17 au 21 décembre ] => 4 jours
    //   4 : calculs et préparation cérémonie [ du 21 au 24 décembre ] => 3 jours
    //   5 : post cérémonie                   [ du 24 jusqu'au démarrage de la prochaine édition ]
    // Mais pour l'année en cours, on récupère les durées via la DB car on peut les modifier
    // pour s'adapter au contraintes des agendas des participants
    const repo = getRepository(Parameter);
    const phases = [];
    let startDate = new Date(getCurrentEdition(), 9, 1, 0, 0, 0);
    const phasesDayDurations = [76, 2, 4, 3, null];
    let agpaCeremonyStartTime = 72000; // Par défaut la cérémonie débute à 20h (72000 seconds)

    // Récupération des phases configurées par les admins
    const sql = `SELECT * FROM parameter WHERE key LIKE 'agpa%';`;
    const raw = await repo.query(sql);
    if (Array.isArray(raw) && raw.length === 5) {
        phasesDayDurations[0] = +raw.find(e => e.key === "agpaPhase1Duration").value;
        phasesDayDurations[1] = +raw.find(e => e.key === "agpaPhase2Duration").value;
        phasesDayDurations[2] = +raw.find(e => e.key === "agpaPhase3Duration").value;
        phasesDayDurations[3] = +raw.find(e => e.key === "agpaPhase4Duration").value;
        agpaCeremonyStartTime = +raw.find(e => e.key === "agpaCeremonyStartTime").value;
    }

    // Calcul des échéances
    // Toutes les phases 1-3 se terminent à 1h du matin pour éviter toute ambiguïté
    // Phase 4 se termine à l'heure de début de la cérémonie (personnalisable)
    for (let idx = 0; idx < phasesDayDurations.length; idx++) {
        const p = new AgpaPhase();
        p.id = idx + 1;
        p.startDate = new Date(startDate);

        if (idx <= 2) {
            // Phases 1-3: toutes se terminent à 1h du matin
            startDate = addDays(startDate, phasesDayDurations[idx]);
            if (idx === 0) {
                // Phase 1 démarre à minuit, on ajoute 1h pour terminer à 1h
                startDate = addSeconds(startDate, 3600);
            }
            // Phases 2-3 démarrent déjà à 1h, addDays préserve l'heure
            p.endDate = new Date(startDate);
        } else if (idx === 3) {
            // Phase 4: se termine à l'heure de début de la cérémonie
            // On repart de 1h du matin, on ajoute X jours (reste à 1h), puis l'offset de l'heure
            startDate = addDays(startDate, phasesDayDurations[idx]);
            // On retire 1h (pour revenir à minuit) puis on ajoute l'heure de la cérémonie
            startDate = addSeconds(startDate, -3600 + agpaCeremonyStartTime);
            p.endDate = new Date(startDate);
        } else {
            // Phase 5: post-cérémonie jusqu'à fin janvier de l'année suivante
            // Permet aux gens de revoir la cérémonie
            p.endDate = new Date(startDate.getFullYear() + 1, 0, 31, 23, 59, 59);
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
export async function getMetaData(year = null, force = false): Promise<any> {
    const repo = getRepository(AgpaPhoto);
    const currentYear = getCurrentEdition();
    year = force ? year : checkValidYear(year);

    const data = {
        year, // L'année de l'édition en cours
        maxYear: currentYear - 1, // L'année max pour les archives
        minYear: 2006,
        boudaries: await getPhasesBoundaries(),
        categoriesOrders: [], // La liste ordonnées des (id des) catégories de l'année en cours
        categories: {}, // Données sur chaques catégories,
        phase: null // La phase en cours
    };

    // On en déduis la phase actuelle pour l'édition en cours
    const date = new Date();
    for (const p of data.boudaries) {
        if (date > p.startDate) {
            data.phase = p.id;
        }
    }

    // On récupère les données des catégories
    let sql = `SELECT c.* , v.title as "vTitle", v.description as "vDescription"
        FROM agpa_category c
        LEFT JOIN agpa_category_variation v ON v.id = c.id AND v.year = ${year}
        WHERE (c.to IS NULL OR c.to >= ${year}) AND c.from <= ${year}
        ORDER BY c."order"`;
    let result = await repo.query(sql);

    for (const row of result) {
        if (row.id > 0) {
            data.categoriesOrders.push(row.id);
        }
        data.categories[row.id] = {
            id: row.id,
            title: row.id === 8 ? row.vTitle : row.title,
            description: row.id === 8 ? row.vDescription : row.description,
            color: row.color,
            totalUsers: 0,
            totalPhotos: 0
        };
    }

    sql = `SELECT "categoryId", count (*) as "totalPhotos", count(distinct("userId")) as "totalUsers"
        FROM agpa_photo
        WHERE year=${year} AND "categoryId" > 0
        GROUP BY "categoryId"`;
    result = await repo.query(sql);
    for (const row of result) {
        data.categories[row.categoryId].totalUsers = row.totalUsers;
        data.categories[row.categoryId].totalPhotos = row.totalPhotos;
    }
    return data;
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
 * Calcule l'année de la dernière édition publiable dans les archives
 * Tiens compte de la phase de l'édition courante.
 * @return l'année de la dernière édition
 */
export function getMaxArchiveEdition(): number {
    return getCurrentPhase() < 5 ? getCurrentEdition() - 1 : getCurrentEdition();
}
