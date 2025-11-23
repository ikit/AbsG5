import { AgpaPhoto } from "../entities";
import { getRepository } from "./database";
import { getMetaData } from "./agpaCommonHelpers";

/**
 * Récupère les informations pour présenter la cérémony des AGPA en ligne
 * @param year
 */
export async function ceremonyData(year: number) {
    // On récupère les photos
    const repo = getRepository(AgpaPhoto);
    const edition = await getMetaData(year);

    // Init data
    edition.authors = [];
    edition.stats = { totalPhotos: 0, totalAuthors: 0 };

    for (const catId in edition.categories) {
        edition.categories[catId].nominated = [];
    }

    // On récupère les photos de chaque catégories
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", u.username 
        FROM agpa_award a
        LEFT JOIN agpa_photo p ON p.id = a."photoId"
        INNER JOIN "user" u ON u.id = p."userId" 
        WHERE a.year=${year} 
        ORDER BY a."categoryId" ASC, a.award DESC`;
    // On récupère les données, on ne conserve que les 5 meilleures photos par catégories
    const result = await repo.query(sql);
    for (const p of result) {
        if (p.award === "honor") {
            if (!edition.categories.hasOwnProperty("-4")) {
                edition.categories[-4] = {};
            }
            edition.categories[-4].nominated.push(p);
        } else {
            edition.categories[p.awardCategory].nominated.push(p);
        }
    }

    // On récupère les meilleurs photographes
    sql = `SELECT a."userId", u.username, a.award
        FROM agpa_award a 
        INNER JOIN "user" u ON u.id = a."userId" 
        WHERE "categoryId"=-1 AND year=${year}
        ORDER BY "year" DESC, a."award" DESC `;
    edition.categories[-1].nominated = await repo.query(sql);

    sql = `SELECT DISTINCT(p."userId"), u.username
        FROM agpa_photo p 
        INNER JOIN "user" u ON u.id = p."userId" 
        WHERE p.year=${year}`;
    edition.authors = await repo.query(sql);

    // On récupère les données
    sql = `SELECT year, COUNT(DISTINCT(id)) AS total FROM agpa_photo GROUP BY year ORDER BY year ASC`;
    edition.stats.totalPhotos = await repo.query(sql);
    sql = `SELECT year, COUNT(DISTINCT("userId")) AS total FROM agpa_photo GROUP BY year ORDER BY year ASC`;
    edition.stats.totalAuthors = await repo.query(sql);

    return edition;
}
