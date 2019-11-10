import { getConnection, getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Immt, Person } from "../entities";
import { NotFoundError } from "routing-controllers";

class VoyagService {

    private personsRepo = null;

    public initService() {
        this.personsRepo = getRepository(Person);
    }


    /**
     * Retourne les infos nécessaire à l'initialisation de l'écran "immt" du site
     */
    public async getInitData() {
        let result;

        // On récupère la liste des personnes
        result = await this.personsRepo.query(`select p.firstname, p.lastname, p.surname, u.id as "id", p.id as "personId", p."lastLocation"
            FROM person p
            INNER JOIN "user" u ON u."personId" = p.id
            WHERE p."lastLocation" IS NOT NULL`);

        return result;
    }

}

export const voyagService = new VoyagService();
