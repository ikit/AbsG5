import { JsonController, Get, Authorized } from "routing-controllers";

import { agendaService } from "../services";

@Authorized()
@JsonController("/agenda")
export class AgendaController {
    /**
     * Récupère les infos pour initialiser l'écran des Agenda
     */
    @Get("/init")
    async initData() {
        return await agendaService.getInitData();
    }
}
