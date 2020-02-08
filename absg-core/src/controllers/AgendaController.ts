import { JsonController, Get, Authorized } from "routing-controllers";

import { agendaService } from "../services";

@JsonController("/agenda")
export class AgendaController {
    /**
     * Récupère les infos pour initialiser l'écran des Agenda
     */
    @Authorized()
    @Get("/init")
    async initData() {
        return await agendaService.getInitData();
    }
}
