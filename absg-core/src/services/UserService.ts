import { getRepository, MoreThanOrEqual, Between } from "typeorm";
import { User, LogPassag } from "../entities";
import { format } from "date-fns";

class UserService {
    private usersRepo = null;

    public initService() {
        this.usersRepo = getRepository(User);
    }

    /**
     * Retourne les infos nécessaire à l'initialisation de l'écran "citation" du site
     */
    public async checkNotifications(userId: number) {
        return [
            {
                icon: "fas fa-quote-left",
                url: "/citation",
                label: "3 nouvelle citation"
            },
            {
                icon: "fas fa-image",
                url: "/photos/immt",
                label: "1 nouvelle image du moment"
            },
            {
                icon: "fas fa-images",
                url: "/photos/albums",
                label: 'Nouvel album créé par Olivier: "Noel 2019"'
            },
            {
                icon: "fab fa-stack-overflow",
                url: "/photos/vrac",
                label: "75 photos triées depuis votre dernier passage"
            },
            {
                icon: "fab fa-stack-overflow",
                url: "/photos/vrac",
                label: "75 photos triées"
            }
        ];
    }

    /**
     * Retourne les logs de passage des membres sur le site entre 2 date
     */
    async getPassag(from: Date, to: Date = new Date()) {
        const sql = `SELECT l.*, u.username
            FROM log_passag l
            INNER JOIN "user" u ON u.id = l."userId" 
            WHERE l."datetime" BETWEEN '${format(from,"YYYY-MM-DD")}' AND '${format(to,"YYYY-MM-DD")}'
            ORDER BY l.datetime ASC`;
        // On récupère les données, on ne conserve que les 5 meilleures photos par catégories
        return getRepository(LogPassag).query(sql);
    }
}

export const userService = new UserService();
