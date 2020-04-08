import { getRepository } from "typeorm";
import { JsonController, Get, Authorized } from "routing-controllers";
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
            .leftJoinAndSelect("p.place", "place")
            .where("NOT p.checked")
            .orderBy("p.id")
            .getMany();

        return photos.map(p => ({
            ...p,
            thumb: `${process.env.PHOTOS_ROOT_URL}${p.folder}/THUMB/${p.id}.jpg`,
            url: `${process.env.PHOTOS_ROOT_URL}${p.folder}/WEB/${p.id}.jpg`
        }));
    }
}
