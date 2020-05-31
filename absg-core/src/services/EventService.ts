import { getRepository } from "typeorm";
import { format, addMonths, addDays } from "date-fns";
import * as path from "path";
import * as fs from "fs";
import { EventG, Person, User, Sex } from "../entities";
import { saveImage, decodeBase64Image } from "../middleware/commonHelper";
import { BadRequestError } from "routing-controllers";

class EventService {
    private repo = null;

    public initService() {
        this.repo = getRepository(EventG);
    }
    /**
     * Calcule la date du lundi de paque pour une année donnée dans le calendrier Gregorian
     * basé sur l'algorithme Oudin (http://www.tondering.dk/claus/cal/easter.php)
     * @returns {array} [int month, int day]
     */
    public getEaster(year) {
        const f = Math.floor,
            // Golden Number - 1
            G = year % 19,
            C = f(year / 100),
            // Related to Epact
            H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
            // Number of days from 21 March to the Paschal full moon
            I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
            // Weekday for the Paschal full moon
            J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
            // Number of days from 21 March to the Sunday on or before the Paschal full moon
            L = I - J,
            month = 3 + f((L + 40) / 44),
            day = L + 28 - 31 * f(month / 4);

        return [month - 1, day + 1];
    }

    /**
     * Calcul les fêtes et événements légaux au cours d'une année en France, et retourne ceux du mois désiré
     * @param year
     * @param month
     */
    public getLegalEvents(year: number, month: number) {
        const easter = this.getEaster(year);
        const easterdate = new Date(year, easter[0], easter[1], 10);
        const list = [
            { startDate: new Date(year, 0, 1, 10), name: `🎉 Jour de l'an`, type: "special" },
            { startDate: easterdate, name: `🥚 Lundi de Pâques`, type: "special" },
            { startDate: new Date(year, 4, 1, 10), name: `💤 Fête du Travail`, type: "special" },
            { startDate: new Date(year, 4, 8, 10), name: `✌️ Victoire de 1945`, type: "special" },
            { startDate: addDays(easterdate, 39), name: `✝️ L’Ascension`, type: "special" },
            { startDate: addDays(easterdate, 49), name: `✝️ Lundi de Pentecôte`, type: "special" },
            { startDate: new Date(year, 6, 14, 10), name: `🎖️ Fête nationale`, type: "special" },
            { startDate: new Date(year, 7, 15, 10), name: `✝️ L’Assomption`, type: "special" },
            { startDate: new Date(year, 10, 1, 10), name: `✝️ La Toussaint`, type: "special" },
            { startDate: new Date(year, 10, 11, 10), name: `🕊️ L’Armistice`, type: "special" },
            { startDate: new Date(year, 11, 24, 10), name: `🎄 Veille de Noël`, type: "special" },
            { startDate: new Date(year, 11, 25, 10), name: `🎅 Noël`, type: "special" }
        ];

        return list.filter(e => e.startDate.getMonth() === month).map(e => ({ ...e,  editable: false }));
    }

    /**
     * Renvoie les événements du mois demandé
     */
    public async getForMonth(year: number, month: number) {
        const startDate = new Date(year, month);
        const endDate = addMonths(startDate, 1);
        const result = [];
        // On écupère les événements enregistrés par les utilisateurs
        let q = `SELECT e.*, u.username 
            FROM public.event_g e
            INNER JOIN "user" u ON e."authorId" = u.id
            WHERE e."startDate" <= '${endDate.toISOString()}' AND (e."endDate" IS NULL OR e."endDate" >= '${startDate.toISOString()}')`;
        result.push(...(await this.repo.query(q)).map(e => ({ ...e, editable: true })));

        // On récupères les anniversaires
        q = `SELECT * 
            FROM person
            WHERE date_part('month', "dateOfBirth") = date_part('month', TIMESTAMP '${endDate.toISOString()}')
            AND ("dateOfDeath" IS NULL OR date_part('year', "dateOfDeath") >= ${year})`;
        const qr = await this.repo.query(q);
        if (Array.isArray(qr) && qr.length > 0) {
            result.push(
                ...qr.map(json => {
                    const p = new Person().fromJSON(json);
                    console.log(p);
                    const e = p.sex == Sex.female ? "p'tite mère" : p.sex == Sex.male ? "p'tit père" : "à lui";
                    return {
                        startDate: new Date(year, p.dateOfBirth.getMonth(), p.dateOfBirth.getDate()),
                        name: `🎂 ${p.getQuickName()}`,
                        details: `${p.getQuickName()} fêtes ses ${p.getAge()}!<br/>Bravo ${e}!!`,
                        type: "birthday",
                        editable: false
                    };
                })
            );
        }

        // On récupères les fêtes nationals
        result.push(...this.getLegalEvents(year, month));

        return result;
    }

    /**
     * Ajoute ou met à jour (si l'id est fourni) un événement existant
     * avec les nouvelles données.
     * @param data les infos sur l'événement
     * @param user l'utilisateur qui fait la demande
     */
    public async save(data: any, user: User) {
        let evt = null;
        if (data.id) {
            // Si l'id est renseigné, on récupère l'instance en base pour la mettre à jour
            evt = await this.repo.findOne({ where: { id: data.id } });
        }
        if (!evt) {
            evt = new EventG();
        }
        // On met à jour le message
        evt.name = data.name;
        evt.details = data.details;
        evt.type = data.type;
        evt.startDate = new Date(data.startDate);
        if (data.endDate && data.endDate !== "null") {
            evt.endDate = new Date(data.endDate);
        } else {
            evt.endDate = null;
        }
        evt.author = user;

        console.log(data, evt);

        // On extrait du message les images transmise encodé en base64 afin de les enregistré en
        // tant que fichier et économiser la taille de la base de donnée
        const bases64data = evt.details.match(/src="(data:image\/[^;]+;base64[^"]+)"/g);
        if (Array.isArray(bases64data) && bases64data.length > 0) {
            const currentYear = new Date().getFullYear();
            for (const img64 of bases64data) {
                const imageBuffer = decodeBase64Image(img64.substr(5, img64.length - 1));
                const fileName = new Date().getTime();
                const fileExt = imageBuffer.type.substr(imageBuffer.type.indexOf("/") + 1);

                const thumbPath = path.join(process.env.PATH_FILES, `attachments/${currentYear}/${fileName}_mini.${fileExt}`);
                const webPath = path.join(process.env.PATH_FILES, `attachments/${currentYear}/${fileName}.${fileExt}`);
                const webUrl = `${process.env.URL_FILES}/attachments/${currentYear}/${fileName}.${fileExt}`;

                await saveImage(imageBuffer.buffer, thumbPath, webPath, null);
                evt.details = evt.details.replace(img64, `src="${webUrl}"`);
            }
        }

        await this.repo.save(evt);
        return evt;
    }

    /**
     * Supprime un événement
     * Une événement ne peut être supprimé que par un admin,
     * ou bien par le poster
     */
    public async delete(id: number, user: User) {
        let evt = null;
        if (id) {
            // Si l'id est renseigné, on récupère l'instance en base pour la mettre à jour
            evt = await this.repo.findOne({ where: { id: id } });
        }
        if (!evt) {
            throw new BadRequestError(`L'événement avec l'identifiant n°${id} n'existe pas.`);
        }

        if (user.roles.indexOf("admin") > -1 || user.id === evt.author.id) {
            return this.repo.remove(evt);
        }
        throw new BadRequestError(`Vous n'avez pas les droits nécessaire pour supprimer cet événement.`);
    }
}

export const eventService = new EventService();
