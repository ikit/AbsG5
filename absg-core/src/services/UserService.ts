import { getRepository, Equal } from "typeorm";
import { User, LogPassag, Person } from "../entities";
import { format, differenceInDays } from "date-fns";
import { cleanString } from "../middleware/commonHelper";
import { authService } from ".";
import { logger } from "../middleware/logger";

class UserService {
    private usersRepo = null;
    private personsRepo = null;

    public initService() {
        this.usersRepo = getRepository(User);
        this.personsRepo = getRepository(Person);
    }

    /**
     * Renvoie la liste des utilisateurs en fonction des informations de filtrage et de pagination
     */
    public async getUsers() {
        // on récupère les utilisateurs
        const users = await this.usersRepo
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.person", "person")
            .orderBy("u.id")
            .getMany();

        return { users };
    }

    /**
     * Crée un nouvel utilisateur à partir des informations données
     * @param userData les données du nouveau compte utilisateur
     */
    public async createUser(userData: any) {
        logger.debug("createUser", userData);
        // On vérifie qu'on a bien reçu tous les champs nécessaires
        const hasMissingField =
            !userData || ["id", "username", "password", "roles"].some(field => !userData.hasOwnProperty(field));

        if (hasMissingField) {
            throw new Error(
                `Impossible de créer ou d'éditer le compte utilisateur. Certaines informations obligatoires sont manquantes`
            );
        }

        // Si création, on vérifie que username n'existe pas déjà
        const usernameClean = cleanString(userData.username);
        const usernameExists = await this.usersRepo.findOne({
            where: { usernameClean: Equal(usernameClean) },
            relations: ["person"]
        });
        if (usernameExists) {
            throw new Error(`Le pseudo est déjà pris`);
        }
        userData.usernameClean = usernameClean;

        try {
            // On crée le profile personnel associé a compte utilisateur
            let person = new Person().fromJSON(userData.person);
            person = await this.personsRepo.save(person);
            userData.person = person;

            // On chiffre le mot de passe
            userData.passwordHash = await authService.hashPassword(userData.password);

            // On stock le nouvel utilisateur en base
            userData.id = null;
            return this.usersRepo.save(userData);
        } catch (err) {
            throw new Error(`Erreur lors de la création du compte utilisateur: ${err.message}`);
        }
    }

    /**
     * Modifie un utilisateur à partir des informations données
     * @param userData les données du nouveau compte utilisateur
     */
    public async saveUser(userData: any) {
        logger.debug("edit user", userData);
        // On commence par récupérer les infos en base de l'utilisateurs à modifier
        const user = await this.usersRepo.findOne({ where: { id: Equal(userData.id) }, relations: ["person"] });

        // On met de côté le mot de passe actuelle
        const currentPwdHash = user.passwordHash;

        // On met à jours les infos de l'utilisateur
        user.fromJSON(userData);

        // On gère le cas du password
        if (userData.password) {
            // on met à jour avec le nouveau mot de passe
            user.passwordHash = await authService.hashPassword(userData.password);
        } else {
            // On garde l'ancien mot de passe
            user.passwordHash = currentPwdHash;
        }
        try {
            // On sauvegarde en base
            await this.personsRepo.save(user.person);
            return this.usersRepo.save(user);
        } catch (err) {
            throw new Error(`Erreur lors de l'édition du compte utilisateur: ${err.message}`);
        }
    }

    /**
     * Retourne les infos nécessaire à l'initialisation de l'écran "citation" du site
     */
    public async getLastNotifications() {
        // On récupère les 50 dernières notifications sur les 7 derniers jours
        const sql = `SELECT l.*, u.username
            FROM log_system l
            INNER JOIN "user" u ON u.id = l."userId" 
            WHERE severity = 'notice'
            ORDER BY l.datetime ASC
            LIMIT 50`;
        return getRepository(LogPassag).query(sql);
    }

    /**
     * Valide les notifications "vues" par l'utilisateur en mettant à jour sa date de "dernière vue"
     */
    public async checkNotifications(userId: number) {
        const user = await this.usersRepo.get(userId);
        if (user) {
            user.lastActivity = new Date();
            this.usersRepo.save(user);
            console.log("checkNotifications", user);
        }
        return new Date();
    }

    /**
     * Retourne les logs de passage des membres sur le site entre 2 date
     */
    async getPassag(from: Date, to: Date = new Date()) {
        const sql = `SELECT l.*, u.username
            FROM log_passag l
            INNER JOIN "user" u ON u.id = l."userId" 
            WHERE l."datetime" BETWEEN '${format(from, "YYYY-MM-DD HH:mm")}:00' 
            AND '${format(to, "YYYY-MM-DD HH:mm")}:00'
            ORDER BY l.datetime ASC`;
        // On récupère les données, on ne conserve que les 5 meilleures photos par catégories
        return getRepository(LogPassag).query(sql);
    }

    /**
     * 
     * @param from 
     * @param to 
     */
    async getPassagHistory(from: Date = null, to: Date = null) {
        to = to ? to : new Date();
        from = from && from < to ? from : new Date(to.getFullYear() - 1, to.getMonth(), 1);
        const deltaDays = differenceInDays(to, from);
        const sql = `SELECT d.date, count(DISTINCT l."userId")
            FROM (SELECT to_char(date_trunc('day', ('${format(to, "YYYY-MM-DD")}'::date - offs)), 'YYYY-MM-DD') AS date
                FROM generate_series(0, ${deltaDays}, 1) AS offs
                ) d
            LEFT OUTER JOIN log_passag l ON d.date = to_char(date_trunc('day', l.datetime), 'YYYY-MM-DD')
            GROUP BY d.date;`;
        return getRepository(LogPassag).query(sql);
    }
}

export const userService = new UserService();
