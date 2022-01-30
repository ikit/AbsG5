import { JsonController, Get, Authorized, CurrentUser, Post, Body } from "routing-controllers";
import { LogModule, User } from "../entities";
import { fetchFolder } from "../middleware/commonHelper";
import * as path from "path";
import { gthequeService } from "../services";
import { logger } from "../middleware/logger";

@Authorized()
@JsonController("/gtheque")
export class GThequeController {
    /**
     * Retourne l'arborescence de fichier disponnible dans le theque en fonction des droits de l'utilisateur
     */
    @Get("/")
    getGTheque(@CurrentUser() user: User) {
        return gthequeService.getGTheque(user);
    }
    
    /**
     * Retourne la liste des collections disponible
     */
    @Get("/collections")
    getCollections() {
        return gthequeService.getCollections();
    }

    /**
     * Retourne l'arbirescence de tout les fichiers présent dans le grenier
     */
    @Get("/grenary")
    getGrenary() {
        const r = gthequeService.getGrenaryFiles();
        console.log(r[0].content);
        return r;
    }

    @Post("/grenary/click-on-media")
    clickOnMedia(@Body() media: any, @CurrentUser() user: User) {
        // On ne log l'info que pour les admins pour les stats d'utilisation du grenier
        logger.info(`${user.username} visualise ${media.url}`, { userId: user.id, module: LogModule.grenary });
        return true;
    }
}
