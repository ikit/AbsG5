import { User, LogModule, AgpaPhoto, AgpaCategory } from "../entities";
import { getMaxArchiveEdition, getCurrentEdition, getMetaData } from "../middleware/agpaCommonHelpers";
import { archiveSummary, archiveEdition, archiveCategory } from "../middleware/agpaArchiveHelper";
import {
    p4AgpaAttribution,
    p4CheckVotes,
    p4ComputeNotes,
    p4DiamondAttribution
} from "../middleware/agpaAlgorithmsHelper";
import { palmaresData } from "../middleware/agpaPalmaresHelper";
import { ceremonyData } from "../middleware/agpaCeremonyHelper";
import { logger } from "../middleware/logger";
import { getRepository, Equal } from "typeorm";
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
     * Récupère les données pour une cérémonie donnée
     * @param year l'année de la cérémonie
     */
    getCeremonyData(year: number) {
        if (year >= 2006 && year <= getMaxArchiveEdition()) {
            return ceremonyData(year);
        }
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
        sql = `SELECT p.*
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
                    userPhotoIds: [],
                    totalPhotos: 0,
                    totalUsers: 0,
                    maxVotes: 0
                };
            }
            result.categories[p.categoryId].photos.push(p);
            if (p.userId === user.id) {
                result.categories[p.categoryId].userPhotoIds.push(p.id);
            }
        }

        // Pour chaque catégories
        for (const c of result.categories) {
            if (c) {
                c.photos.sort((a, b) => a.number - b.number);
                c.totalPhotos = c.photos.length;
                c.totalUsers = new Set(c.photos.map(p => p.userId)).size;
                c.maxVotes = Math.round(c.photos.length / 2);
            }
        }
        return result;
    }

    /**
     * Dépuillement
     * Effectue la série d'action nécessaire (étape par étape) pour calculer les points
     * de chaques de photos et leur attribuer les récompenses en départageant les exaequos
     * @param user l'utilisateur qui en fait la demande
     */
    async getP4Data(year: number, user: User) {
        let context = null;
        if (user.is("admin")) {
            // On récupère le contexte
            context = await getMetaData(year, true);

            // Récupérer les votes et les vérifier
            context = await p4CheckVotes(context);

            // Comptabiliser les votes correctes et calculer les notes pour chaque photo
            context = await p4ComputeNotes(context);

            // Attributions AGPA et création d'un "premier" palmares
            context = await p4AgpaAttribution(context);

            // 4- Attribution des AGPA de diamant
            context = await p4DiamondAttribution(context);
        }
        return context;
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
            photo.year = new Date().getFullYear();
            photo.filename = `${new Date().getTime()}.jpg`;
        }
        photoData.id = photoId ? photoId : null; // pour éviter les problèmes lors du save en DB
        photo.user = !photo.user ? user : photo.user;
        photo.title = photoData.title ? photoData.title : photo.title;
        photo.categoryId = photoData.catId ? photoData.catId : photo.category.id;
        photo.error = photoData.error ? JSON.parse(photoData.error) : photo.error;
        photo.category = await this.catRepo.findOne(photo.categoryId);

        photo = await this.photoRepo.save(photo);

        if (image) {
            const thumb = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/vignette_${photo.filename}`);
            const web = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/${photo.filename}`);
            const raw = path.join(process.env.PATH_FILES, `agpa/${photo.year}/${photo.filename}`);
            await saveImage(image.buffer, thumb, web, raw);
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
            console.log("UPDATE", v, vote);
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
        console.log(sql);
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
}

export const agpaService = new AgpaService();
