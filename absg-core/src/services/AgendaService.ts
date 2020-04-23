import { getRepository } from "typeorm";
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
    public async listPersons() {
        const persons = await this.personsRepo
            .createQueryBuilder("p")
            .orderBy("p.lastname")
            .addOrderBy("p.firstname")
            .getMany();
        return persons.map(e => {
            const p = new Person().fromJSON(e);
            return {
                ...p,
                fullname: p.getFullname(),
                thumb: p.photo ? `${process.env.URL_FILES}persons/mini/${p.photo}` : null,
                url: p.photo ? `${process.env.URL_FILES}persons/${p.photo}` : null
            };
        });
    }

    /**
     * Crée ou modifie (si l'id est renseigné) une entrée de répertoire
     * @param personData l'entrée du répertoire
     * @param image l'image pour illustrer la personne dans le répertoire
     * @param user l'utilisateur qui demande l'action
     */
    public async savePerson(personData: any, image: any, user: User) {
        const personId = Number.parseInt(personData.id);
        let person = new Person();
        if (personId) {
            person = await this.personsRepo.findOne(personId);
        }
        personData.id = personId ? personId : null; // pour éviter les problèmes lors du save en DB
        person.fromJSON(personData);
        person = await this.personsRepo.save(person);

        if (image) {
            const thumb = path.join(process.env.PATH_FILES, `persons/mini/${person.id}.jpg`);
            const web = path.join(process.env.PATH_FILES, `persons/${person.id}.jpg`);
            await saveImage(image.buffer, thumb, web, null);

            person.photo = `${person.id}.jpg`;
            this.personsRepo.save(person);
        }

        logger.notice(
            personId
                ? `La fiche de "${person.getFullname()}" a été modifié dans le répertoire par ${user.username}`
                : `Nouvelle fiche "${person.getFullname()}" a été ajouté au répertoire par ${user.username}`,
            {
                userId: user.id,
                module: LogModule.agenda
            }
        );
        return {
            ...person,
            thumb: person.photo ? `${process.env.URL_FILES}persons/${person.photo}` : null,
            url: person.photo ? `${process.env.URL_FILES}persons/${person.photo}` : null
        };
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
     * Récupère la liste complète des photos du trombinoscope
     */
    async listTrombi() {
        // On récupère la liste des personnes du répertoire
        const personsData = await this.personsRepo
            .createQueryBuilder("p")
            .orderBy("p.lastname")
            .addOrderBy("p.firstname")
            .getMany();
        const persons = {};
        for (const p of personsData) {
            persons[p.id] = new Person().fromJSON(p);
        }

        const filesList = [];
        const folderPath = path.join(process.env.PATH_FILES, "trombi");
        const files = await fs.readdirSync(folderPath);
        files.forEach(file => {
            if (fs.statSync(path.join(folderPath, file)).isFile() && file.endsWith("jpg")) {
                const tokens = file.substring(0, file.length - 4).split("_");
                
                if (tokens.length === 2 && persons.hasOwnProperty(tokens[0])) {
                    const pid = tokens[0];
                    const year = Number.parseInt(tokens[1].substr(0, 4));
                    const month = Number.parseInt(tokens[1].substr(4, 2));
                    const day = Number.parseInt(tokens[1].substr(6));
                    const p = persons[pid];
                    filesList.push({
                        pid,
                        date: new Date(year, month, day),
                        title: `${p.getFullname()} - ${year}`,
                        thumb: `${process.env.URL_FILES}trombi/${file}`, // `${process.env.URL_FILES}trombi/mini/${file}`,
                        url: `${process.env.URL_FILES}trombi/${file}`
                    });
                }
            }
        });
        console.log(filesList);
        return filesList;
    }

    saveTrombi(trombiData: any, image: any, user: User) {
        return null;
    }
}

export const agendaService = new AgendaService();
