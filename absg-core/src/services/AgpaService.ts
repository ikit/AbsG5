import { User, LogModule, AgpaPhoto, AgpaCategory, AgpaAwardType } from "../entities";
import { getMaxArchiveEdition, getCurrentEdition, getMetaData } from "../middleware/agpaCommonHelpers";
import { archiveSummary, archiveEdition, archiveCategory } from "../middleware/agpaArchiveHelper";
import {
    monitoringStats,
    p4AgpaAttribution,
    p4CheckVotes,
    p4ComputeNotes,
    p4DiamondAttribution,
    p4HonorAttribution
} from "../middleware/agpaAlgorithmsHelper";
import { palmaresData } from "../middleware/agpaPalmaresHelper";
import { ceremonyData } from "../middleware/agpaCeremonyHelper";
import { analyzeVoteProfiles, analyzeSlidingProfiles, UserData, YearData } from "../middleware/agpaVoteProfilesHelper";
import { logger } from "../middleware/logger";
import { Equal } from "typeorm";
import { getRepository } from "../middleware/database";
import { saveImage, shuffleArray } from "../middleware/commonHelper";
import * as path from "path";
import * as fs from "fs";
import { websocketService, WSMessageType } from "./WebsocketService";

class AgpaService {
    photoRepo = null;
    catRepo = null;
    /**
     * Initialisation du service
     */
    initService() {
        // Rien à faire
        this.photoRepo = getRepository(AgpaPhoto);
        this.catRepo = getRepository(AgpaCategory);
    }

    /**
     * Retourne les informations sur les anciennes éditions
     * @param user l'utilisateur qui demande les informations
     */
    getArchiveSummary(user: User) {
        return archiveSummary(user);
    }

    /**
     * Retourne les informations sur une ancienne édition
     * @param year l'année de l'édition
     * @param user l'utilisateur qui demande les informations
     */
    getArchiveEdition(year: number, user: User) {
        if (year >= 2006 && year <= getMaxArchiveEdition()) {
            return archiveEdition(year, user);
        }
        return null;
    }

    /**
     * Retourne les informations sur une catégorie d'une édition
     * @param year l'année de l'édition
     * @param catId l'id de la catégorie
     * @param user l'utilisateur qui demande les informations
     */
    getArchiveCategory(year: number, catId: number, user: User) {
        if (year >= 2006 && year <= getMaxArchiveEdition()) {
            return archiveCategory(year, catId, user);
        }
        return null;
    }

    /**
     * Récupère toutes les statistiques "palmarès" de l'ensemble des éditions
     */
    getPalmaresData() {
        return palmaresData(null, null);
    }

    /**
     * Récupère les statistiques "palmarès glissant" pour les 3 dernières éditions
     */
    async getSlidingPalmaresData() {
        const maxYear = getMaxArchiveEdition();
        const fromYear = Math.max(2006, maxYear - 2); // 3 dernières années
        const palmares = await palmaresData(fromYear, maxYear);
        return {
            palmares: palmares,
            yearFrom: fromYear,
            yearTo: maxYear
        };
    }

    /**
     * Récupère les données pour une cérémonie donnée
     * @param year l'année de la cérémonie
     */
    async getCeremonyData(year: number) {
        if (year >= 2006 && year <= getCurrentEdition()) {
            // On clos la cérémonie par mesure de sécurité
            if (year === getCurrentEdition()) {
                await this.closeEdition();
            }
            return ceremonyData(year);
        }
        logger.warning(`Cérémonie ${year} non disponible`);
        return null;
    }

    /**
     * Route appelé par le maitre de cérémonie pour notifier les autres utilisateurs
     * de changer de page automatiquement
     * @param year année de la cérémonie
     * @param slide index de la page à afficher
     * @param hash la signature du slide
     * @param user l'utilisateur qui fait cet appel
     */
    notifyMasterSlide(year: number, slide: number, hash: string, user: User) {
        websocketService.broadcast({
            message: WSMessageType.agpaSynchSlide,
            payload: { year, slide, hash, user }
        });
        return null;
    }

    /**
     * Récupère les données concernant la phase 1 des AGPAS
     * @param user l'utilisateur qui en fait la demande
     */
    async getP1Data(user: User) {
        const year = getCurrentEdition();
        let sql = `SELECT p.*
            FROM agpa_photo p
            INNER JOIN agpa_category c ON p."categoryId" = c.id
            WHERE p.year=${year} AND p."userId"=${user.id}
            ORDER BY c."order" ASC, p.id ASC`;
        const photos = (await this.catRepo.query(sql)).map(e => ({
            ...e,
            thumb: `${process.env.URL_FILES}agpa/${e.year}/mini/vignette_${e.filename}`,
            url: `${process.env.URL_FILES}agpa/${e.year}/mini/${e.filename}`
        }));

        // Get stats
        sql = `SELECT "categoryId", count (*) as "totalPhotos", count(distinct("userId")) as "totalUsers"
            FROM agpa_photo
            WHERE year=${year} AND "categoryId" > 0
            GROUP BY "categoryId"`;

        return {
            photos,
            stats: await this.catRepo.query(sql)
        };
    }

    /**
     * Récupère les données concernant la phase 2 des AGPAS
     * @param user l'utilisateur qui en fait la demande
     */
    async getP2Data(user: User) {
        const year = getCurrentEdition();
        const sql = `SELECT p.*
            FROM agpa_photo p
            INNER JOIN agpa_category c ON p."categoryId" = c.id
            WHERE p.year=${year}
            ORDER BY c."order" ASC, p.id ASC`;
        const photos = (await this.catRepo.query(sql)).map(e => ({
            ...e,
            thumb: `${process.env.URL_FILES}agpa/${e.year}/mini/vignette_${e.filename}`,
            url: `${process.env.URL_FILES}agpa/${e.year}/mini/${e.filename}`
        }));

        const result = {
            categories: [],
            warningPhotos: []
        };

        for (const p of photos) {
            // On ajoute la photo à la liste de la catégorie concernée
            if (!result.categories[p.categoryId]) {
                result.categories[p.categoryId] = {
                    categoryId: p.categoryId,
                    photos: [],
                    userPhotoIds: [],
                    totalPhotos: 0,
                    totalUsers: 0
                };
            }
            result.categories[p.categoryId].photos.push(p);
            if (p.userId === user.id) {
                result.categories[p.categoryId].userPhotoIds.push(p.id);
            }

            // Si la photo à un warning, on l'ajoute à la liste
            if (p.error) {
                result.warningPhotos.push(p);
            }
        }

        // Pour chaque catégories
        for (const c of result.categories) {
            if (c) {
                shuffleArray(c.photos);
                c.totalPhotos = c.photos.length;
                c.totalUsers = new Set(c.photos.map(p => p.userId)).size;
            }
        }
        return result;
    }

    /**
     * Récupère les données concernant la phase 3 des AGPAS
     * @param user l'utilisateur qui en fait la demande
     */
    async getP3Data(user: User) {
        const year = getCurrentEdition();

        // On récupère les votes
        let sql = `SELECT v.*
            FROM agpa_vote v
            WHERE v.year=${year} AND v."userId"=${user.id}`;
        const votes = await this.catRepo.query(sql);

        // On récupère les photos
        sql = `SELECT p.id, p.error, p.filename, p.number, p.title, p."userId", p."categoryId", p.year
            FROM agpa_photo p
            INNER JOIN agpa_category c ON p."categoryId" = c.id
            WHERE p.year=${year}
            ORDER BY c."order" ASC, p.id ASC`;
        const photos = (await this.catRepo.query(sql)).map(e => ({
            ...e,
            thumb: `${process.env.URL_FILES}agpa/${e.year}/mini/vignette_${e.filename}`,
            url: `${process.env.URL_FILES}agpa/${e.year}/mini/${e.filename}`
        }));

        const result = {
            categories: [],
            votes: {
                votes: votes,
                totalTitleVotes: votes.filter(v => v.categoryId === -3).length
            }
        };

        for (const p of photos) {
            // On ajoute la photo à la liste de la catégorie concernée
            if (!result.categories[p.categoryId]) {
                result.categories[p.categoryId] = {
                    categoryId: p.categoryId,
                    photos: [],
                    totalPhotos: 0,
                    totalUsers: 0,
                    maxVotes: 0
                };
            }
            result.categories[p.categoryId].photos.push(p);
        }

        // Pour chaque catégories
        for (const c of result.categories) {
            if (c) {
                if (c.photos[0].number) {
                    // Si les photos ont un numéro, on les tris en fonction de ce numéro*
                    c.photos.sort((a, b) => a.number - b.number);
                } else {
                    // Sinon, on mélange les photos et on leur attribu un numéro
                    shuffleArray(c.photos);
                    for (let idx = 0; idx < c.photos.length; idx++) {
                        c.photos[idx].number = idx + 1;
                    }
                    await this.photoRepo.save(c.photos);
                }
                // Pour chaque photos: on supprime l'info user, et on indique s'il s'agit d'une photo de l'utilsiateur
                for (const p of c.photos) {
                    p.enableVotes = p.userId != user.id && !p.error;
                    delete p.userId;
                }
                c.totalPhotos = c.photos.length;
                c.totalUsers = new Set(c.photos.map(p => p.userId)).size;
                c.maxVotes = Math.round(c.photos.length / 2);
            }
        }
        return result;
    }

    /**
     * Effectue la série d'action nécessaire (étape par étape) pour calculer les points
     * de chaques de photos et leur attribuer les récompenses en départageant les exaequos
     * Cete méthode permet aussi bien le calcul des résultats d'une édition que sa supervision
     * en controlant que tout se passe bien.
     * @param user l'utilisateur qui en fait la demande
     */
    async monitoring(year: number, user: User) {
        let context = null;
        // On récupère le contexte
        context = await getMetaData(year, true);

        // Récupérer les votes et les vérifier
        context = await p4CheckVotes(context);

        // Comptabiliser les votes correctes et calculer les notes pour chaque photo
        context = await p4ComputeNotes(context);

        // Attributions AGPA et création d'un "premier" palmares
        context = await p4AgpaAttribution(context);

        // Attribution des AGPA de diamant
        context = await p4DiamondAttribution(context);

        // Attribution des AGPA d'honneur
        context = await p4HonorAttribution(context);

        // Stats
        context = await monitoringStats(context);

        // On ajoute aux photos les vignettes et url
        for (const pId of Object.keys(context.photos)) {
            const p = context.photos[pId];
            context.photos[pId].thumb = `${process.env.URL_FILES}agpa/${p.year}/mini/vignette_${p.filename}`;
            context.photos[pId].url = `${process.env.URL_FILES}agpa/${p.year}/mini/${p.filename}`;
        }
        return context;
    }

    /**
     * Clos l'édition en cours si nécessaire
     */
    async closeEdition() {
        const currentYear = getCurrentEdition();
        // On récupère le contexte
        let context = await getMetaData(currentYear, true);
        let awards = await this.catRepo.query(`SELECT * FROM agpa_award WHERE year = ${context.year}`);
        if (context.phase === 4 && awards.length === 0) {
            // On calcul les awards de l'édition en cours
            context = await getMetaData(context.year, true);
            context = await p4CheckVotes(context);
            context = await p4ComputeNotes(context);
            context = await p4AgpaAttribution(context);
            context = await p4DiamondAttribution(context);
            context = await p4HonorAttribution(context);
            // On récpère des agpas des catégories normales et meilleurs titre
            for (const pid in context.photos) {
                const p = context.photos[pid];
                let a = Array.isArray(p.awards) ? p.awards : [];
                a = a.map(e => ({ ...e, photoId: +pid, userId: p.userId }));
                awards = awards.concat(a);
            }
            // On récupère des meilleurs photographes
            for (const uid in context.users) {
                const u = context.users[uid];
                let a = Array.isArray(u.awards) ? u.awards : [];
                a = a.filter(e => e.categoryId === -1 || e.award === AgpaAwardType.honor);
                a = a.map(e => ({ ...e, userId: u.id }));
                awards = awards.concat(a);
            }

            awards.sort((a, b) => {
                return a.categoryId - b.categoryId;
            });

            // On sauvegarde les awards en base de donnée
            let sql = [];
            for (const a of awards) {
                if (a.categoryId === -1) {
                    sql.push(`(${currentYear}, ${a.categoryId}, ${a.userId}, NULL, '${a.award}')`);
                } else {
                    sql.push(`(${currentYear}, ${a.categoryId}, ${a.userId}, ${a.photoId}, '${a.award}')`);
                }
            }
            this.catRepo.query(
                `INSERT INTO agpa_award (year, "categoryId", "userId", "photoId", award) VALUES ${sql.join(",")};`
            );

            // On met à jours les résultats pour les photos de l'édition
            sql = [];
            for (const pid in context.photos) {
                const p = context.photos[pid];
                sql.push(`UPDATE agpa_photo SET 
                    ranking=${context.photosOrder.findIndex(e => e === p.id) + 0}, 
                    votes=${p.votes}, 
                    "votesTitle"=${p.votesTitle}, 
                    score=${p.score},
                    gscore=${p.gscore}
                    WHERE id=${p.id}`);
            }
            this.catRepo.query(sql.join(";"));
        }

        return awards;
    }

    /**
     * Met à jour les inforlation d'une photo
     * @param photoData l'entrée du répertoire
     * @param image l'image pour illustrer la personne dans le répertoire
     * @param user l'utilisateur qui fait l'action
     */
    async savePhoto(photoData: any, image: any, user: User) {
        const photoId = Number.parseInt(photoData.id);
        let photo = new AgpaPhoto();
        if (photoId) {
            photo = await this.photoRepo.findOne({ where: { id: Equal(photoId) }, relations: ["user", "category"] });
        } else {
            // Ces inbfos ne peuvent pas être modifié une fois que la photo a été "créée"
            photo.year = getCurrentEdition();
            photo.filename = `${new Date().getTime()}.jpg`;
        }
        photoData.id = photoId ? photoId : null; // pour éviter les problèmes lors du save en DB
        photo.user = !photo.user ? user : photo.user;
        // Set title, use "(sans titre)" if empty or null
        const titleValue = photoData.title?.trim();
        photo.title = titleValue || photo.title || "(sans titre)";
        photo.categoryId = photoData.catId ? photoData.catId : photo.category.id;
        photo.error = photoData.error ? JSON.parse(photoData.error) : photo.error;
        photo.category = await this.catRepo.findOne({ where: { id: photo.categoryId } });

        photo = await this.photoRepo.save(photo);

        // Handle rotation - if rotation is provided without new image, rotate existing files
        const rotation = Number.parseInt(photoData.rotation) || 0;

        if (image) {
            const thumb = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/vignette_${photo.filename}`);
            const web = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/${photo.filename}`);
            const raw = path.join(process.env.PATH_FILES, `agpa/${photo.year}/${photo.filename}`);
            // express-fileupload with useTempFiles uses 'tempFilePath', otherwise 'data' or 'buffer'
            const imageSource = image.tempFilePath || image.data || image.buffer;
            await saveImage(imageSource, thumb, web, raw, rotation);
        } else if (rotation !== 0 && photoId) {
            // Rotation without new image: rotate existing files
            const raw = path.join(process.env.PATH_FILES, `agpa/${photo.year}/${photo.filename}`);
            const thumb = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/vignette_${photo.filename}`);
            const web = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/${photo.filename}`);

            // Read existing original and re-save with rotation
            if (fs.existsSync(raw)) {
                await saveImage(raw, thumb, web, raw, rotation);
            }
        }

        // Ce log n'est visible que par les admins
        logger.info(
            photoId
                ? `${user.username} a modifié la photo (id: ${photo.id}) des AGPA`
                : `Nouvelle photo (id: ${photo.id}) a été enregistrée pour les AGPA par ${user.username}`,
            {
                userId: user.id,
                module: LogModule.agpa
            }
        );
        return {
            title: photo.title,
            id: photo.id,
            categoryId: photo.categoryId,
            authorId: photo.user.id,
            thumb: `${process.env.URL_FILES}agpa/${photo.year}/mini/vignette_${photo.filename}`,
            url: `${process.env.URL_FILES}agpa/${photo.year}/mini/${photo.filename}`,
            error: photo.error
        };
    }

    /**
     * Supprime la photo du concours
     * @param id l'id de la photo à supprimer
     * @param user l'utilisateur qui en fait la demande
     */
    async deletePhoto(id: number, user: User) {
        // On récupère les données en base
        const photo = await this.photoRepo.findOne({
            where: { id: Equal(id) },
            relations: ["user"]
        });

        // On supprime la photo du server
        if (photo && (user.is("admin") || photo.user.id === user.id)) {
            const thumb = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/vignette_${photo.filename}`);
            const web = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/${photo.filename}`);
            const raw = path.join(process.env.PATH_FILES, `agpa/${photo.year}/${photo.filename}`);

            // On essaye de supprimer les images (on ignore les erreurs potentiel si fichiers inexistant)
            try {
                fs.unlinkSync(thumb);
            } catch (err) {
                logger.warning(`Suppression photo ${id}/thumb impossible: ${JSON.stringify(err)}`, err);
            }
            try {
                fs.unlinkSync(web);
            } catch (err) {
                logger.warning(`Suppression photo ${id}/web impossible: ${JSON.stringify(err)}`, err);
            }
            try {
                fs.unlinkSync(raw);
            } catch (err) {
                logger.warning(`Suppression photo ${id}/raw impossible: ${JSON.stringify(err)}`, err);
            }

            await this.photoRepo.remove(photo);
        }

        return photo;
    }

    /**
     * Met à jour le vote d'un utilisateur pour une photo
     * @param photoId l'identifiant de la photo à modifier (doit être de l'édition en cours)
     * @param vote le vote de l'utilisateur (1, 2 ou -3)
     * @param user l'utilisateur qui fait la demande
     */
    async vote(photoId, vote, user) {
        const year = getCurrentEdition();

        // On récupère la photo
        const photo = await this.photoRepo.findOne({ where: { id: Equal(photoId) }, relations: ["user", "category"] });
        if (!photo) {
            throw Error(`La photo n°${photoId} n'existe pas`);
        }
        if (photo.year != year) {
            throw Error(`Vous ne pouvez voter que pour les photos de l'édition ${year}`);
        }
        if (photo.userId === user.id) {
            throw Error(`Vous ne pouvez pas voter pour vos propres photos`);
        }

        // On récupère l'ensemble des votes de l'utilisateur
        let sql = `SELECT v.*
            FROM agpa_vote v
            WHERE v.year=${year} AND v."userId"=${user.id}`;
        const votes = await this.catRepo.query(sql);

        // On met à jour le vote pour le meilleur titre
        if (vote === -3) {
            const v = votes.find(v => v.photoId === photoId && v.categoryId === -3 && v.userId === user.id);
            if (v) {
                // Si vote meilleur titre existe déjà, alors on le supprime
                sql = `DELETE FROM agpa_vote WHERE id=${v.id};`;
            } else {
                // Si pas de vote déjà en base, on le crée
                sql = `INSERT INTO agpa_vote (year, score, "categoryId", "userId", "photoId") VALUES (${year}, 0, -3, ${user.id}, ${photoId});`;
            }
        }
        // On met à jour le vote pour la photo
        else {
            const v = votes.find(v => v.photoId === photoId && v.categoryId !== -3 && v.userId === user.id);
            if (v) {
                // Si vote existe déjà, alors
                if (v.score === vote) {
                    // On le supprime le vote si même valeur => annulation d'un vote existant
                    sql = `DELETE FROM agpa_vote WHERE id=${v.id};`;
                } else {
                    // sinon on met à jours sa valeur
                    sql = `UPDATE agpa_vote SET score=${v.score === 1 ? 2 : 1} WHERE id=${v.id};`;
                }
            } else {
                // Si pas de vote déjà en base, on le crée
                sql = `INSERT INTO agpa_vote (year, score, "categoryId", "userId", "photoId") VALUES (${year}, ${vote}, ${photo.category.id}, ${user.id}, ${photoId});`;
            }
        }
        // On sauvegarde
        await this.catRepo.query(sql);

        // On récupère l'ensemble des votes de l'utilisateur
        sql = `SELECT v.*
            FROM agpa_vote v
            WHERE v.year=${year} AND v."userId"=${user.id}`;
        const result = await this.catRepo.query(sql);
        return {
            votes: result,
            totalTitleVotes: result.filter(v => v.categoryId === -3).length
        };
    }

    /**
     * Analyse les profils de votes pour une année donnée
     * Attribution de badges amusants basés sur les comportements de vote
     * @param year l'année de l'édition à analyser
     */
    async getVoteProfiles(year: number) {
        // Récupération des votes de l'année
        const votesQuery = `
            SELECT
                v."userId" as "from",
                p."userId" as "to",
                v.score as weight
            FROM agpa_vote v
            INNER JOIN agpa_photo p ON v."photoId" = p.id
            WHERE v.year = ${year} AND v."categoryId" > 0
        `;
        const votesData = await this.catRepo.query(votesQuery);

        // Transformation des votes au format attendu par l'helper
        const votes: Array<[string, string, number]> = votesData.map(v => [
            v.from.toString(),
            v.to.toString(),
            v.weight
        ]);

        // Récupération des données utilisateurs
        const usersQuery = `
            SELECT
                u.id,
                u.username,
                u."rootFamily",
                p.sex
            FROM public."user" u
            LEFT JOIN person p ON u."personId" = p.id
            WHERE u.id IN (
                SELECT DISTINCT "userId" FROM agpa_photo WHERE year = ${year}
                UNION
                SELECT DISTINCT "userId" FROM agpa_vote WHERE year = ${year}
            )
        `;
        const usersData = await this.catRepo.query(usersQuery);

        // Transformation des utilisateurs au format attendu par l'helper
        const users: Record<string, UserData> = {};
        usersData.forEach(u => {
            users[u.id.toString()] = {
                username: u.username,
                rootFamily: u.rootFamily || 'autre',
                sex: u.sex || 'undefined'
                // TODO: Ajouter spouse et children quand ces données seront disponibles en base
            };
        });

        // Analyse des profils via l'helper
        const profiles = analyzeVoteProfiles(votes, users);

        return profiles;
    }

    /**
     * Analyse les badges d'évolution sur les 3 dernières éditions
     * @param endYear l'année de fin (par défaut: dernière édition archivée)
     */
    async getSlidingBadges(endYear: number = null) {
        const maxYear = endYear || getMaxArchiveEdition();
        const years = [maxYear - 2, maxYear - 1, maxYear].filter(y => y >= 2006);

        // Si on n'a pas 3 années disponibles, on retourne un objet vide
        if (years.length < 3) {
            return {};
        }

        // Récupérer les données pour chaque année
        const usersYearData: Record<string, YearData[]> = {};

        for (const year of years) {
            // Récupérer les résultats de l'année
            const resultsQuery = `
                SELECT
                    p."userId",
                    p."categoryId",
                    a.type as "awardType",
                    SUM(v.score) as "totalPoints"
                FROM agpa_photo p
                LEFT JOIN agpa_vote v ON v."photoId" = p.id AND v.year = ${year}
                LEFT JOIN agpa_award a ON a."photoId" = p.id AND a.year = ${year}
                WHERE p.year = ${year} AND p."categoryId" > 0
                GROUP BY p."userId", p."categoryId", a.type
            `;
            const resultsData = await this.catRepo.query(resultsQuery);

            // Organiser les données par utilisateur
            const userStats: Record<string, {
                totalPoints: number;
                golds: number;
                sylvers: number;
                bronzes: number;
                diamonds: number;
                nominated: number;
                podiums: number;
                categories: string[];
                categoriesWithAwards: Record<string, string>;
            }> = {};

            resultsData.forEach(row => {
                const userId = row.userId.toString();
                if (!userStats[userId]) {
                    userStats[userId] = {
                        totalPoints: 0,
                        golds: 0,
                        sylvers: 0,
                        bronzes: 0,
                        diamonds: 0,
                        nominated: 0,
                        podiums: 0,
                        categories: [],
                        categoriesWithAwards: {}
                    };
                }

                userStats[userId].totalPoints += parseFloat(row.totalPoints) || 0;

                const categoryId = row.categoryId.toString();

                if (row.awardType === AgpaAwardType.gold) {
                    userStats[userId].golds++;
                    userStats[userId].podiums++;
                    userStats[userId].categories.push(categoryId);
                    userStats[userId].categoriesWithAwards[categoryId] = 'gold';
                } else if (row.awardType === AgpaAwardType.sylver) {
                    userStats[userId].sylvers++;
                    userStats[userId].podiums++;
                    userStats[userId].categoriesWithAwards[categoryId] = 'sylver';
                } else if (row.awardType === AgpaAwardType.bronze) {
                    userStats[userId].bronzes++;
                    userStats[userId].podiums++;
                    userStats[userId].categoriesWithAwards[categoryId] = 'bronze';
                } else if (row.awardType === AgpaAwardType.diamond) {
                    userStats[userId].diamonds++;
                    userStats[userId].categoriesWithAwards[categoryId] = 'diamond';
                } else if (row.awardType === AgpaAwardType.nominated) {
                    userStats[userId].nominated++;
                    userStats[userId].categoriesWithAwards[categoryId] = 'nominated';
                }
            });

            // Ajouter les données de l'année pour chaque utilisateur
            Object.keys(userStats).forEach(userId => {
                if (!usersYearData[userId]) {
                    usersYearData[userId] = [];
                }

                usersYearData[userId].push({
                    year,
                    totalPoints: userStats[userId].totalPoints,
                    golds: userStats[userId].golds,
                    sylvers: userStats[userId].sylvers,
                    bronzes: userStats[userId].bronzes,
                    diamonds: userStats[userId].diamonds,
                    nominated: userStats[userId].nominated,
                    podiums: userStats[userId].podiums,
                    categories: userStats[userId].categories,
                    categoriesWithAwards: userStats[userId].categoriesWithAwards
                });
            });
        }

        // S'assurer que chaque utilisateur a des données pour les 3 années (remplir avec des 0 si absent)
        Object.keys(usersYearData).forEach(userId => {
            const userYears = usersYearData[userId];
            const existingYears = new Set(userYears.map(d => d.year));

            years.forEach(year => {
                if (!existingYears.has(year)) {
                    usersYearData[userId].push({
                        year,
                        totalPoints: 0,
                        golds: 0,
                        sylvers: 0,
                        bronzes: 0,
                        diamonds: 0,
                        nominated: 0,
                        podiums: 0,
                        categories: [],
                        categoriesWithAwards: {}
                    });
                }
            });

            // Trier par année
            usersYearData[userId].sort((a, b) => a.year - b.year);
        });

        // Analyser les badges d'évolution
        const slidingProfiles = analyzeSlidingProfiles(usersYearData);

        return slidingProfiles;
    }

    /**
     * Récupère l'historique complet des badges d'un utilisateur
     * Permet de savoir quels badges ont été obtenus et sur quelles années
     * @param user l'utilisateur concerné
     */
    async getMyBadgesHistory(user: User) {
        const maxYear = getMaxArchiveEdition();

        // On va chercher les badges pour toutes les années depuis 2006
        const allYears = [];
        for (let year = 2006; year <= maxYear; year++) {
            allYears.push(year);
        }

        const badgeHistory: Record<string, {
            badge: string;
            years: number[];
            isActive: boolean; // Obtenu au moins une fois sur les 3 dernières éditions
            everObtained: boolean; // Obtenu au moins une fois toutes éditions confondues
            type: 'voter' | 'photographer' | 'combo';
        }> = {};

        const last3Years = [maxYear - 2, maxYear - 1, maxYear].filter(y => y >= 2006);

        // Récupérer les profils de vote pour toutes les années
        for (const year of allYears) {
            const profiles = await this.getVoteProfiles(year);

            if (profiles && profiles[user.id]) {
                const userProfiles = profiles[user.id];

                // Traiter le badge votant
                if (userProfiles.voterProfile) {
                    const badgeName = userProfiles.voterProfile.badge;
                    if (!badgeHistory[badgeName]) {
                        badgeHistory[badgeName] = {
                            badge: badgeName,
                            years: [],
                            isActive: false,
                            everObtained: false,
                            type: 'voter'
                        };
                    }
                    badgeHistory[badgeName].years.push(year);
                    badgeHistory[badgeName].everObtained = true;
                    if (last3Years.includes(year)) {
                        badgeHistory[badgeName].isActive = true;
                    }
                }

                // Traiter le badge photographe
                if (userProfiles.photographerProfile) {
                    const badgeName = userProfiles.photographerProfile.badge;
                    if (!badgeHistory[badgeName]) {
                        badgeHistory[badgeName] = {
                            badge: badgeName,
                            years: [],
                            isActive: false,
                            everObtained: false,
                            type: 'photographer'
                        };
                    }
                    badgeHistory[badgeName].years.push(year);
                    badgeHistory[badgeName].everObtained = true;
                    if (last3Years.includes(year)) {
                        badgeHistory[badgeName].isActive = true;
                    }
                }

                // Traiter le badge combo
                if (userProfiles.comboProfile) {
                    const badgeName = userProfiles.comboProfile.badge;
                    if (!badgeHistory[badgeName]) {
                        badgeHistory[badgeName] = {
                            badge: badgeName,
                            years: [],
                            isActive: false,
                            everObtained: false,
                            type: 'combo'
                        };
                    }
                    badgeHistory[badgeName].years.push(year);
                    badgeHistory[badgeName].everObtained = true;
                    if (last3Years.includes(year)) {
                        badgeHistory[badgeName].isActive = true;
                    }
                }
            }
        }

        // Récupérer aussi les badges de progression (basés sur 3 ans)
        // On va analyser toutes les fenêtres glissantes de 3 ans
        for (let endYear = 2008; endYear <= maxYear; endYear++) {
            const slidingBadges = await this.getSlidingBadges(endYear);

            if (slidingBadges && slidingBadges[user.id]) {
                const userBadges = slidingBadges[user.id];

                userBadges.forEach(badge => {
                    const badgeName = badge.badge;

                    // On considère que le badge est obtenu l'année de fin de la fenêtre
                    if (!badgeHistory[badgeName]) {
                        badgeHistory[badgeName] = {
                            badge: badgeName,
                            years: [],
                            isActive: false,
                            everObtained: false,
                            type: 'combo' // Les badges de progression sont dans la catégorie combo
                        };
                    }

                    // Éviter les doublons d'années
                    if (!badgeHistory[badgeName].years.includes(endYear)) {
                        badgeHistory[badgeName].years.push(endYear);
                        badgeHistory[badgeName].everObtained = true;
                        if (last3Years.includes(endYear)) {
                            badgeHistory[badgeName].isActive = true;
                        }
                    }
                });
            }
        }

        return {
            badgeHistory,
            last3Years,
            allYears
        };
    }
}

export const agpaService = new AgpaService();
