import { getRepository } from "typeorm";
import {
    JsonController,
    Get,
    Authorized,
    Post,
    Param,
    QueryParam,
    CurrentUser,
    UploadedFile,
    Body,
    Res,
    Delete
} from "routing-controllers";
import { Photo, User } from "../entities";
import { PhotoAlbum } from "../entities/PhotoAlbum";
import { albumService } from "../services/AlbumService";
import * as path from "path";
import * as fs from "fs";
import { logger } from "../middleware/logger";

@Authorized()
@JsonController("/albums")
export class PhotoAlbumController {
    private repo = getRepository(Photo);
    private aRepo = getRepository(PhotoAlbum);

    /**
     * Récupère la liste des albums
     * @param user l'utilisateur qui demande à voir la liste
     */
    @Get("/")
    async listAlbums(@CurrentUser() user: User) {
        const albums = await this.aRepo
            .createQueryBuilder("a")
            .where(`a.family IS  NULL OR a.family = '${user.rootFamily}'`)
            .orderBy("a.order")
            .getMany();
        return albums.map(a => ({
            ...a,
            coverPhoto: `${process.env.URL_FILES}photos/${"absg_" + a.id.toString().padStart(4, "0")}/WEB/${
                a.coverPhoto
            }.jpg`
        }));
    }

    /**
     * Récupère les données pour initialiser le formulaire de création
     * d'album automatique
     */
    @Get("/auto")
    async autoAlbum() {
        return {
            totalPhoto: 3789,
            persons: ["Annie Gueudelot", "Gérard Gueudelot"],
            locations: ["Villons", "Lanslevillard", "Domaine de la Roche"],
            from: "1976",
            to: "2021"
        };
    }

    /**
     * Récupère parmi les photos triées celles qui répondent
     * aux critères de filtre fournit
     */
    @Post("/auto")
    async getAutoAlbum(filters) {
        // On génère le filtre en fonction de ce que l'utilisateur à demandé
        const where = [];
        if (filters.from) {
            where.push(`p.date >= ${filters.from}`);
        }
        if (filters.to) {
            where.push(`p.date <= ${filters.to}`);
        }
        if (filters.places) {
            where.push(`place in ('${filters.places.join("','")}')`);
        }
        if (filters.persons) {
            const pWhere = [];
            for (const p of filters.persons) {
                pWhere.push(`persons::text LIKE ('%${p}%')`);
            }
            where.push(`(${pWhere.join(" OR ")})`);
        }

        const photos = await this.repo
            .createQueryBuilder("p")
            .where(where.join(" AND "))
            .orderBy("p.date, ")
            .getMany();

        return photos.map(p => ({
            ...p,
            thumb: `${process.env.URL_FILES}photos/${p.folder}/THUMB/${p.id}.jpg`,
            url: `${process.env.URL_FILES}photos/${p.folder}/WEB/${p.id}.jpg`
        }));
    }

    /**
     * Donne toutes les infos concernant un album
     * @param id l'identifiant de l'album
     * @param user l'utilisateur qui fait la demande
     */
    @Get("/:id")
    async getAlbum(@Param("id") id: number, @CurrentUser() user: User) {
        const album = await this.aRepo
            .createQueryBuilder("a")
            .where(`a.id = ${id} AND (a.family IS  NULL OR a.family = '${user.rootFamily}')`)
            .getOne();

        // On récupère les photos
        if (album) {
            const folder = "absg_" + album.id.toString().padStart(4, "0");
            const photos = await this.repo
                .createQueryBuilder("p")
                .where(`p.folder = '${folder}'`)
                .leftJoinAndSelect("p.poster", "u")
                .getMany();

            album.photos = photos
                .map(p => ({
                    ...p,
                    thumb: `${process.env.URL_FILES}photos/${folder}/THUMB/${p.id}.jpg`,
                    url: `${process.env.URL_FILES}photos/${folder}/WEB/${p.id}.jpg`,
                    order: album.photos.findIndex(e => e === p.id)
                }))
                .sort((a, b) => a.order - b.order);
        }

        return album;
    }

    /**
     *  Met à jour l'album
     * @param id l'identifiant de l'album ) mettre à jour
     * @param album les données de l'album à mettre à jours
     */
    @Post("/:id")
    async saveAlbum(@Param("id") id: number, @Body() album: PhotoAlbum, @CurrentUser() user: User) {
        if (user && album && (!album.family || album.family === user.rootFamily)) {
            album.id = id;
            album.photos = album.photos.map(p => p.id);
            return this.aRepo.save(album);
        }
        return null;
    }

    /**
     * Donne toutes les infos concernant un album
     * @param id l'identifiant de l'album
     * @param user l'utilisateur qui fait la demande
     */
    @Get("/:id/download")
    async download(@Param("id") id: number, @CurrentUser() user: User, @Res() response) {
        try {
            const filePath = path.join(
                process.env.PATH_FILES,
                "/photos/",
                `${"absg_" + id.toString().padStart(4, "0")}/RAW.zip`
            );
            console.log(filePath);

            if (!fs.existsSync(filePath)) {
                // On crée le zip
                console.log("File not exists");
            }
            await new Promise<void>((resolve, reject) => {
                response.sendFile(filePath, (err: any) => {
                    if (err) reject(err);
                    resolve();
                });
            });
            // response.sendFile(filePath, "raw.zip");
            return response;
        } catch (err) {
            logger.error("Impossible de récupérer l'archive de l'album", err);
            throw new Error("Impossible de récupérer l'archive de l'album");
        }
    }

    /**
     * Enregistre une nouvelle photos dans l'album
     * @param image l'image
     * @param body d'autres informations sur l'image comme l'auteur et le titre
     */
    @Post("/:id/upload")
    async addPhoto(@UploadedFile("file") image: any, @Param("id") id: number, @CurrentUser() user: User) {
        return albumService.save(image, id, user);
    }

    /**
     * Supprime une photo de l'album
     * @param id l'identifiant de l'album
     * @param photoId l'identifiant de la photo
     * @param user l'utilisateur qui fait la demande
     */
    @Delete("/:id/:photoId")
    async deletePhoto(@Param("id") id: number, @Param("photoId") photoId: string, @CurrentUser() user: User) {
        return albumService.deletePhoto(id, photoId, user);
    }
}
