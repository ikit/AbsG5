import { JsonController, Param, Get, Authorized } from "routing-controllers";

import { eventService } from "../services";

@JsonController("/event")
export class EventController {
    /**
     * Renvoie les événements pour le mois en cours
     */
    @Authorized()
    @Get("")
    async current() {
        const current = new Date();
        const result = await eventService.getForMonth(current.getFullYear(), current.getMonth());
        return result;
    }
    /**
     * Renvoie les événements pour le mois demandé
     */
    @Authorized()
    @Get("/:year([0-9]{4})/:month([0-9]{1,2})")
    async getMonth(@Param("year") year: number, @Param("month") month: number) {
        const result = await eventService.getForMonth(year, month);
        return result;
    }
}
