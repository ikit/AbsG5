import { getRepository } from "typeorm";
import { User, LogPassag } from "../entities";
import { format, differenceInDays } from "date-fns";
import { isNumber } from "util";

class UserService {
    private usersRepo = null;

    public initService() {
        this.usersRepo = getRepository(User);
    }

    /**
     * Renvoie la liste des utilisateurs en fonction des informations de filtrage et de pagination
     */
    public async getUsers(pageIndex: number, pageSize: number) {
        // controle sur les paramètres
        pageSize = isNumber(pageSize) && pageSize > 0 ? pageSize : 20;

        // on calcule le nombre de citations max en fonction du filtre sur les auteurs
        let totalUsers = await this.usersRepo.query("SELECT COUNT(*) FROM user");
        totalUsers = totalUsers[0].count;

        // 2: on borne la pagination en fonction du nombre max (pagesize = all quand filtre par auteur)
        const totalPages = Math.round(totalUsers / pageSize);
        pageIndex = isNumber(pageIndex) && pageIndex > 0 && pageIndex < totalPages ? pageIndex : 0;

        // on récupère les citations
        const users = await this.usersRepo
            .createQueryBuilder("u")
            .leftJoinAndSelect("u.person", "person")
            .getMany();

        return { totalUsers, totalPages, pageSize, pageIndex, users };
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
