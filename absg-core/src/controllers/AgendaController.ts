import { getRepository } from "typeorm";
import { JsonController, Param, Body, Get, Post, Delete, NotFoundError } from "routing-controllers";
import { Person } from "../entities";

import { agendaService } from "../services";
import { success, issue } from "../middleware/jsonHelper";


@JsonController('/agenda')
export class AgendaController {


    /**
     * Récupère les infos pour initialiser l'écran des Agenda
     */
    @Get('/init')
    async initData() {
        try {
            return success(await agendaService.getInitData());
        } catch (ex) {
            return issue('Impossible de récupérer les données d\'initialisation de la section agenda', ex);
        }
    }

}
