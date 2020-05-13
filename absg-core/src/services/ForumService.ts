import { getRepository, Between } from "typeorm";
import { ForumMessage, ForumTopic } from "../entities";
import { addMonths, format } from "date-fns";
import * as fr from "date-fns/locale/fr";

class ForumService {
    private topicRepo = null;
    private msgRepo = null;

    public initService() {
        this.msgRepo = getRepository(ForumMessage);
        this.topicRepo = getRepository(ForumTopic);
    }

    /**
     * Renvoie une discussion au hasard
     */
    public async random() {
        return this.topicRepo
            .createQueryBuilder("c")
            .leftJoinAndSelect("c.author", "a")
            .leftJoinAndSelect("c.poster", "p")
            .orderBy("RANDOM()")
            .getOne();
    }

    /**
     * Renvoie les messages TBZ en fonction de l'année et du mois
     * @param year par défaut l'année courrante
     * @param month par défaut le mois courrant (de 0 à 11)
     */
    public async getTbzPosts(year: number = null, month: number = null) {
        // controle sur les paramètres
        year = year ? year : new Date().getFullYear();
        month = month !== null && month >= 0 && month <= 11 ? month : new Date().getMonth();

        const from = new Date(year, month, 1, 1, 0, 0);
        let to = addMonths(from, 1);
        to = new Date(to.getFullYear(), to.getMonth(), 1, 1, 0, 0);
        console.log("GET:", from, to);

        // on récupère les messages sur la période demandée
        const data = await this.msgRepo
            .createQueryBuilder("m")
            .leftJoin("m.forum", "f")
            .leftJoinAndSelect("m.poster", "p")
            .where(`f.id = 2`)
            .andWhere({ datetime: Between(from, to) })
            .orderBy("m.datetime", "ASC")
            .getMany();

        return data.map(e => ({
            ...e,
            text: this.parseMessageText(e.text),
            dateLabel: format(new Date(e.datetime), "le dddd D à HH:mm", { locale: fr }),
            poster: {
                id: e.poster.id,
                rootFamily: e.poster.rootFamily,
                username: e.poster.username,
                avatar: `/img/avatars/${e.poster.id.toString().padStart(3, "0")}.png`
            }
        }));
    }

    parseMessageText(text: string) {
        text = text.replace(/\{SMILIES_PATH\}/g, `${process.env.URL_FILES}/smilies`);
        text = text.replace(/\\r\\n/g, "<br/>");
        text = text.replace(/\\n/g, "<br/>");
        return text;
    }
}

export const forumService = new ForumService();
