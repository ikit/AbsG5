import { JsonController, Get, Authorized, Post, Body, CurrentUser, UploadedFile } from "routing-controllers";

import { agendaService } from "../services";
import { Person, Place } from "../entities";

@Authorized()
@JsonController("/agenda")
export class AgendaController {
    /**
     * Récupère la liste complète des personnes dans l'agenda
     */
    @Get("/persons")
    listPersons() {
        return agendaService.listPersons();
    }

    /**
     * Crée ou modifie (si l'id est renseigné) une personne de l'agenda
     * @param person 
     */
    @Post("/person")
    savePerson(@Body() person: Person, @CurrentUser() session: any) {
        return agendaService.savePerson(person, session);
    }

    /**
     * Récupère la liste complète des lieux dans l'agenda
     */
    @Get("/places")
    listPlaces() {
        return agendaService.listPlaces();
    }

    /**
     * Crée ou modifie (si l'id est renseigné) un lieu de l'agenda
     * @param image l'image uploadé si défini
     * @param body les informations du lieu au format json
     * @param session les informations sur l'utilisateur qui effectue la demande
     */
    @Post("/place")
    savePlace(@UploadedFile("image") image: any, @Body() body: any, @CurrentUser() session: any) {
        return agendaService.savePlace(body, image, session);
    }
}
