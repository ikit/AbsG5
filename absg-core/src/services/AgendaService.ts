import { getConnection, getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Immt, Person } from "../entities";
import { NotFoundError } from "routing-controllers";

class AgendaService {
    private personsRepo = null;

    public initService() {
        this.personsRepo = getRepository(Person);
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
