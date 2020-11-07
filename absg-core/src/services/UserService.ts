import { getRepository, Equal } from "typeorm";
import { User, LogPassag, Person } from "../entities";
import { format, differenceInDays } from "date-fns";
import { cleanString, sendEmail } from "../middleware/commonHelper";
import { logger } from "../middleware/logger";
import { hashPassword, createToken } from "../middleware";
import { BadRequestError } from "routing-controllers";

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
        // On vérifie qu'on a bien reçu tous les champs nécessaires
        const hasMissingField =
            !userData || ["id", "username", "password", "roles"].some(field => !userData.hasOwnProperty(field));

        if (hasMissingField) {
            throw new BadRequestError(
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
            throw new BadRequestError(`Le pseudo est déjà pris`);
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
            await this.usersRepo.save(userData);

            logger.notice(`Nouvel utilisateur créé: ${userData.username}`);

            return userData;
        } catch (err) {
            logger.error(`Erreur lors de la création du compte utilisateur: ${err.message}`, err);
            throw new BadRequestError(`Erreur lors de la création du compte utilisateur: ${err.message}`);
        }
    }

    /**
     * Modifie un utilisateur à partir des informations données
     * @param userData les données du nouveau compte utilisateur
     */
    public async saveUser(userData: any) {
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
            throw new BadRequestError(`Erreur lors de l'édition du compte utilisateur: ${err.message}`);
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

            return users[0].id;
        }
        // On ignore la demande
        return null;
    }

    /**
     * Retourne les dernières notifications à afficher pour l'utilisateur
     */
    public async getLastNotifications(user: User) {
        // On récupère où en est l'utilisateur de son activité
        // user.lastTime

        // On récupère les 50 dernières notifications sur les 7 derniers jours
        const sql = `SELECT l.*, u.username
            FROM log_system l
            INNER JOIN "user" u ON u.id = l."userId" 
            WHERE severity = 'notice'
            ORDER BY l.datetime DESC
            LIMIT 50`;
        const notifs = await getRepository(LogPassag).query(sql);
        const notReads = user.activity.unreadNotifications;
        notifs.forEach(e => (e.read = notReads.indexOf(e.id) === -1));

        return notifs;
    }

    /**
     * Marque comme lu une notification pour l'utilisateur donné
     * @param notifId l'identifiant de la notification
     * @param user l'utilisateur concerné
     */
    markAsRead(notifId: number, user: User) {
        user.activity.unreadNotifications = user.activity.unreadNotifications.filter(id => id != notifId);
        this.usersRepo.save(user);
    }

    /**
     * Marque comme lu toutes les notifications pour l'utilisateur donné
     * @param user l'utilisateur concerné
     */
    markAllAsRead(user: User) {
        user.activity.unreadNotifications = [];
        this.usersRepo.save(user);
    }

    /**
     * Retourne les logs de passage des membres sur le site entre 2 date
     * @param from
     * @param to
     */
    getPassag(from: Date, to: Date = new Date()) {
        const sql = `SELECT l.*, u.username
            FROM log_passag l
            INNER JOIN "user" u ON u.id = l."userId" 
            WHERE l."datetime" BETWEEN '${format(from, "YYYY-MM-DD HH:mm")}:00' 
            AND '${format(to, "YYYY-MM-DD HH:mm")}:00'
            ORDER BY l.datetime ASC`;
        return getRepository(LogPassag).query(sql);
    }

    /**
     * Récupère le nombre de visiteurs uniques du site sur la période indiquée
     * @param from
     * @param to
     */
    getPassagHistory(from: Date = null, to: Date = null) {
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

    /**
     * Met à jour la position GPS d'un utilisateur
     * @param userId
     * @param gpsLocation
     */
    async updateGPS(userId: number, gpsLocation: any) {
        // on récupère l'utilisateur
        const user = await this.usersRepo
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.person", "person")
            .where("u.id = " + userId)
            .getOne();

        user.person.lastLocation = gpsLocation;
        await this.personsRepo.save(user.person);
        return user;
    }
}

export const userService = new UserService();
