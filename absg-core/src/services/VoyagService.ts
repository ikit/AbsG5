import { getRepository } from "typeorm";
import { Person, User } from "../entities";

class VoyagService {
    private personsRepo = null;

    public initService() {
        this.personsRepo = getRepository(Person);
    }

    /**
     * Retourne les infos nécessaire à l'initialisation de l'écran "immt" du site
     */
    public async getInitData(user: User) {
        // On récupère la liste des personnes
        const persons = await this.personsRepo
            .query(`select p.firstname, p.lastname, p.surname, u.id as "id", p.id as "personId", p."lastLocation"
            FROM person p
            INNER JOIN "user" u ON u."personId" = p.id
            WHERE p."lastLocation" IS NOT NULL`);
        const myPosition = await this.personsRepo
            .query(`select p."lastLocation"
            FROM person p
            INNER JOIN "user" u ON u."personId" = p.id
            WHERE u.id = ${user.id}`);

        return { myPosition: myPosition[0].lastLocation, persons };
    }
}

export const voyagService = new VoyagService();
