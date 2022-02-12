import { getRepository } from "typeorm";
import { Citation, User, Person, LogModule } from "../entities";
import { isNumber, isString } from "util";
import { logger } from "../middleware/logger";
import { BadRequestError } from "routing-controllers";

class CitationService {
    private citationsRepo = null;
    private personsRepo = null;

    public initService() {
        this.citationsRepo = getRepository(Citation);
        this.personsRepo = getRepository(Person);
    }

    /**
     * Renvoie une citation au hasard
     */
    public async random() {
        return this.citationsRepo
            .createQueryBuilder("c")
            .leftJoinAndSelect("c.author", "a")
            .leftJoinAndSelect("c.poster", "p")
            .orderBy("RANDOM()")
            .getOne();
    }

    /**
     * Renvoie les citations en fonction des informations de filtrage et de pagination
     */
    public async getCitations(authorId: number = null) {
        // controle sur les paramètres
        authorId = isNumber(authorId) && authorId > 0 ? authorId : null;

        // on récupère les citations
        const citations = await this.citationsRepo
            .createQueryBuilder("c")
            .leftJoinAndSelect("c.author", "a")
            .where(authorId ? `a.id = ${authorId}` : 1)
            .orderBy("c.id", "DESC")
            .getMany();
        return citations.map(e => {
            const c = new Citation().fromJSON(e);
            const photo = c.author ? c.author.getPhoto(c.year) : null;
            return {
                id: c.id,
                citation: c.citation,
                year: c.year,
                author: {
                    id: c.author.id,
                    fullname: c.author.getFullname(),
                    thumb: photo ? photo.thumb: null,
                    large: photo ? photo.url : null
                }
            };
        });
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
            throw new BadRequestError("Merci de renseigner la citation");
        }

        // On vérifie que l'auteur est renseigné
        if (!isNumber(citation.author) || citation.author < 1) {
            throw new BadRequestError("Merci de renseigner l'auteur");
        }
        // On vérifie qu'on connait bien l'auteur
        const author = await this.personsRepo.findOne(citation.author);
        if (!author) {
            throw new BadRequestError("L'auteur de la citation doit être de la famille (enregistré dans l'annuaire)");
        }

        // On vérifie que l'auteur est renseignée
        if (!isString(citation.citation)) {
            throw new BadRequestError("Merci de renseigner correctement la citation");
        }

        // On vérifie que l'année est correctement renseignée
        const minYear = author.dateOfBirth ? +author.dateOfBirth.substr(0, 4) : 1700;
        citation.year = Number.parseInt(citation.year);
        if (!citation.year || citation.year < minYear || citation.year > new Date().getFullYear()) {
            throw new BadRequestError("L'année est optionnel mais doit forcement être une année valide");
        }

        // On enregistre la citation
        citation.author = author;
        citation.poster = user;
        const newCitation = citation.id || null;
        await this.citationsRepo.save(citation);

        logger.notice(
            newCitation ? `Citation corrigée par ${user.username}` : `Nouvelle citation ajoutée par ${user.username}`,
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
        const citation = await this.citationsRepo.findOne(id);
        if (!citation) {
            throw new BadRequestError(`La citation n°${id} n'existe pas.`);
        }

        logger.notice(`Citation n°${id} supprimée par ${user.username}`, {
            userId: user.id,
            module: LogModule.citations
        });

        return this.citationsRepo.remove(citation);
    }
}

export const citationService = new CitationService();
