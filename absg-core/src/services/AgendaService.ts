import { getRepository, Repository } from "typeorm";
import { Person, User, LogModule, Place } from "../entities";
import { logger } from "../middleware/logger";
import * as fs from "fs";
import * as path from "path";
import { saveImage } from "../middleware/commonHelper";
import { format } from "date-fns";

class AgendaService {
    private personsRepo: Repository<Person> = null;
    private placesRepo: Repository<Place> = null;

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
        return persons.map(p => {
            const photo = p.getPhoto();
            return {
                ...p,
                fullname: p.getFullname(),
                thumb: photo ? photo.thumb : null,
                url: photo ? photo.url : null
            };
        });
    }

    /**
     * Crée ou modifie (si l'id est renseigné) une entrée de répertoire
     * @param personData l'entrée du répertoire
     * @param user l'utilisateur qui demande l'action
     */
    public async savePerson(personData: any, user: User) {
        const personId = Number.parseInt(personData.id);
        let person = new Person();
        if (personId) {
            person = await this.personsRepo.findOne(personId);
        }
        personData.id = personId ? personId : null; // pour éviter les problèmes lors du save en DB
        person.fromJSON(personData);
        person = await this.personsRepo.save(person);

        logger.notice(
            personId
                ? `La fiche de "${person.getFullname()}" a été modifiée dans le répertoire par ${user.username}`
                : `Nouvelle fiche "${person.getFullname()}" a été ajoutée au répertoire par ${user.username}`,
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
     * Recalcul pour chaque personne la liste des trombis à partir des photos enregistrées
     */
    async restoreTrombi() {
        // On récupère la liste des personnes du répertoire
        const personsData = await this.personsRepo
            .createQueryBuilder("p")
            .orderBy("p.lastname")
            .addOrderBy("p.firstname")
            .getMany();

            
        const persons = {};
        for (const p of personsData) {
            // On ignore les personnes qui n'ont pas de date de naissance (Zaffa par exemple)
            if (!!p.dateOfBirth) {
                persons[p.id] = p;
                persons[p.id].trombis = [];
                const maxDate = persons[p.id].dateOfDeath ? new Date(persons[p.id].dateOfDeath) : new Date();
                persons[p.id].max = maxDate.getFullYear() - new Date(persons[p.id].dateOfBirth).getFullYear();
            }
        }

        const folderPath = path.join(process.env.PATH_FILES, "trombi");
        const files = await fs.readdirSync(folderPath);
        files.forEach(file => {
            if (fs.statSync(path.join(folderPath, file)).isFile() && file.endsWith("jpg")) {
                const tokens = file.substring(0, file.length - 4).split("_");
                if (tokens.length === 2 && persons.hasOwnProperty(tokens[0])) {
                    const pid = tokens[0];
                    const year = Number.parseInt(tokens[1]);
                    const p = persons[pid];
                    p.trombis.push({
                        date: year,
                        title: `${p.getFullname()} - ${year} - ${p.getAge(year)}`,
                        thumb: `${process.env.URL_FILES}trombi/mini/${file}`,
                        url: `${process.env.URL_FILES}trombi/${file}`
                    })
                }
            }
        });

        await this.personsRepo.save(personsData);
        return personsData;
    }

    async saveTrombi(trombiData: any, image: any, user: User) {
        const pData = JSON.parse(trombiData.person);
        if (image && pData && pData.id && trombiData.date) {
            const p = await this.personsRepo.findOne(pData.id);
            const year = trombiData.date;
            const filename = `${p.id}_${year}.jpg`;
            const title = `${p.getFullname()} - ${year} - ${p.getAge(year)}`;

            // On sauvegarde l'image
            const thumb = path.join(process.env.PATH_FILES, `trombi/mini/${filename}`);
            const url = path.join(process.env.PATH_FILES, `trombi/${filename}`);
            await saveImage(image.buffer, thumb, url, null);

            // On met à jour la base de donnée
            const data = {
                year,
                title,
                thumb: `${process.env.URL_FILES}trombi/mini/${filename}`,
                url: `${process.env.URL_FILES}trombi/${filename}`
            };
            if (!p.trombis.some(e => e.year === year)) {
                p.trombis.push(data);
                p.trombis.sort((a, b) => a.year - b.year);
                await this.personsRepo.save(p);
            }

            logger.notice(`Nouvelle trombinette "${title}" a été ajoutée par ${user.username}`, {
                userId: user.id,
                module: LogModule.agenda
            });
            return data;
        }
        return null;
    }
}

export const agendaService = new AgendaService();
