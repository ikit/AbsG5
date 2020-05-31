import {
    JsonController,
    Param,
    Get,
    Authorized,
    CurrentUser,
    Body,
    UploadedFile,
    Post,
    Delete
} from "routing-controllers";

import { eventService } from "../services";

@Authorized()
@JsonController("/event")
export class EventController {
    /**
     * Renvoie les événements pour le mois en cours
     */
    @Get("")
    async current() {
        const current = new Date();
        const result = await eventService.getForMonth(current.getFullYear(), current.getMonth());
        return result;
    }

    /**
     * Renvoie les événements pour le mois demandé
     */
    @Get("/:year([0-9]{4})/:month([0-9]{1,2})")
    async getMonth(@Param("year") year: number, @Param("month") month: number) {
        const result = await eventService.getForMonth(year, month);
        return result;
    }

    /**
     * Enregistre un événement dans le calendrier
     * @param body les infos sur le message à poster
     * @param user l'utilisateur qui fait la demande
     * /!\ Note: je force l'usage du multipart/form-data avec @UploadedFile car
     *     sinon la limite en taille des body/json empeche de poster des messages avec image encodé
     */
    @Post("/save")
    async save(@UploadedFile("image") image: any, @Body() body: any, @CurrentUser() user: any) {
        return eventService.save(body, user);
    }

    /**
     * Supprime un événement du calendrier
     * @param id l'identifiant de l'événement à supprimer
     * @param user l'utilisateur qui fait la demande
     */
    @Delete("/:id")
    async delete(@Param("id") id: number, @CurrentUser() user: any) {
        return eventService.delete(id, user);
    }
}
