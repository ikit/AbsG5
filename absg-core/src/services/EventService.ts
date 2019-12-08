import { getRepository } from "typeorm";
import { format } from "date-fns";
import { EventG } from "../entities";

class EventService {

    private repo = null;

    public initService() {
        this.repo = getRepository(EventG);
    }

    /**
     * Renvoie les événements du mois demandé
     */
    public async getForMonth(year: number, month: number) {
        const q = `SELECT e.*, u.username 
        FROM public.event_g e
        INNER JOIN "user" u ON e."authorId" = u.id
        WHERE ("startYear" IS NULL OR "startYear" = ${year})
            AND ("endYear" IS NULL OR "endYear" = ${year})
            AND ("startMonth" IS NULL OR "startMonth" <= ${month})
            AND ("endMonth" IS NULL OR "endMonth" >= ${month})`;
        let result = await this.repo.query(q);
        return result.map(e => this.formatDateFromDatabase(e));
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


    /**
     * Complete les informations de l'évémenent à partir des infos stockés en base de donnée
     * @param event 
     */
    private formatDateFromDatabase(event: EventG) {
        const currentDate = new Date();
        event.startYear = event.startYear ? event.startYear : currentDate.getFullYear();
        event.startMonth = event.startMonth ? event.startMonth : currentDate.getMonth();
        event.startDay = event.startDay ? event.startDay : currentDate.getDay();
        event.startTime = event.startTime ? event.startTime : 0;
        event.endYear = event.endYear ? event.endYear : event.startYear;
        event.endMonth = event.endMonth ? event.endMonth : event.startMonth;
        event.endDay = event.endDay ? event.endDay : event.startDay;
        event.endTime = event.endTime ? event.endTime : 0;

        event.start = new Date(
            event.startYear,
            event.startMonth,
            event.startDay);
        event.start.setHours(event.startTime, -currentDate.getTimezoneOffset(), 0, 0);

        event.end = new Date(
            event.endYear,
            event.endMonth,
            event.endDay);
        event.end.setHours(event.endTime, -currentDate.getTimezoneOffset(), 0, 0);

        return event;
    }
}

export const eventService = new EventService();
