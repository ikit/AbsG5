import { getRepository } from "typeorm";
import { Citation, User, Person, LogModule } from "../entities";
import { NotFoundError } from "routing-controllers";
import { isNumber, isString } from "util";
import { logger } from "../middleware/logger";

class CitationService {
    private citationsRepo = null;
    private personsRepo = null;

    public initService() {
        this.citationsRepo = getRepository(Citation);
        this.personsRepo = getRepository(Person);
    }

    /**
     * Retourne les infos nécessaire à l'initialisation de l'écran "citation" du site
     */
    public async getInitData() {
        // On récupère la liste des autheurs
        return await this.citationsRepo.query(`SELECT DISTINCT c."authorId" AS "id", p.firstname, p.surname 
            FROM citation c 
            LEFT JOIN person p ON c."authorId"=p.id
            ORDER BY firstname ASC;`);
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
        // controle sur les paramètres
        authorId = isNumber(authorId) && authorId > 0 ? authorId : null;
        pageSize = isNumber(pageSize) && pageSize > 0 ? pageSize : 20;

        // on calcule le nombre de citations max en fonction du filtre sur les auteurs
        let query = "SELECT COUNT(*) FROM citation";
        if (authorId) {
            query += ` WHERE "authorId"= ${authorId}`;
        }
        let totalCitations = await this.citationsRepo.query(query);
        totalCitations = totalCitations[0].count;

        // 2: on borne la pagination en fonction du nombre max (pagesize = all quand filtre par auteur)
        const totalPages = Math.round(totalCitations / pageSize);
        pageIndex = isNumber(pageIndex) && pageIndex > 0 && pageIndex < totalPages ? pageIndex : 0;

        // on récupère les citations
        query = `SELECT c.*, u.username AS "posterName", p.firstname AS "authorFirstname", p.surname AS "authorSurname" 
            FROM citation c 
            LEFT JOIN "user" u ON c."posterId"=u.id
            LEFT JOIN person p ON c."authorId"=p.id `;
        if (authorId) {
            query += `WHERE c."authorId"=${authorId} `;
        }
        query += ` ORDER BY c.id DESC OFFSET ${pageIndex * pageSize} LIMIT ${pageSize};`;
        const citations = await this.citationsRepo.query(query);

        return { totalCitations, totalPages, pageSize, pageIndex, citations };
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
    public async save(user: User, citation: any) {
        if (!citation) {
            throw new Error("Merci de renseigner la citation");
        }

        // On vérifie que l'auteur est renseigné
        if (!isNumber(citation.author) || citation.author < 1) {
            throw new Error("Merci de renseigner l'auteur");
        }
        // On vérifie qu'on connait bien l'auteur
        const author = await this.personsRepo.findOne(citation.author);
        if (!author) {
            throw new Error("L'auteur de la citation doit être de la famille (enregistré dans l'annuaire)");
        }

        // On vérifie que l'auteur est renseignée
        if (!isString(citation.citation)) {
            throw new Error("Merci de renseigner correctement la citation");
        }

        // On vérifie que l'année est correctement renseignée
        const minYear = author.dateOfBirth ? new Date(author.dateOfBirth).getFullYear() : 1700;
        citation.year = Number.parseInt(citation.year);
        if (!citation.year || citation.year < minYear || citation.year > new Date().getFullYear()) {
            throw new Error("L'année est optionnel mais doit forcement être une année valide");
        }

        // On enregistre la citation
        citation.author = author;
        citation.poster = user;
        const newCitation = citation.id || null;
        await this.citationsRepo.save(citation);

        logger.notice(
            newCitation ? `Citation corrigé par ${user.username}` : `Nouvelle citation ajouté par ${user.username}`,
            { userId: user.id, module: LogModule.citations }
        );

        // On indique que tout s'est bien passé en retournant la citation
        return citation;
    }

    /**
     * Supprime une citation
     * Une citation ne peut être supprimé que par un admin,
     * ou bien par le poster si il s'agit de la dernière citation ajouté
     */
    public async remove(user: User, id: number) {
        // TODO: retrieve user info to check permission to delete
        console.log("DELETE", id);
        const citation = await this.citationsRepo.findOne(id);
        if (!citation) {
            throw new NotFoundError(`Citations was not found.`);
        }
        
        logger.notice(`Citation supprimé par ${user.username}`, { userId: user.id, module: LogModule.citations });

        return this.citationsRepo.remove(citation);
    }
}

export const citationService = new CitationService();
