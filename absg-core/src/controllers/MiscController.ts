import { getRepository } from "typeorm";
import { JsonController, Post, Body, Get, Authorized, CurrentUser, Param } from "routing-controllers";
import { citationService, immtService, userService, eventService } from "../services";
import { subDays, addHours } from "date-fns";
import { Parameter, User } from "../entities";
import { getCurrentEdition } from "../middleware/agpaCommonHelpers";

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
    async welcom(@CurrentUser() user: User) {
        const result = {
            citation: await citationService.random(),
            notifications: await userService.getLastNotifications(user),
            settings: await this.getSettings()
            //formerPassag: await userService.getFormerPass
        };
        return result;
    }

    /**
     * Récupère l'ensemble des éléments nécessaire pour construire la page d'accueil
     *  - La dernière image du moment
     *  - L'historique des passages de la journée
     */
    @Authorized()
    @Get("/homepage")
    async home() {
        const result = {
            immt: await immtService.last(),
            passag: await userService.getPassag(subDays(addHours(new Date(), 1), 1)),
            events: await eventService.getNextEvents()
        };
        return result;
    }

    /**
     * Récupère l'historique des passage sur le site des membres sur toute une année
     */
    @Authorized()
    @Get("/passag")
    passagHistory() {
        return userService.getPassagHistory();
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
        data = await this.repo.query(`SELECT * FROM agpa_category_variation WHERE year = ${getCurrentEdition()}`);
        if (data.length > 0) {
            settings["agpaSpecialEdition"] = data[0];
        } else {
            settings["agpaSpecialEdition"] = {
                year: getCurrentEdition(),
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
        if (user && user.is("admin")) {
            let sql = "";
            for (const key in settings) {
                if (key == "agpaSpecialEdition") {
                    sql += `INSERT INTO agpa_category_variation (id, year, title, description)
                            VALUES (8,  ${settings.agpaSpecialEdition.year}, '${settings.agpaSpecialEdition.title}', '${settings.agpaSpecialEdition.description}') 
                            ON CONFLICT (id, year) DO UPDATE
                            SET title='${settings.agpaSpecialEdition.title}', description='${settings.agpaSpecialEdition.description}';`;
                } else {
                    sql += `UPDATE parameter SET value='${JSON.stringify(settings[key])}' WHERE key = '${key}';`;
                }
            }
            await this.repo.query(sql);
            return await this.getSettings();
        }
        return new Error("Vous n'avez pas les droits suffisant pour modifier les paramètres du site");
    }

    /**
     * Récupère les notifications d'un utilisateur
     */
    @Authorized()
    @Get("/admin/notifications")
    nadminNtifications(@CurrentUser() user: User) {
        return userService.getLastNotifications(user, true);
    }

    /**
     * Récupère les notifications d'un utilisateur
     */
    @Authorized()
    @Get("/notifications")
    notifications(@CurrentUser() user: User) {
        return userService.getLastNotifications(user);
    }

    /**
     * Marque comme lu une notification pour l'utilisateur donné
     * @param notifId l'identifiant de la notification
     * @param user l'utilisateur concerné
     */
    @Get("/markAsRead/all")
    markAllAsRead(@CurrentUser() user: User) {
        userService.markAllAsRead(user);
        return true;
    }

    /**
     * Marque comme lu une notification pour l'utilisateur donné
     * @param notifId l'identifiant de la notification
     * @param user l'utilisateur concerné
     */
    @Get("/markAsRead/:notifId([0-9]+)")
    markAsRead(@Param("notifId") notifId: number, @CurrentUser() user: User) {
        userService.markAsRead(notifId, user);
        return true;
    }
}
