import { getRepository } from "typeorm";
import { JsonController, Get, Authorized } from "routing-controllers";
import { User } from "../entities";

import { voyagService } from "../services";

@Authorized()
@JsonController("/voyag")
export class VoyagController {
    private userRepo = getRepository(User);

    /**
     * Récupère les données initiales de la section voyaG:
     *  - Dernière position en date pour chaque utilisateur actif
     */
    @Get("/")
    async welcom() {
        const result = await voyagService.getInitData();
        return result;
    }
}
