import { getRepository, Equal } from "typeorm";
import { User } from "../entities";



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
                label: "3 nouvelle citation",
            },
            {
                icon: "fas fa-image",
                url: "/photos/immt",
                label: "1 nouvelle image du moment",
            },
            {
                icon: "fas fa-images",
                url: "/photos/albums",
                label: "Nouvel album créé par Olivier: \"Noel 2019\"",
            },
            {
                icon: "fab fa-stack-overflow",
                url: "/photos/vrac",
                label: "75 photos triées depuis votre dernier passage",
            },
            {
                icon: "fab fa-stack-overflow",
                url: "/photos/vrac",
                label: "75 photos triées",
            }
        ]
    }
}

export const userService = new UserService();
