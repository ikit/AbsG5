import { getRepository } from "typeorm";
import { addMonths, addDays } from "date-fns";
import * as path from "path";
import { EventG, Person, User, Sex, LogModule } from "../entities";
import { saveImage, decodeBase64Image } from "../middleware/commonHelper";
import { BadRequestError } from "routing-controllers";
import { logger } from "../middleware/logger";

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
        const easterdate = new Date(Date.UTC(year, easter[0], easter[1]));
        const list = [
            { startDate: new Date(Date.UTC(year, 0, 1)), name: `🎉 Jour de l'an`, type: "special" },
            { startDate: easterdate, name: `🥚 Lundi de Pâques`, type: "special" },
            { startDate: new Date(Date.UTC(year, 4, 1)), name: `💤 Fête du Travail`, type: "special" },
            { startDate: new Date(Date.UTC(year, 4, 8)), name: `✌️ Victoire de 1945`, type: "special" },
            { startDate: addDays(easterdate, 39), name: `✝️ L’Ascension`, type: "special" },
            { startDate: addDays(easterdate, 49), name: `✝️ Lundi de Pentecôte`, type: "special" },
            { startDate: new Date(Date.UTC(year, 6, 14)), name: `🎖️ Fête nationale`, type: "special" },
            { startDate: new Date(Date.UTC(year, 7, 15)), name: `✝️ L’Assomption`, type: "special" },
            { startDate: new Date(Date.UTC(year, 10, 1)), name: `✝️ La Toussaint`, type: "special" },
            { startDate: new Date(Date.UTC(year, 10, 11)), name: `🕊️ L’Armistice`, type: "special" },
            { startDate: new Date(Date.UTC(year, 11, 24)), name: `🎄 Veille de Noël`, type: "special" },
            { startDate: new Date(Date.UTC(year, 11, 25)), name: `🎅 Noël`, type: "special" }
        ];

        return list.filter(e => e.startDate.getMonth() === month).map(e => ({ ...e, editable: false }));
    }

    /**
     * Récupère la liste des événements sur une période donnée
     * @param startDate début de la période à prendre en compte
     * @param endDate fin de la période à prendre en compte
     * @returns la liste des événements
     */
    public async getEvents(startDate: Date, endDate: Date) {
        let result = [];
        const year = startDate.getFullYear();

        // On écupère les événements enregistrés par les utilisateurs
        let q = `SELECT e.*, u.username 
            FROM public.event_g e
            INNER JOIN "user" u ON e."authorId" = u.id
            WHERE (e."endDate" IS NULL AND e."startDate" >= '${startDate.toISOString()}' AND e."startDate" <= '${endDate.toISOString()}')
            OR (e."endDate" IS NOT NULL AND e."startDate" <= '${endDate.toISOString()}' AND e."endDate" >= '${startDate.toISOString()}')
            `;
        result.push(...(await this.repo.query(q)).map(e => ({ ...e, editable: true })));

        result = result.map(e => {
            e.startDate = new Date(e.startDate);
            return e;
        });

        // On récupères les anniversaires
        const months = [];
        for (let m = startDate.getMonth(); m <= endDate.getMonth(); m++) {
            months.push(m + 1);
        }
        q = `SELECT * 
            FROM person
            WHERE 
                ("dateOfBirth" is NOT NULL AND substring("dateOfBirth" from 6 for 2)::int IN (${months.join(",")}))
            AND ("dateOfDeath" IS NULL OR substring("dateOfDeath" from 1 for 4)::int >= ${year})`;
        const qr = await this.repo.query(q);
        if (Array.isArray(qr) && qr.length > 0) {
            result.push(
                ...qr.map(json => {
                    const p = new Person().fromJSON(json);
                    const e = p.sex == Sex.female ? "p'tite mère" : p.sex == Sex.male ? "p'tit père" : "";
                    return {
                        startDate: new Date(
                            Date.UTC(year, +p.dateOfBirth.substr(5, 2) - 1, +p.dateOfBirth.substr(8, 2))
                        ),
                        name: `🎂 ${p.getQuickName()}`,
                        details: `${p.getQuickName()} fête ses ${p.getAge()}!<br/>Bravo ${e}!!`,
                        type: "birthday",
                        editable: false
                    };
                })
            );
        }

        // On récupères les fêtes nationals
        let y = year;
        for (const m of months) {
            result.push(...this.getLegalEvents(y, m));
            if (m === 11) {
                y += 1;
            }
        }
        return result
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
            .filter(e => !e.endDate && e.startDate.getTime() >= startDate.getTime()
                || e.endDate && e.endDate.getTime() <= endDate.getTime());
    }

    /**
     * Renvoie les événements du mois demandé
     */
    public getForMonth(year: number, month: number) {
        const startDate = new Date(year, month);
        const endDate = addMonths(startDate, 1);
        return this.getEvents(startDate, endDate);
    }

    /**
     * Récupère la liste des 20 prochains événements à venir sur les 6 prochains mois
     * (par défaut par rapport à la date du jour)
     * @param from la date à prendre en compte
     */
    public async getNextEvents(from: Date = null) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startDate = from ? new Date(from.getFullYear(), from.getMonth(), from.getDate()) : today;
        const endDate = addMonths(startDate, 2);
        const result = await this.getEvents(startDate, endDate);
        return result.splice(0, 20);
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

        // On extrait du message les images transmise encodé en base64 afin de les enregistré en
        // tant que fichier et économiser la taille de la base de donnée
        const bases64data = evt.details.match(/src="(data:image\/[^;]+;base64[^"]+)"/g);
        if (Array.isArray(bases64data) && bases64data.length > 0) {
            const currentYear = new Date().getFullYear();
            for (const img64 of bases64data) {
                const imageBuffer = decodeBase64Image(img64.substr(5, img64.length - 1));
                const fileName = new Date().getTime();
                const fileExt = imageBuffer.type.substr(imageBuffer.type.indexOf("/") + 1);

                const thumbPath = path.join(
                    process.env.PATH_FILES,
                    `attachments/${currentYear}/${fileName}_mini.${fileExt}`
                );
                const webPath = path.join(process.env.PATH_FILES, `attachments/${currentYear}/${fileName}.${fileExt}`);
                const webUrl = `${process.env.URL_FILES}/attachments/${currentYear}/${fileName}.${fileExt}`;

                await saveImage(imageBuffer.buffer, thumbPath, webPath, null);
                evt.details = evt.details.replace(img64, `src="${webUrl}"`);
            }
        }

        logger.notice(
            evt.id === -1
                ? `Nouvel événement ajouté au calendrier par ${user.username} le ${evt.startDate
                      .toISOString()
                      .substr(0, 10)}`
                : `Événement "${evt.name}" du ${evt.startDate.toISOString().substr(0, 10)} a été modifié par ${
                      user.username
                  }`,
            {
                userId: user.id,
                module: LogModule.event
            }
        );

        await this.repo.save(evt);
        return evt;
    }

    /**
     * Supprime un événement
     * Une événement ne peut être supprimé que par un admin,
     * ou bien par le poster
     * @param id l'identifiant de l'événement à supprimer
     * @param user l'utilisateur qui fait la demande
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

        if (user.roles.is("admin") || user.id === evt.author.id) {
            logger.notice(
                `Événement "${evt.name}" du ${evt.startDate.toISOString().substr(0, 10)} a été supprimé par ${
                    user.username
                }`,
                {
                    userId: user.id,
                    module: LogModule.event
                }
            );
            return this.repo.remove(evt);
        }
        throw new BadRequestError(`Vous n'avez pas les droits nécessaire pour supprimer cet événement.`);
    }
}

export const eventService = new EventService();
