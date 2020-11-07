import { getRepository } from "typeorm";
import { JsonController, Get, NotFoundError } from "routing-controllers";
import { subMinutes } from "date-fns";
import { User } from "../entities";
import { setLastActivity } from "../middleware";
import { sleep } from "../middleware/commonHelper";

@JsonController("/test")
export class UserController {
    private repo = getRepository(User);

    /**
     * Route de test utilisé pour les tests automatiques cypress
     * Simule les différents comportements de l'indicateur "online"
     */
    @Get("/user-online-indicator")
    async testUserOnlineIndicator() {
        if (process.env.NODE_ENV !== "development") {
            throw new NotFoundError();
        }

        // L'exécution du test est lancé dans une méthode asynchrone
        // afin de rendre la main directement à cypress pour qu'il puisse continuer à tester
        this._testUserOnlineIndicator();

        return true;
    }

    async _testUserOnlineIndicator() {
        // On récupère les utilisateurs avec qui on va effectuer les tests
        const users = await this.repo.find();
        let u1 = users.find(u => u.username === "test-02"); // test-01 est l'utilisateur actuellement connecté qui effectue le test
        let u2 = users.find(u => u.username === "test-03");

        // Deconnection de tous les membres
        for (const u of users) {
            u.lastTime = null;
        }
        await this.repo.save(users);
        await setLastActivity(users[0], "/agenda");

        // Connexion d'un deuxième utilisateur A
        u1.lastTime = new Date();
        u1 = await setLastActivity(u1, "/citations");
        await sleep(250);

        // Connexion d'un troisième utilisateur B
        u2.lastTime = new Date();
        u2 = await setLastActivity(u2, "/citations");
        await sleep(250);

        // Action de l'utilisateur A
        u1.lastTime = new Date();
        u1 = await setLastActivity(u1, "/forum");
        await sleep(250);

        // Simule l'absence d'action de A depuis 6 minutes
        // Action de l'utilisateur B
        u1.lastTime = subMinutes(new Date(), 6);
        await this.repo.save(u1);
        u2.lastTime = new Date();
        u2 = await setLastActivity(u2, "/forum");
        await sleep(250);

        // Simule l'absence d'action de B depuis 11 minutes
        // Action de l'utilisateur A
        u2.lastTime = subMinutes(new Date(), 11);
        await this.repo.save(u2);
        u1.lastTime = new Date();
        u1 = await setLastActivity(u1, "/citations");
        await sleep(250);

        // Connexion de tous les membres
        for (const u of users) {
            u.lastTime = new Date();
            await setLastActivity(u, "/forum");
            await sleep(50);
        }

        // Deconnection de tous les membres
        for (const u of users) {
            u.lastTime = null;
        }
        await this.repo.save(users);
        await setLastActivity(u1, "/citations");
    }

    /**
     * Route de test utilisé pour les tests automatiques cypress
     * Simule les différents comportements de l'indicateur "online"
     */
    @Get("/notifications")
    async testNotifications() {
        if (process.env.NODE_ENV !== "development") {
            throw new NotFoundError();
        }

        // Connexion d'un deuxième utilisateur A

        // Connexion d'un troisième utilisateur B

        // Action de l'utilisateur A

        // Simule l'absence d'action de A depuis 6 minutes
        // Action de l'utilisateur B

        // Simule l'absence d'action de B depuis 11 minutes
        // Action de l'utilisateur A

        // Connexion de tous les membres

        // Deconnection de tous les membres
    }
}
