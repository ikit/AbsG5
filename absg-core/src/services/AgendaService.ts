import { getConnection, getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Person, User, LogModule } from "../entities";
import { logger } from "../middleware/logger";

class AgendaService {
    private personsRepo = null;

    public initService() {
        this.personsRepo = getRepository(Person);
    }

    public listPersons() {
        return this.personsRepo
            .createQueryBuilder("p")
            .leftJoinAndSelect("p.homePlace", "place")
            .orderBy("p.lastname")
            .addOrderBy("p.firstname")
            .getMany();
    }

    /**
     * Crée ou modifie (si l'id est renseigné) une entrée de l'agenda
     * @param person l'entrée de l'agenda
     * @param user l'utilisateur qui demande l'action
     */
    public async savePerson(person: Person, user: User) {
        const personId = person.id;
        person = await this.personsRepo.save(person);

        logger.notice(
            personId
                ? `Fiche de ${person.getFullname()} ajouté au répertoirepar ${user.username}`
                : `Nouvelle entrée ajouté au répertoirepar ${user.username}`,
            {
                userId: user.id,
                module: LogModule.agenda
            }
        );
        return person;
    }





    /**
     * Retourne les infos nécessaire à l'initialisation de l'écran "immt" du site
     */
    public async getInitData() {
        const result = {
            persons: [],
            places: [],
            totalPersons: 0,
            totalPlaces: 0,
            events: [],
            totalEvents: 0
        };

        // On récupère la liste des personnes
        result.persons = await this.personsRepo.query(`SELECT * FROM person`);
        result.totalPersons = result.persons.length;
        // On récupère la liste des lieux
        result.places = await this.personsRepo.query(`SELECT * FROM place`);
        result.totalPlaces = result.places.length;
        // On récupère l'association des lieux aux personnes
        // Todo
        // On récupère les liste des 100 dernièrs événements
        result.events = await this.personsRepo.query(`SELECT * FROM event_g LIMIT 100`);
        result.totalPlaces = result.places.length;

        return result;
    }
}

export const agendaService = new AgendaService();
