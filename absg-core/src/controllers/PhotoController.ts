import { getRepository } from "typeorm";
import { JsonController, Get, Authorized, Post, Body, Param, QueryParam } from "routing-controllers";
import { Photo } from "../entities";

@Authorized()
@JsonController("/photos")
export class UserController {
    private repo = getRepository(Photo);

    /**
     * Récupère la liste des photos à trier
     */
    @Get("/to-check")
    async toCheck(@QueryParam("collection") collection: string) {
        // On gère le filtre en fonction de la collection demandé:
        // - date: toutes les photos dont la date est manquante
        // - person: toutes les photos où personnes n'est indiqué
        // - place: toutes les photos où le lieux n'est pas indiqué
        // => par défaut: renvoie toutes les photos où aucunes des 3 infos n'est pas renseigné
        let filter = null;
        switch (collection) {
            case "date":
                filter = "p.date IS NULL";
                break;
            case "person":
                filter = "p.persons IS NULL";
                break;
            case "place":
                filter = "p.place IS NULL";
                break;
            default:
                filter = "p.date IS NULL AND p.persons IS NULL AND p.place IS NULL";
        }

        // On récupère les photos à checker
        const photos = await this.repo
            .createQueryBuilder("p")
            .where(filter)
            .orderBy("p.id")
            .getMany();

        return photos.map(p => ({
            ...p,
            thumb: `${process.env.URL_FILES}photos/${p.folder}/THUMB/${p.id}.jpg`,
            url: `${process.env.URL_FILES}photos/${p.folder}/WEB/${p.id}.jpg`
        }));
    }

    @Get("/checked")
    allChecked() {
        return this.checked(null);
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
