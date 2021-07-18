import { getRepository } from "typeorm";
import {
    JsonController,
    Get,
    Authorized,
    Post,
    Param,
    QueryParam,
    CurrentUser,
    UploadedFile
} from "routing-controllers";
import { Photo, User } from "../entities";
import { PhotoAlbum } from "../entities/PhotoAlbum";
import { albumService } from "../services/AlbumService";

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
     * Enregistre une nouvelle photos dans l'album
     * @param image l'image
     * @param body d'autres informations sur l'image comme l'auteur et le titre
     */
    @Post("/:id/upload")
    async save(@UploadedFile("file") image: any, @Param("id") id: number, @CurrentUser() user: User) {
        return albumService.save(image, id, user);
    }
}
