import { getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Citation } from "../entities";
import { NotFoundError } from "routing-controllers";

class CitationService {
    private citationsRepo = null;

    public initService() {
        this.citationsRepo = getRepository(Citation);
    }

    /**
     * Retourne les infos nécessaire à l'initialisation de l'écran "citation" du site
     */
    public async getInitData() {
        const result = {
            citations: [],
            authors: [],
            total: 0
        };

        // On récupère la liste des 20 dernière citations
        result.citations = await this.citationsRepo.query(`SELECT c.* FROM citation c ORDER BY c.id DESC LIMIT 20;`);

        // On récupère la liste des autheurs
        result.authors = await this.citationsRepo.query(`SELECT DISTINCT c."authorId" AS "id", p.firstname, p.surname 
            FROM citation c 
            LEFT JOIN person p ON c."authorId"=p.id
            ORDER BY firstname ASC;`);

        // On récupère le nombre total de citations
        result.total = await this.citationsRepo.query(`SELECT COUNT(*) FROM citation;`);
        result.total = result.total[0].count;
        return result;
    }

    /**
     * Renvoie une citation au hasard
     */
    public async random() {
        const result = await this.citationsRepo
            .query(`SELECT c.*, u.username AS "posterName", p.firstname AS "authorFirstname", p.surname AS "authorSurname" 
            FROM citation c 
            LEFT JOIN "user" u ON c."posterId"=u.id
            LEFT JOIN person p ON c."authorId"=p.id
            ORDER BY RANDOM() LIMIT 1;`);

        return result[0];
    }

    /**
     * Renvoie les citations en fonction des informations de filtrage et de pagination
     */
    public async getCitations(pageIndex: number, pageSize: number, authorId: number) {
        let query = `SELECT c.*, u.username AS "posterName", p.firstname AS "authorFirstname", p.surname AS "authorSurname" 
            FROM citation c 
            LEFT JOIN "user" u ON c."posterId"=u.id
            LEFT JOIN person p ON c."authorId"=p.id `;
        if (authorId) {
            query += `WHERE c."authorId"=${authorId} `;
        }
        query += `OFFSET ${pageIndex * pageSize} LIMIT ${pageSize} ORDER BY id DESC;`;

        const result = await this.citationsRepo.query(query);

        return result;
    }

    /**
     * Renvoie une citation à partir de son identifiant
     */
    public async fromId(citationId: number) {
        const result = await this.citationsRepo
            .query(`SELECT c.*, u.username AS "posterName", p.firstname AS "authorFirstname", p.surname AS "authorSurname" 
            FROM citation c 
            LEFT JOIN "user" u ON c."posterId"=u.id
            LEFT JOIN person p ON c."authorId"=p.id
            WHERE c.id=${citationId}`);

        return result[0];
    }

    /**
     * Renvoie toutes les citation en fonction de l'autheur
     */
    public async fromAuthor(authorId: number) {
        const result = await this.citationsRepo
            .query(`SELECT c.*, u.username AS "posterName", p.firstname AS "authorFirstname", p.surname AS "authorSurname" 
            FROM citation c 
            LEFT JOIN "user" u ON c."posterId"=u.id
            LEFT JOIN person p ON c."authorId"=p.id
            WHERE c."authorId"=${authorId}
            ORDER BY c.id DESC `);
        return result;
    }

    /**
     * Ajoute ou met à jour une citation existante (si l'id est fourni)
     * avec les nouvelles données.
     * @param data les informations de la citations à ajouter ou mettre à jour
     */
    public async save(citation: Citation) {
        // TODO
        return citation;
    }

    /**
     * Supprime une citation
     * Une citation ne peut être supprimé que par un admin,
     * ou bien par le poster si il s'agit de la dernière citation ajouté
     */
    public async remove(id: number) {
        // TODO: retrieve user info to check permission to delete

        const citation = await this.citationsRepo.findOne(id);
        if (!citation) {
            throw new NotFoundError(`Citations was not found.`);
        }
        return this.citationsRepo.remove(citation);
    }
}

export const citationService = new CitationService();
