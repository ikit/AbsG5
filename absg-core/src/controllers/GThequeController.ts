import { JsonController, Get, Authorized, CurrentUser } from "routing-controllers";
import { User } from "../entities";

import { gthequeService } from "../services";

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
         return gthequeService.getCollection();
     }
}
