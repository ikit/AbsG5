import { JsonController, Get, Authorized, Post, Body, CurrentUser, UploadedFile } from "routing-controllers";

import { agendaService } from "../services";

@Authorized()
@JsonController("/agenda")
export class AgendaController {
    /**
     * Récupère la liste complète des personnes dans l'agenda
     */
    @Get("/persons")
    async listPersons() {
        const persons = await agendaService.listPersons()
        return persons.map(p => {
            const maxDate = p.dateOfDeath ? new Date(p.dateOfDeath) : new Date();
            return {
                ...p,
                trombis: Array.isArray(p.trombis) ? p.trombis : [],
                trombiMax: maxDate.getFullYear() - new Date(p.dateOfBirth).getFullYear()
            }
        });
    }

    /**
     * Crée ou modifie (si l'id est renseigné) une personne de l'agenda
     * @param image l'image uploadé si défini
     * @param body les informations sur la personne au format json
     * @param session les informations sur l'utilisateur qui effectue la demande
     */
    @Post("/person")
    savePerson(@Body() body: any, @CurrentUser() session: any) {
        return agendaService.savePerson(body, session);
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

    /**
     * Récupère la liste complète des photos du trombinoscope
     */
    @Get("/trombi")
    async listTrombi() {
        return await agendaService.listTrombi();
    }

    /**
     * Crée ou modifie (si l'id et la date sotn les mêmes) une photo du trombinoscope
     * @param image l'image uploadé si défini
     * @param body les informations sur la photo
     * @param session les informations sur l'utilisateur qui effectue la demande
     */
    @Post("/trombi")
    saveTrombi(@UploadedFile("image") image: any, @Body() body: any, @CurrentUser() session: any) {
        return agendaService.saveTrombi(body, image, session);
    }
}
