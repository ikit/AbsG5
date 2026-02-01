import { Equal } from "typeorm";
import { getRepository } from "../middleware/database";
import { User, LogPassag, Person, LogModule } from "../entities";
import { format, differenceInDays } from "date-fns";
import { cleanString, sendEmail, saveImage } from "../middleware/commonHelper";
import { logger } from "../middleware/logger";
import { hashPassword, createToken } from "../middleware";
import { BadRequestError } from "routing-controllers";
import * as path from "path";

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
    public async getLastNotifications(user: User, sysLog = false) {
        // On récupère où en est l'utilisateur de son activité
        // user.lastTime
        let where = "WHERE severity = 'notice'";
        let limit = 50;
        if (sysLog && user.is("admin")) {
            where = "";
            limit = 500;
        }

        // On récupère les 50 dernières notifications sur les 7 derniers jours
        const sql = `SELECT l.*, u.username
            FROM log_system l
            LEFT JOIN "user" u ON u.id = l."userId" 
            ${where}
            ORDER BY l.datetime DESC
            LIMIT ${limit}`;
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
            WHERE l."datetime" BETWEEN '${format(from, "yyyy-MM-dd HH:mm")}:00' 
            AND '${format(to, "yyyy-MM-dd HH:mm")}:00'
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
            FROM (SELECT to_char(date_trunc('day', ('${format(to, "yyyy-MM-dd")}'::date - offs)), 'YYYY-MM-DD') AS date
                FROM generate_series(0, ${deltaDays}, 1) AS offs
                ) d
            LEFT OUTER JOIN log_passag l ON d.date = to_char(date_trunc('day', l.datetime), 'YYYY-MM-DD')
            GROUP BY d.date;`;
        return getRepository(LogPassag).query(sql);
    }

    /**
     * Récupère le profil complet d'un utilisateur avec ses photos de trombinoscope
     * @param userId ID de l'utilisateur
     */
    async getUserProfile(userId: number) {
        const user = await this.usersRepo
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.person", "person")
            .where("u.id = :userId", { userId })
            .getOne();

        if (!user) {
            throw new BadRequestError("Utilisateur non trouvé");
        }

        // Récupérer la liste des personnes pour les relations familiales
        const persons = await this.personsRepo
            .createQueryBuilder("p")
            .select(["p.id", "p.firstname", "p.lastname", "p.sex", "p.trombis", "p.dateOfBirth"])
            .getMany();

        const personsWithThumb = persons.map((p: Person) => {
            const photo = p.trombis && p.trombis.length > 0 ? p.trombis[p.trombis.length - 1] : null;
            return {
                id: p.id,
                firstname: p.firstname,
                lastname: p.lastname,
                sex: p.sex,
                dateOfBirth: p.dateOfBirth,
                thumb: photo ? `/files/trombi/mini/${p.id}_${photo.year}.jpg` : null
            };
        });

        const maxDate = user.person?.dateOfDeath ? new Date(user.person.dateOfDeath) : new Date();
        const minYear = user.person?.dateOfBirth ? new Date(user.person.dateOfBirth).getFullYear() : 1900;
        const maxYear = maxDate.getFullYear();

        return {
            profile: {
                id: user.id,
                personId: user.person?.id || null,
                username: user.username,
                rootFamily: user.rootFamily,
                roles: user.roles || [],
                email: user.person?.email || null,
                firstname: user.person?.firstname || null,
                lastname: user.person?.lastname || null,
                sex: user.person?.sex || 'undefined',
                dateOfBirth: user.person?.dateOfBirth || null,
                motherId: user.person?.motherId || null,
                fatherId: user.person?.fatherId || null,
                spouseId: user.person?.spouseId || null,
                trombis: (user.person?.trombis || []).map(t => ({
                    ...t,
                    url: `/files/trombi/${user.person.id}_${t.year}.jpg`,
                    thumb: `/files/trombi/mini/${user.person.id}_${t.year}.jpg`
                })),
                trombiYearRange: { min: minYear, max: maxYear }
            },
            persons: personsWithThumb
        };
    }

    /**
     * Met à jour l'email de l'utilisateur
     * @param userId ID de l'utilisateur
     * @param email Nouvel email
     */
    async updateEmail(userId: number, email: string) {
        const user = await this.usersRepo
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.person", "person")
            .where("u.id = :userId", { userId })
            .getOne();

        if (!user) {
            throw new BadRequestError("Utilisateur non trouvé");
        }

        if (!user.person) {
            throw new BadRequestError("Profil utilisateur incomplet");
        }

        user.person.email = email;
        await this.personsRepo.save(user.person);

        return { success: true, email };
    }

    /**
     * Met à jour les informations personnelles de l'utilisateur
     * @param userId ID de l'utilisateur
     * @param profileData Données du profil à mettre à jour
     */
    async updateUserProfile(userId: number, profileData: {
        email?: string;
        firstname?: string;
        lastname?: string;
        sex?: string;
        motherId?: number;
        fatherId?: number;
        spouseId?: number;
    }) {
        const user = await this.usersRepo
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.person", "person")
            .where("u.id = :userId", { userId })
            .getOne();

        if (!user) {
            throw new BadRequestError("Utilisateur non trouvé");
        }

        if (!user.person) {
            throw new BadRequestError("Profil utilisateur incomplet");
        }

        // Mettre à jour les champs modifiables
        if (profileData.email !== undefined) {
            user.person.email = profileData.email;
        }
        if (profileData.firstname !== undefined) {
            user.person.firstname = profileData.firstname;
        }
        if (profileData.lastname !== undefined) {
            user.person.lastname = profileData.lastname;
        }
        if (profileData.sex !== undefined) {
            user.person.sex = profileData.sex as any;
        }
        if (profileData.motherId !== undefined) {
            user.person.motherId = profileData.motherId;
        }
        if (profileData.fatherId !== undefined) {
            user.person.fatherId = profileData.fatherId;
        }
        if (profileData.spouseId !== undefined) {
            user.person.spouseId = profileData.spouseId;
        }

        await this.personsRepo.save(user.person);

        logger.info(`Profil utilisateur ${user.username} mis à jour`, {
            userId: user.id,
            module: LogModule.users
        });

        return { success: true };
    }

    /**
     * Ajoute ou remplace une photo du trombinoscope pour l'utilisateur
     * @param userId ID de l'utilisateur
     * @param year Année de la photo
     * @param image Image uploadée
     */
    async saveUserTrombi(userId: number, year: number, image: any) {
        const user = await this.usersRepo
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.person", "person")
            .where("u.id = :userId", { userId })
            .getOne();

        if (!user) {
            throw new BadRequestError("Utilisateur non trouvé");
        }

        if (!user.person) {
            throw new BadRequestError("Profil utilisateur incomplet");
        }

        const p = user.person;
        const filename = `${p.id}_${year}.jpg`;
        const title = `${p.getFullname()} - ${year} - ${p.getAge(year)}`;

        // Sauvegarder l'image
        const thumbPath = path.join(process.env.PATH_FILES, `trombi/mini/${filename}`);
        const urlPath = path.join(process.env.PATH_FILES, `trombi/${filename}`);
        await saveImage(image.buffer, thumbPath, urlPath, null);

        // Mettre à jour la base de données
        const data = {
            year: Number(year),
            title,
            thumb: `${process.env.URL_FILES}trombi/mini/${filename}`,
            url: `${process.env.URL_FILES}trombi/${filename}`
        };

        // Initialiser trombis si null
        if (!p.trombis) {
            p.trombis = [];
        }

        // Vérifier si l'année existe déjà
        const existingIndex = p.trombis.findIndex(e => e.year === Number(year));
        if (existingIndex > -1) {
            // Remplacer la photo existante
            p.trombis[existingIndex] = data;
        } else {
            // Ajouter la nouvelle photo
            p.trombis.push(data);
            p.trombis.sort((a, b) => a.year - b.year);
        }

        await this.personsRepo.save(p);

        logger.notice(`Photo trombinoscope "${title}" ${existingIndex > -1 ? 'remplacée' : 'ajoutée'} par ${user.username}`, {
            userId: user.id,
            module: LogModule.agenda
        });

        return {
            success: true,
            replaced: existingIndex > -1,
            trombi: data
        };
    }
}

export const userService = new UserService();
