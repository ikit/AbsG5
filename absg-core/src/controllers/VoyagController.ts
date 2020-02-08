import { getRepository, Equal } from "typeorm";
import { JsonController, Post, Body, BadRequestError, Get, Authorized } from "routing-controllers";
import { User } from "../entities";

import { voyagService } from "../services";

@JsonController("/voyag")
export class VoyagController {
    private userRepo = getRepository(User);

    /**
     * Récupère les données initiales de la section voyaG:
     *  - Dernière position en date pour chaque utilisateur actif
     */
    @Authorized()
    @Get("/")
    async welcom() {
        const result = await voyagService.getInitData();
        return result;
    }
}
