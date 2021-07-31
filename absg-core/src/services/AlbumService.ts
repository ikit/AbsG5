import { getRepository, Repository } from "typeorm";
import { User, LogModule, Photo } from "../entities";
import * as path from "path";
import * as fs from "fs";
import { logger } from "../middleware/logger";
import { saveImage } from "../middleware/commonHelper";
import { PhotoAlbum } from "../entities/PhotoAlbum";

class AlbumService {
    private pRepo: Repository<Photo> = null;
    private aRepo: Repository<PhotoAlbum> = null;

    public initService() {
        this.pRepo = getRepository(Photo);
        this.aRepo = getRepository(PhotoAlbum);
    }

    /**
     * Sauvegarde une image dans un album
     * @param image l'image
     * @param albumId l'identifiant de l'album
     * @param user l'utilisateur qui poste l'image
     */
    public async save(image: any, albumId: number, user: User) {
        const album = await this.aRepo
            .createQueryBuilder("a")
            .where(`a.id = ${albumId} AND (a.family IS  NULL OR a.family = '${user.rootFamily}')`)
            .getOne();

        const id = `${user.id.toString().padStart(4, "0")}_${new Date().getTime()}`;
        const folder = "absg_" + album.id.toString().padStart(4, "0");

        const photo = new Photo();
        photo.id = id;
        photo.poster = user;
        photo.folder = folder;
        // TODO: récupérer la date de prise de vue depuis les données EXIFS

        // On enregistre la photo et traite ses différentes tailles pour optimiser l'affichage web
        const thumb = path.join(process.env.PATH_FILES, `photos/${folder}/THUMB/${id}.jpg`);
        const web = path.join(process.env.PATH_FILES, `photos/${folder}/WEB/${id}.jpg`);
        const raw = path.join(process.env.PATH_FILES, `photos/${folder}/RAW/${id}.jpg`);
        await saveImage(image.buffer, thumb, web, raw);
        await this.pRepo.save(photo);

        // On met à jour l'album
        album.photos.push(id);
        await this.aRepo.save(album);

        logger.notice(`Nouvelle photo ajoutée par ${user.username} à l'album ${album.title}`, {
            userId: user.id,
            photoId: id,
            albumId: folder,
            module: LogModule.photos
        });

        return photo;
    }

    /**
     * Supprime une image d'un album
     * @param albumId l'identifiant de l'album
     * @param photoId l'identifiant de la photo
     * @param user l'utilisateur qui poste l'image
     */
    public async deletePhoto(albumId: number, photoId: string, user: User) {
        const album = await this.aRepo
            .createQueryBuilder("a")
            .where(`a.id = ${albumId} AND (a.family IS  NULL OR a.family = '${user.rootFamily}')`)
            .getOne();
        const folder = "absg_" + album.id.toString().padStart(4, "0");

        const photo = await this.pRepo
            .createQueryBuilder("p")
            .where(`p.id = '${photoId}' AND p.folder = '${folder}'`)
            .getOne();

        // On supprime la photo
        if (photo && user.is("admin")) {
            const thumb = path.join(process.env.PATH_FILES, `photos/${folder}/THUMB/${photoId}.jpg`);
            const web = path.join(process.env.PATH_FILES, `photos/${folder}/WEB/${photoId}.jpg`);
            const raw = path.join(process.env.PATH_FILES, `photos/${folder}/RAW/${photoId}.jpg`);

            // On essaye de supprimer les images (on ignore les erreurs potentiel si fichiers inexistant)
            try {
                fs.unlinkSync(thumb);
            } catch (err) {
                logger.warning(`Suppression photo ${photoId}/thumb impossible: ${JSON.stringify(err)}`, err);
            }
            try {
                fs.unlinkSync(web);
            } catch (err) {
                logger.warning(`Suppression photo ${photoId}/web impossible: ${JSON.stringify(err)}`, err);
            }
            try {
                fs.unlinkSync(raw);
            } catch (err) {
                logger.warning(`Suppression photo ${photoId}/raw impossible: ${JSON.stringify(err)}`, err);
            }

            await this.pRepo.delete(photo);
        }

        // On met à jour l'album
        const pIdx = album.photos.findIndex(pId => pId === photoId);
        if (pIdx > -1) {
            album.photos.splice(pIdx, 1);
            await this.aRepo.save(album);
        }

        logger.notice(`Photo supprimée par ${user.username} dans l'album ${album.title}`, {
            userId: user.id,
            photoId: photoId,
            albumId: folder,
            module: LogModule.photos
        });

        return photo;
    }
}

export const albumService = new AlbumService();
