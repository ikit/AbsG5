import { getConnection, getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Person, User, LogModule, Place } from "../entities";
import { logger } from "../middleware/logger";
import * as fs from "fs";
import * as path from "path";
import { saveImage } from "../middleware/commonHelper";

class AgendaService {
    private personsRepo = null;
    private placesRepo = null;

    public initService() {
        this.personsRepo = getRepository(Person);
        this.placesRepo = getRepository(Place);
    }

    /**
     * Récupère la liste de toutes les personnes de l'agenda
     */
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
                ? `Fiche de ${person.getFullname()} modifié dans le répertoire par ${user.username}`
                : `Nouvelle entrée ajouté au répertoire par ${user.username}`,
            {
                userId: user.id,
                module: LogModule.agenda
            }
        );
        return person;
    }

    /**
     * récupère la liste de tous les lieux enregistrés dans l'agenda
     */
    public async listPlaces() {
        // On récupère les photos à checker
        const places = await this.placesRepo
            .createQueryBuilder("p")
            .orderBy("p.name")
            .getMany();

        return places.map(p => ({
            ...p,
            thumb: p.photo ? `${process.env.URL_FILES}places/mini/${p.photo}` : null,
            url: p.photo ? `${process.env.URL_FILES}places/${p.photo}` : null
        }));
    }

    /**
     * Crée ou modifie (si l'id est renseigné) un lieux dans l'agenda
     * @param placeData les données sur le lieux
     * @param image l'image pour illustrer le lieux
     * @param user l'utilisateur qui demande l'action
     */
    public async savePlace(placeData: any, image: any, user: User) {
        const placeId = Number.parseInt(placeData.id);
        let place = new Place();
        if (placeId) {
            place = await this.placesRepo.findOne(placeId);
        }
        placeData.id = placeId ? placeId : null; // pour éviter les problèmes lors du save en DB
        place.fromJSON(placeData);
        place = await this.placesRepo.save(place);

        if (image) {
            const thumb = path.join(process.env.PATH_FILES, `places/mini/${place.id}.jpg`);
            const web = path.join(process.env.PATH_FILES, `places/${place.id}.jpg`);
            await saveImage(image.buffer, thumb, web, null);

            place.photo = `${place.id}.jpg`;
            this.placesRepo.save(place);
        }

        logger.notice(
            placeId
                ? `Le lieu "${place.name}" a été modifié dans le répertoire par ${user.username}`
                : `Nouveau lieu "${place.name}" a été ajouté au répertoire par ${user.username}`,
            {
                userId: user.id,
                module: LogModule.agenda
            }
        );
        return {
            ...place,
            thumb: place.photo ? `${process.env.URL_FILES}places/${place.photo}` : null,
            url: place.photo ? `${process.env.URL_FILES}places/${place.photo}` : null
        };
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
