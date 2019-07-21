import { getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Citation } from "../entities";



class CitationService {

    private citationsRepo = null;

    public initService() {
        this.citationsRepo = getRepository(Citation);
    }

    /**
     * Renvoie une citation au hasard
     */
    public async random() {
        const result = await this.citationsRepo.query(`SELECT c.*, u.username AS "posterName", p.firstname AS "authorFirstname", p.surname AS "authorSurname" 
            FROM citation c 
            LEFT JOIN "user" u ON c."posterId"=u.id
            LEFT JOIN person p ON c."authorId"=p.id
            ORDER BY RANDOM() LIMIT 1;`);

        return result[0];
    }
}

export const citationService = new CitationService();
