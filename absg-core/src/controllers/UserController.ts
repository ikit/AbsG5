import { getRepository, Equal } from "typeorm";
import { JsonController, Post, Body, BadRequestError, Get, Authorized } from "routing-controllers";
import { User } from "../entities";

import { authService, citationService, eventService, immtService, userService } from "../services";
import { subDays } from "date-fns";

@Authorized()
@JsonController("/users")
export class UserController {
    private userRepo = getRepository(User);

    @Get("/list")
    async list() {
        return await userService.getUsers();
    }

    @Post("/")
    async save(@Body() user: any) {
        if (user && user.id === -1) {
            return await userService.createUser(user);
        } else if (user && user.id > -1) {
            return await userService.saveUser(user);
        }
        throw new BadRequestError("informations incomplètes");
    }

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

    @Get("/passagHistory")
    async passagHistory() {
        return await userService.getPassagHistory();
    }
}
