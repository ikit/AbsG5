import { getRepository, Equal } from "typeorm";
import { User, LogPassag, Person } from "../entities";
import { format, differenceInDays } from "date-fns";
import { cleanString, sendEmail } from "../middleware/commonHelper";
import { logger } from "../middleware/logger";
import { hashPassword, createToken } from "../middleware";

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
            userData.passwordHash = await hashPassword(userData.password);

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
            user.passwordHash = await hashPassword(userData.password);
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
     * Met à jour le mot de l'utilisateur
     * @param user l'utilisateur qui fait la demande
     * @param pwd le nouveau mot de passe
     */
    async changePassword(user: User, pwd: any) {
        // On sauvegarde le nouveau mot de passe
        user.passwordHash = await hashPassword(pwd);

        // On régénère la session de l'utilisateur
        user.token = await createToken(user);

        await this.usersRepo.save(user);
        return user;
    }

    /**
     * Crée un lien pour réinitialiser son mot de passe
     */
    async resetPassword(email: string) {
        // On regarde si on trouve un utilisateur qui correspond à l'adresse email
        const users = await this.usersRepo
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.person", "p")
            .where(`p.email = '${email}'`)
            .getMany();
        
        if (users.length > 1) {
            throw new Error(
                "Plusieurs comptes possèdent cet email. Veuillez voir avec un administrateur du site pour réinitialiser votre mot de passe"
            );
        } else if (users.length === 1) {
            // On crée une session de 10 minutes avec acccès restreind pour laisser le temps à l'utilisateur de changer son mdp
            users[0].token = await createToken(users[0], true);
            await this.usersRepo.save(users[0]);
            // On envoie un email à l'utilisateur avec le lien
            sendEmail(
                "Absolument G - demande de réinitialisation d'email",
                `Bonjour ${users[0].username},

Une demande de réinitialisation de votre mot de passe viens d'être faite sur le site absolumentg.fr.
Le liens ci-dessous est valide 10 minutes et vous permettra de modifier votre mot de passe.

${process.env.URL_CLIENT}resetpwd?session=${encodeURI(users[0].token)}.

L'équipe système`,
                users[0].person.email
            );
        }
        // On ignore la demande
        return null;
    }

    /**
     * Retourne les dernières notifications à afficher pour l'utilisateur
     */
    public async getLastNotifications() {
        // On récupère les 50 dernières notifications sur les 7 derniers jours
        const sql = `SELECT l.*, u.username
            FROM log_system l
            INNER JOIN "user" u ON u.id = l."userId" 
            WHERE severity = 'notice'
            ORDER BY l.datetime DESC
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
