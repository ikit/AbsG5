import { getRepository } from "typeorm";
import { JsonController, Post, Body, Get, Authorized, CurrentUser, UnauthorizedError } from "routing-controllers";
import { citationService, eventService, immtService, userService } from "../services";
import { subDays } from "date-fns";
import { Parameter, User } from "../entities";

@JsonController("")
export class UserController {
    private repo = getRepository(Parameter);

    /**
     * Récupère l'ensemble des informations de la page d'accueil:
     *  - Une citation aléatoire
     *  - Les 50 dernières notifications
     *  - Les paramètres de configuration du site (notament si il y a une annonce à afficher)
     */
    @Authorized()
    @Get("/welcom")
    async welcom() {
        const result = {
            citation: await citationService.random(),
            notifications: await userService.getLastNotifications(),
            settings: await this.getSettings()
        };

        console.log(result);

        return result;
    }

    /**
     * Récupère l'ensemble des éléments nécessaire pour construire la page d'accueil
     *  - La dernière image du moment
     *  - Les événements du mois en cours
     *  - L'historique des passages de la journée
     */
    @Authorized()
    @Get("/homePage")
    async home() {
        const current = new Date();
        const result = {
            immt: await immtService.last(),
            events: await eventService.getForMonth(current.getFullYear(), current.getMonth()),
            passag: await userService.getPassag(subDays(new Date(), 1))
        };
        return result;
    }

    /**
     * Récupère l'historique des passage sur le site des membres sur toute une année
     */
    @Authorized()
    @Get("/passagHistory")
    async passagHistory() {
        return await userService.getPassagHistory();
    }

    /**
     * Récupère la liste de tout les paramètres du site
     */
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

    /**
     * Met à jour les paramètres du site
     * @param settings
     */
    @Authorized()
    @Post("/settings")
    async saveSettings(@Body() settings: any, @CurrentUser() user: User) {
        if (user && Array.isArray(user.roles) && user.roles.indexOf("admin") > -1) {
            let sql = "";
            for (const key in settings) {
                if (key == "agpaSpecialEdition") {
                    // TODO: INSERT OR UPDATE current edition special category
                } else {
                    sql += `UPDATE agpa_category_variation SET value=${settings[key]} WHERE key = '${key}';`;
                }
            }
            await this.repo.query(sql);
            return await this.getSettings();
        }
        return new UnauthorizedError("Vous n'avez pas les droits suffisant pour modifier les paramètres du site");
    }
}
