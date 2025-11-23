import { JsonController, Get, Authorized, Post, Body, Param, QueryParam } from "routing-controllers";
import { Photo } from "../entities";
import { PhotoAlbum } from "../entities/PhotoAlbum";
import { AppDataSource } from "../data-source";

@Authorized()
@JsonController("/photos")
export class PhotosController {
    private get repo() {
        return AppDataSource.getRepository(Photo);
    }
    private get aRepo() {
        return AppDataSource.getRepository(PhotoAlbum);
    }

    /**
     * Récupère la liste des photos pour l'explorateur
     */
    @Get("/all")
    async toCheck(@QueryParam("collection") collection: string) {
        // On récupère les photos à checker
        // Par défaut on les trie par ordre chronologique (celles sans dates sont à la fin par ordre d'id)
        const photos = await this.repo
            .createQueryBuilder("p")
            .orderBy("p.date", "ASC")
            .addOrderBy("p.id", "ASC")
            .getMany();

        return photos.map(p => ({
            ...p,
            thumb: `${process.env.URL_FILES}photos/${p.folder}/THUMB/${p.id}.jpg`,
            url: `${process.env.URL_FILES}photos/${p.folder}/WEB/${p.id}.jpg`
        }));
    }

    @Get("/checked/:family")
    async checked(@Param("family") family: string) {
        // On vérifie le filtre sur la famille
        let sqlFilter = "";
        if (family && ["gueudelot", "guyomard", "guibert"].indexOf(family) > -1) {
            sqlFilter = ` AND p.family = '${family}'`;
        }
        // On récupère les photos triées
        const photos = await this.repo
            .createQueryBuilder("p")
            .where(`p.date IS NOT NULL${sqlFilter}`)
            .orderBy("p.date")
            .getMany();

        return photos.map(p => ({
            ...p,
            thumb: `${process.env.URL_FILES}photos/${p.folder}/THUMB/${p.id}.jpg`,
            url: `${process.env.URL_FILES}photos/${p.folder}/WEB/${p.id}.jpg`
        }));
    }

    /**
     * Sauvegarde les métadonnées d'une photo
     */
    @Post("/save")
    async savePhoto(@Body() metadata) {
        const photo = await this.repo.findOne({ where: { id: metadata.id, folder: metadata.folder } });
        if (photo) {
            Object.assign(photo, metadata);
            this.repo.save(photo);
            return photo;
        }
        return null;
    }
}
