import { getRepository, Equal } from "typeorm";
import { JsonController, Post, Body, BadRequestError, Get, Authorized } from "routing-controllers";
import { User } from "../entities";

import { authService, citationService, eventService, immtService, userService } from "../services";
import { subDays } from "date-fns";
import { Parameter } from "../entities";

@JsonController("")
export class UserController {
    private repo = getRepository(Parameter);

    /**
     * Récupère l'ensemble des informations de la page d'accueil:
     *  - Une citation aléatoire
     *  - La dernière image du moment
     *  - Les événements du mois en cours
     *  - L'historique des passages de la journée
     *  - Les dernières notifications non lues
     */
    @Get("/welcom")
    async welcom() {
        const current = new Date();
        const result = {
            immt: await immtService.last(),
            citation: await citationService.random(),
            events: await eventService.getForMonth(current.getFullYear(), current.getMonth()),
            passag: await userService.getPassag(subDays(new Date(), 1)),
            notifications: await userService.getLastNotifications(),
            user: {}
        };

        return result;
    }

    @Authorized()
    @Get("/settings")
    async getSettings() {
        // On récupère les paramètres du site
        let data = await this.repo.query("SELECT * FROM parameter");
        const settings = {};
        for (const e of data) {
            settings[e.key] = e.value;
        }
        // On récupère les infos sur la catégorie spéciale de l'édition en cours
        data = await this.repo.query(`SELECT * FROM agpa_category_variation WHERE year = ${new Date().getFullYear()}`);
        if (data.length > 0) {
            settings["agpaSpecialEdition"] = data[0];
        } else {
            settings["agpaSpecialEdition"] = {
                year: new Date().getFullYear(),
                title: "",
                description: ""
            };
        }
        return settings;
    }

    @Authorized()
    @Post("/settings")
    async saveSettings(@Body() settings: any) {
        let sql = "";
        for (const key in settings) {
            if (key == "agpaSpecialEdition") {

            } else {
                sql += `UPDATE agpa_category_variation SET value=${settings[key]} WHERE key = '${key}';`;
            }
        }
        await this.repo.query(sql);
        return await this.getSettings();
    }
}
