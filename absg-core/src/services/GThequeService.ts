import { User } from "../entities";
import * as fs from "fs";
import * as path from "path";
import { fetchFolder } from "../middleware/commonHelper";

class GThequeService {
    /**
     * Retourne l'arborescence de fichier disponnible dans le theque en fonction des droits de l'utilisateur
     * @param user l'utilisateur qui demande à voir l'arborescence
     */
    public async getGTheque(user: User) {

        return fetchFolder(path.resolve(process.env.PATH_FILES, "./cloud"));
    }




}

export const gthequeService = new GThequeService();
