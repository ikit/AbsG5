import { getRepository, Between } from "typeorm";
import { ForumMessage, ForumTopic } from "../entities";
import { addMonths, format } from "date-fns";
import { parse } from "querystring";

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
        year = Number.isInteger(year) ? year : new Date().getFullYear();
        month = Number.isInteger(month) ? month : new Date().getMonth();

        const from = new Date(year, 3);
        const to = addMonths(from, 1);

        // on récupère les messages sur la période demandée
        const data = await this.msgRepo
            .createQueryBuilder("m")
            .leftJoin("m.forum", "f")
            .leftJoinAndSelect("m.poster", "p")
            .where(`f.id = 2`)
            .andWhere({ datetime: Between(from, to) })
            .orderBy("m.datetime", "ASC")
            .getMany();
        console.log(data[0].text);
            return data.map(e => ({
                ...e,
                text: this.parseMessageText(e.text),
                dateLabel: format(new Date(e.datetime), "le D à HH:mm"),
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
        text = text.replace(/\\n/g, " ");
        return text;
    }
    
}

export const forumService = new ForumService();
