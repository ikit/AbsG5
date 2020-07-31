import { User, LogModule, AgpaPhoto, AgpaCategory } from "../entities";
import { getMaxArchiveEdition, getCurrentEdition } from "../middleware/agpaCommonHelpers";
import { archiveSummary, archiveEdition, archiveCategory } from "../middleware/agpaArchiveHelper";
import { palmaresData } from "../middleware/agpaPalmaresHelper";
import { ceremonyData } from "../middleware/agpaCeremonyHelper";
import { logger } from "../middleware/logger";
import { getRepository, Equal } from "typeorm";
import { saveImage, shuffleArray } from "../middleware/commonHelper";
import * as path from "path";
import * as fs from "fs";

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
        const year = 2019; // getCurrentEdition();
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
     * 
     * @param photoData l'entrée du répertoire
     * @param image l'image pour illustrer la personne dans le répertoire
     * @param user l'utilisateur qui fait l'action
     */
    async savePhoto(photoData: any, image: any, user: User) {
        console.log("SAVE PHOTO", photoData)
        const photoId = Number.parseInt(photoData.id);
        let photo = new AgpaPhoto();
        if (photoId) {
            photo = await this.photoRepo.findOne(photoId);
        } else {
            // Ces inbfos ne peuvent pas être modifié une fois que la photo a été "créée"
            photo.year = new Date().getFullYear();
            photo.filename = `${new Date().getTime()}.jpg`;
        }
        photoData.id = photoId ? photoId : null; // pour éviter les problèmes lors du save en DB
        photo.user = user;
        photo.title = photoData.title;
        photo.categoryId = photoData.catId;
        photo.category = await this.catRepo.findOne(photoData.catId);

        photo = await this.photoRepo.save(photo);

        if (image) {
            const thumb = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/vignette_${photo.filename}`);
            const web = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/${photo.filename}`);
            const raw = path.join(process.env.PATH_FILES, `agpa/${photo.year}/${photo.filename}`);
            await saveImage(image.buffer, thumb, web, raw);
        }

        logger.notice(
            photoId
                ? `${user.username} a modifié la photo "${photo.title}" (id: ${photo.id}) des AGPA`
                : `Nouvelle photo "${photo.title}" (id: ${photo.id}) a été enregistré pour les AGPA par ${user.username}`,
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
            url: `${process.env.URL_FILES}agpa/${photo.year}/mini/${photo.filename}`
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
        if (photo && photo.user.id === user.id) {
            const thumb = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/vignette_${photo.filename}`);
            const web = path.join(process.env.PATH_FILES, `agpa/${photo.year}/mini/${photo.filename}`);
            const raw = path.join(process.env.PATH_FILES, `agpa/${photo.year}/${photo.filename}`);

            fs.unlinkSync(thumb);
            fs.unlinkSync(web);
            fs.unlinkSync(raw);
            await this.photoRepo.remove(photo);
        }

        return photo;
    }
}

export const agpaService = new AgpaService();
