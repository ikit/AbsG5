import { getRepository } from "typeorm";
import { format, addMonths, addDays } from "date-fns";
import { EventG, Person } from "../entities";

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
            { startDate: new Date(year, 11, 25, 10), name: `🎅 Noël`, type: "special" },
        ];

        return list.filter(e => e.startDate.getMonth() === month);
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
        result.push(...(await this.repo.query(q)));

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
                    return {
                        startDate: new Date(year, p.dateOfBirth.getMonth(), p.dateOfBirth.getDate()),
                        name: `🎂 ${p.getQuickName()}`,
                        type: "birthday"
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
     * @param event les informations de l'événement à ajouter ou mettre à jour
     */
    public async save(event: EventG) {
        // Quand on sauvegarde un évémenent, il faut tenir compte de la timezone :)
        // Pour ça on se base sur start et end qui doivent être obligatoirement renseigné
    }

    /**
     * Supprime un événement
     * Une événement ne peut être supprimé que par un admin,
     * ou bien par le poster
     */
    public async remove(event: EventG) {
        // TODO: retrieve user info to check permission to delete
    }
}

export const eventService = new EventService();
