import { getRepository } from "typeorm";
import { JsonController, Get, Authorized, CurrentUser } from "routing-controllers";
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
    welcom(@CurrentUser() user: User) {
        console.log("COOUOUOUOUOUOU")
        return voyagService.getInitData(user);
    }
}
