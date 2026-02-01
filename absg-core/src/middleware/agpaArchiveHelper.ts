import { AgpaPhoto, User } from "../entities";
import { getRepository } from "./database";
import {
    getMetaData,
    getCurrentEdition,
    checkValidYear,
    getPhasesBoundaries,
    getMaxArchiveEdition
} from "./agpaCommonHelpers";

/**
 * Retourne les informations sur les anciennes éditions
 * @param user l'utilisateur qui demande les informations
 */
export async function archiveSummary(user: User): Promise<any> {
    // Init data
    const maxYear = getMaxArchiveEdition();
    const repo = getRepository(AgpaPhoto);
    const archivesSummary = [];

    // On récupère les meilleures photos de chaque éditions
    // Tri par award: diamond > gold > silver > bronze > nominated
    const photos = new Map<number, AgpaPhoto[]>();
    let sql = `SELECT p.*, a.award, a."categoryId" as "awardCategory", a."userId" from agpa_photo p
        INNER JOIN agpa_award a ON p.id = a."photoId"
        WHERE a."categoryId" = -2 AND p.year <= ${maxYear}
        ORDER BY p.year DESC,
            CASE a.award
                WHEN 'diamond' THEN 1
                WHEN 'gold' THEN 2
                WHEN 'sylver' THEN 3
                WHEN 'bronze' THEN 4
                WHEN 'nominated' THEN 5
                ELSE 6
            END ASC`;
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
        WHERE "categoryId"=-1 AND year <= ${maxYear}
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
        WHERE a."userId" = ${user.id} AND year <= ${maxYear}
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
    sql = `SELECT year, count(*) AS photos FROM agpa_photo WHERE year <= ${maxYear} GROUP BY year ORDER BY year DESC`;
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
    console.log(`\n\n========== archiveEdition CALLED: year=${year} ==========\n`);

    // Init data
    const repo = getRepository(AgpaPhoto);
    const edition = await getMetaData(year);

    // Debug: vérifier les données brutes pour la catégorie 1 (Portrait)
    const debugRawSql = `SELECT id, title,
            "scoreDetails"->'v2026'->>'rankInCategory' as rank_in_cat,
            "scoreV2010",
            "categoryId"
        FROM agpa_photo
        WHERE year=${year} AND "categoryId"=1
        ORDER BY ("scoreDetails"->'v2026'->>'rankInCategory')::int ASC NULLS LAST
        LIMIT 5`;
    const debugRaw = await repo.query(debugRawSql);
    console.log('[archiveEdition] Raw data for category 1 (Portrait), sorted by rankInCategory:');
    for (const r of debugRaw) {
        console.log(`  id=${r.id}, "${r.title}", rank_in_cat=${r.rank_in_cat}, scoreV2010=${r.scoreV2010}`);
    }

    // On récupère les photos qui ont un award dans leur catégorie ou qui appartiennent à l'utilisateur
    // Tri par niveau d'award (diamond > gold > silver > bronze > nominated)
    let sql = `SELECT * FROM (
            SELECT DISTINCT ON (p.id) p.*, u.username, a.award as cat_award,
                COALESCE(
                    (p."scoreDetails"->'v2026'->>'rankInCategory')::int,
                    CASE a.award
                        WHEN 'diamond' THEN 1
                        WHEN 'gold' THEN 2
                        WHEN 'sylver' THEN 3
                        WHEN 'bronze' THEN 4
                        WHEN 'nominated' THEN 5
                        ELSE 1000
                    END
                ) as sort_rank
            FROM agpa_photo p
            INNER JOIN "user" u ON u.id = p."userId"
            LEFT JOIN agpa_award a ON p.id = a."photoId" AND a."categoryId" = p."categoryId"
            WHERE p.year=${year} AND p."categoryId" > 0 AND (a.award IS NOT NULL AND a.award != 'honor' OR p."userId" = ${user.id})
            ORDER BY p.id
        ) sub ORDER BY sort_rank ASC, sub."scoreV2026" DESC NULLS LAST, sub."scoreV2010" DESC NULLS LAST`;
    let result = await repo.query(sql);

    // Debug: afficher les premières photos par catégorie
    console.log(`[archiveEdition] Total photos with awards: ${result.length}`);
    const debugByCat = new Map<number, any[]>();
    for (const r of result) {
        if (!debugByCat.has(r.categoryId)) debugByCat.set(r.categoryId, []);
        debugByCat.get(r.categoryId).push(r);
    }
    for (const [catId, photos] of debugByCat) {
        console.log(`  Category ${catId}: ${photos.length} photos`);
        for (let i = 0; i < Math.min(4, photos.length); i++) {
            const p = photos[i];
            console.log(`    ${i+1}. "${p.title}" - rank_v2026=${p.rank_v2026}, scoreV2010=${p.scoreV2010}`);
        }
    }

    // On récupère les awards pour ces photos (uniquement awards dans la catégorie de la photo)
    const awardsSql = `SELECT a."photoId", a.award
        FROM agpa_award a
        INNER JOIN agpa_photo p ON p.id = a."photoId"
        WHERE p.year=${year} AND p."categoryId" > 0 AND a."categoryId" = p."categoryId" AND a.award != 'honor'`;
    const awardsResult = await repo.query(awardsSql);
    const awardsMap = new Map<number, string>();
    for (const row of awardsResult) {
        awardsMap.set(row.photoId, row.award);
    }

    // Set pour éviter les doublons
    const addedPhotos = new Set<number>();

    for (const row of result) {
        const p = new AgpaPhoto();
        p.fromJSON(row);

        // On initialise la catégorie si besoin
        if (!edition.categories[p.categoryId].hasOwnProperty("photos")) {
            edition.categories[p.categoryId].photos = [];
            edition.categories[p.categoryId].userPhotos = [];
        }

        // Ajouter l'award si présent
        const award = awardsMap.get(p.id);
        if (award) {
            p.awards.set(p.categoryId, award);
        }

        // Ajouter aux photos de la catégorie (si a un award et pas déjà ajouté)
        if (award && !addedPhotos.has(p.id)) {
            edition.categories[p.categoryId].photos.push(p);
            addedPhotos.add(p.id);
        }

        // Ajouter aux photos de l'utilisateur
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
    console.log(`\n\n========== archiveCategory CALLED: year=${year}, catId=${catId} ==========\n`);

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

    // On récupère les photos triées par classement dans la catégorie
    // Priorité de tri:
    // 1. rankInCategory (V2026) si disponible
    // 2. Sinon par niveau d'award (diamond > gold > silver > bronze > nominated)
    // 3. Puis par scoreV2026 ou scoreV2010 en fallback
    const sql = `SELECT p.*, u.username, a.award as cat_award
        FROM agpa_photo p
        INNER JOIN "user" u ON u.id = p."userId"
        LEFT JOIN agpa_award a ON a."photoId" = p.id AND a."categoryId" = p."categoryId"
        WHERE p.year=${year} AND p."categoryId"=${catId}
        ORDER BY
            COALESCE(
                (p."scoreDetails"->'v2026'->>'rankInCategory')::int,
                CASE a.award
                    WHEN 'diamond' THEN 1
                    WHEN 'gold' THEN 2
                    WHEN 'sylver' THEN 3
                    WHEN 'bronze' THEN 4
                    WHEN 'nominated' THEN 5
                    ELSE 1000
                END
            ) ASC,
            p."scoreV2026" DESC NULLS LAST,
            p."scoreV2010" DESC NULLS LAST`;
    const result = await repo.query(sql);

    // Debug: afficher les premières photos pour vérifier le tri
    console.log(`[archiveCategory] SQL executed, photos count=${result.length}`);
    if (result.length > 0) {
        console.log('[archiveCategory] First 5 photos (raw from DB):');
        for (let i = 0; i < Math.min(5, result.length); i++) {
            const r = result[i];
            const rankInCat = r.scoreDetails?.v2026?.rankInCategory;
            console.log(`  ${i+1}. id=${r.id}, title="${r.title}", rankInCategory=${rankInCat}, scoreV2010=${r.scoreV2010}`);
        }
    }

    // Debug: vérifier directement les données triées par rankInCategory
    const debugSql = `SELECT id, title,
            "scoreDetails"->'v2026'->>'rankInCategory' as rank_in_cat,
            "scoreV2010"
        FROM agpa_photo
        WHERE year=${year} AND "categoryId"=${catId}
        ORDER BY ("scoreDetails"->'v2026'->>'rankInCategory')::int ASC NULLS LAST
        LIMIT 5`;
    const debugResult = await repo.query(debugSql);
    console.log('[archiveCategory] Debug query (sorted by rankInCategory):');
    for (const r of debugResult) {
        console.log(`  id=${r.id}, title="${r.title}", rank_in_cat=${r.rank_in_cat}, scoreV2010=${r.scoreV2010}`);
    }

    // On récupère les awards séparément
    const awardsSql = `SELECT a."photoId", a.award, a."categoryId" as "awardCategory"
        FROM agpa_award a
        INNER JOIN agpa_photo p ON p.id = a."photoId"
        WHERE p.year=${year} AND p."categoryId"=${catId}`;
    const awardsResult = await repo.query(awardsSql);
    const awardsMap = new Map<number, Array<{award: string, awardCategory: number}>>();
    for (const row of awardsResult) {
        if (!awardsMap.has(row.photoId)) {
            awardsMap.set(row.photoId, []);
        }
        awardsMap.get(row.photoId).push({ award: row.award, awardCategory: row.awardCategory });
    }

    // On construit la liste des photos dans l'ordre du classement
    for (const row of result) {
        const p = new AgpaPhoto();
        p.fromJSON(row);

        // Ajouter les awards
        const photoAwards = awardsMap.get(p.id) || [];
        for (const award of photoAwards) {
            p.awards.set(award.awardCategory, award.award);
        }

        photos.set(p.id, p);

        if (!(p.user.id in users)) {
            category.totalUsers += 1;
            users.push(p.user.id);
        }
    }
    category.photos = Array.from(photos.values());
    category.totalPhotos = category.photos.length;

    return category;
}
