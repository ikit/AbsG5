import { JsonController, Get, NotFoundError, Param } from "routing-controllers";
import { subMinutes } from "date-fns";
import { User } from "../entities";
import { setLastActivity } from "../middleware";
import { sleep } from "../middleware/commonHelper";
import { AppDataSource } from "../data-source";

@JsonController("/test")
export class UserController {
    private get repo() {
        return AppDataSource.getRepository(User);
    }

    /**
     * Route de test utilisé pour les tests automatiques cypress
     * Simule les différents comportements de l'indicateur "online"
     */
    @Get("/user-online-indicator/:step")
    async testUserOnlineIndicator(@Param("step") step: number) {
        if (process.env.NODE_ENV !== "development") {
            throw new NotFoundError();
        }

        // L'exécution du test est lancé dans une méthode asynchrone
        // afin de rendre la main directement à cypress pour qu'il puisse continuer à tester
        this._testUserOnlineIndicator(step);

        return true;
    }

    async _testUserOnlineIndicator(step: number) {
        // On récupère les utilisateurs avec qui on va effectuer les tests
        const users = await this.repo.find();
        const current = users.find(u => u.username === "test-01");
        let u1 = users.find(u => u.username === "test-02"); // test-01 est l'utilisateur actuellement connecté qui effectue le test
        let u2 = users.find(u => u.username === "test-03");

        // Deconnection de tous les membres
        if (step === 1) {
            for (const u of users) {
                u.lastTime = null;
            }
            await this.repo.save(users);
            await setLastActivity(current, "/citations");
            await sleep(50);
        }

        // Connexion d'un deuxième utilisateur A
        if (step === 2) {
            u1.lastTime = new Date();
            u1 = await setLastActivity(u1, "/citations");
            await sleep(50);
        }

        // Connexion d'un troisième utilisateur B
        if (step === 3) {
            u2.lastTime = new Date();
            u2 = await setLastActivity(u2, "/citations");
            await sleep(50);
        }

        // Action de l'utilisateur A
        if (step === 4) {
            u1.lastTime = new Date();
            u1 = await setLastActivity(u1, "/forum");
            await sleep(50);
        }

        // Simule l'absence d'action de A depuis 6 minutes
        // Action de l'utilisateur B
        if (step === 5) {
            u1.lastTime = subMinutes(new Date(), 6);
            await this.repo.save(u1);
            u2.lastTime = new Date();
            u2 = await setLastActivity(u2, "/forum");
            await sleep(50);
        }

        // Simule l'absence d'action de B depuis 11 minutes
        // Action de l'utilisateur A
        if (step === 6) {
            u2.lastTime = subMinutes(new Date(), 11);
            await this.repo.save(u2);
            u1.lastTime = new Date();
            u1 = await setLastActivity(u1, "/citations");
            await sleep(50);
        }

        // Connexion de tous les membres
        if (step === 7) {
            for (const u of users) {
                u.lastTime = new Date();
                await setLastActivity(u, "/forum");
                await sleep(50);
            }
        }

        // Deconnection de tous les membres
        if (step === 8) {
            for (const u of users) {
                u.lastTime = null;
            }
            await this.repo.save(users);
            await setLastActivity(u1, "/citations");
            await sleep(50);
        }
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
