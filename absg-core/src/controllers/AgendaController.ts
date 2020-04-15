import { JsonController, Get, Authorized, Post, Body, CurrentUser } from "routing-controllers";

import { agendaService } from "../services";
import { Person } from "../entities";

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
     * Crée ou modifie (si l'id est renseigné) une entrée de l'agenda
     * @param person 
     */
    @Post("/person")
    savePerson(@Body() person: Person, @CurrentUser() session: any) {
        return agendaService.savePerson(person, session);
    }
}
