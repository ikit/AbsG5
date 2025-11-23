import { JsonController, Get, Authorized, CurrentUser } from "routing-controllers";
import { User } from "../entities";

import { voyagService } from "../services";
import { AppDataSource } from "../data-source";

@Authorized()
@JsonController("/voyag")
export class VoyagController {
    private get userRepo() {
        return AppDataSource.getRepository(User);
    }

    /**
     * Récupère les données initiales de la section voyaG:
     *  - Dernière position en date pour chaque utilisateur actif
     */
    @Get("/")
    welcom(@CurrentUser() user: User) {
        return voyagService.getInitData(user);
    }
}
