import { getRepository } from "typeorm";
import { JsonController, Get, Authorized, Post, Body, Param } from "routing-controllers";
import { Photo } from "../entities";

@Authorized()
@JsonController("/photos")
export class UserController {
    private repo = getRepository(Photo);

    /**
     * Récupère la liste des photos à trier
     */
    @Get("/to-check")
    async toCheck() {
        // On récupère les photos à checker
        const photos = await this.repo
            .createQueryBuilder("p")
            .where("p.date IS NULL OR p.persons IS NULL OR p.place IS NULL")
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
        console.log("coucou");
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
