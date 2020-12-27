import { getRepository } from "typeorm";
import { AgpaPhoto, User } from "../entities";
import { getMetaData, getCurrentEdition, checkValidYear, getPhasesBoundaries } from "./agpaCommonHelpers";

/**
 * Retourne les informations sur les anciennes éditions
 * @param user l'utilisateur qui demande les informations
 */
export async function archiveSummary(user: User): Promise<any> {
    // Init data
    let maxYear = getCurrentEdition();
    const repo = getRepository(AgpaPhoto);
    const archivesSummary = [];

    // On vérifie que l'édition en cours n'est pas déjà terminé
    const boudaries = await getPhasesBoundaries();
    const now = new Date();
    if (boudaries[4].startDate < now) {
        maxYear += 1;
    }

    // On récupère les meilleures photos de chaque éditions
    const photos = new Map<number, AgpaPhoto[]>();
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", a."userId" from agpa_photo p
        INNER JOIN agpa_award a ON p.id = a."photoId"
        WHERE a."categoryId" = -2 AND p.year < ${maxYear}
        ORDER BY p.year DESC, p.gscore DESC`;
    // On récupère les données
    let result = await repo.query(sql);
    for (const row of result) {
        const p = new AgpaPhoto();
        p.fromJSON(row);
        if (photos.has(p.year)) {
            photos.get(p.year).push(p);
        } else {
            photos.set(p.year, [p]);
        }
    }

    // On récupère les meilleurs photographes
    const authors = new Map<number, any[]>();
    sql = `SELECT a.year, a."userId" as id, u.username as firstname, a.award 
        FROM agpa_award a 
        INNER JOIN "user" u ON u.id = a."userId" 
        WHERE "categoryId"=-1 AND year < ${maxYear}
        ORDER BY "year" DESC, a."award" DESC `;
    result = await repo.query(sql);
    for (const row of result) {
        if (authors.has(row.year)) {
            authors.get(row.year).push(row);
        } else {
            authors.set(row.year, [row]);
        }
    }

    // On récupère le palmarès de l'utilisateur pour chaque édition
    const palmares = new Map<number, any>();
    sql = `SELECT a.year, a.award, count(*) as total
        FROM agpa_award a
        WHERE a."userId" = ${user.id} AND year < ${maxYear}
        GROUP BY year, award
        ORDER BY a.year DESC, a.award ASC`;
    result = await repo.query(sql);
    for (const row of result) {
        if (!palmares.has(row.year)) {
            palmares.set(row.year, { diamond: 0, gold: 0, sylver: 0, bronze: 0, nominated: 0, honor: 0 });
        }
        palmares.get(row.year)[row.award] = row.total;
    }

    // On récupère le total de photos par années
    sql = `SELECT year, count(*) AS photos FROM agpa_photo WHERE year < ${maxYear} GROUP BY year ORDER BY year DESC`;
    result = await repo.query(sql);
    for (const row of result) {
        archivesSummary.push({
            year: row.year,
            totalPhotos: +row.photos,
            photos: photos.has(row.year) ? photos.get(row.year) : [],
            authors: authors.has(row.year) ? authors.get(row.year) : [],
            palmares: palmares.has(row.year) ? palmares.get(row.year) : null
        });
    }

    return archivesSummary;
}

/**
 * Retourne les informations sur une ancienne édition
 * @param year l'année de l'édition
 * @param user l'utilisateur qui demande les informations
 */
export async function archiveEdition(year: number, user: User): Promise<any> {
    // Init data
    const repo = getRepository(AgpaPhoto);
    const edition = await getMetaData(year);

    // On récupère les meilleurs photos de chaque catégories ainsi que les photos de l'utilisateurs
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", u.username 
        FROM agpa_photo p
        INNER JOIN "user" u ON u.id = p."userId" 
        LEFT JOIN agpa_award a ON p.id = a."photoId"
        WHERE p.year=${year} AND p."categoryId" > 0 AND a.award != 'honor' AND (a.award IS NOT NULL OR p."userId" = ${user.id})
        ORDER BY p.gscore DESC`;
    let result = await repo.query(sql);
    for (const row of result) {
        const p = new AgpaPhoto();
        p.fromJSON(row);
        // On initialise la catégorie si besoin
        if (!edition.categories[p.categoryId].hasOwnProperty("photos")) {
            edition.categories[p.categoryId].photos = [];
            edition.categories[p.categoryId].userPhotos = [];
        }
        if (p.categoryId == row.awardCategory && row) {
            edition.categories[p.categoryId].photos.push(p);
        }
        if (p.user.id == user.id) {
            edition.categories[p.categoryId].userPhotos.push(p);
        }
    }

    // On récupère les meilleurs photographes
    const authors = [];
    sql = `SELECT a."userId" as id, u.username as firstname, a.award 
        FROM agpa_award a 
        INNER JOIN "user" u ON u.id = a."userId" 
        WHERE "categoryId"=-1 AND year=${year}
        ORDER BY "year" DESC, a."award" DESC `;
    result = await repo.query(sql);
    for (const row of result) {
        authors.push(row);
    }
    edition.authors = authors;

    // On récupère les statistiques sur la participation
    sql = `SELECT "categoryId", count (*) as "totalPhotos", count(distinct("userId")) as "totalUsers"
        FROM agpa_photo
        WHERE year=${year} AND "categoryId" > 0
        GROUP BY "categoryId"`;
    result = await repo.query(sql);
    for (const row of result) {
        edition.categories[row.categoryId].totalPhotos = row.totalPhotos;
        edition.categories[row.categoryId].totalUsers = row.totalUsers;
    }

    return edition;
}

/**
 * Retourne les informations sur une catégorie d'une édition
 * @param year l'année de l'édition
 * @param catId l'id de la catégorie
 * @param user l'utilisateur qui demande les informations
 */
export async function archiveCategory(year: number, catId: number, user: User) {
    // Si l'utilisateur n'est pas admin, il n'a pas le droit de récupérer les archives de l'édition en cours
    if (user.isNot("admin")) {
        year = checkValidYear(year);
    }

    // Init data
    const repo = getRepository(AgpaPhoto);
    const category = await getMetaData(year);
    category.totalPhotos = 0;
    category.totalUsers = 0;
    category.photos = [];
    const users = [];
    const photos = new Map<number, AgpaPhoto>();

    // On récupère les photos
    const sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", u.username 
        FROM agpa_photo p
        LEFT JOIN agpa_award a ON p.id = a."photoId"
        INNER JOIN "user" u ON u.id = p."userId" 
        WHERE p.year=${year} AND p."categoryId"=${catId}
        ORDER BY p.gscore DESC`;
    // On récupère les données
    const result = await repo.query(sql);
    for (const row of result) {
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
