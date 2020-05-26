import { getRepository, Between } from "typeorm";
import { ForumMessage, ForumTopic, User, Forum } from "../entities";
import { addMonths, format } from "date-fns";
import * as fr from "date-fns/locale/fr";
import * as path from "path";
import * as fs from "fs";
import { saveImage, decodeBase64Image } from "../middleware/commonHelper";
import { WebsocketService } from "./WebsocketService";
import { BadRequestError } from "routing-controllers";

class ForumService {
    private forumRepo = null;
    private topicRepo = null;
    private msgRepo = null;
    private userRepo = null;
    private wsService = null;

    public initService() {
        this.wsService = new WebsocketService();

        this.forumRepo = getRepository(Forum);
        this.topicRepo = getRepository(ForumTopic);
        this.msgRepo = getRepository(ForumMessage);
        this.userRepo = getRepository(User);
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
     * Renvoie la liste des forums
     */
    async getForums() {
        const forums = await this.forumRepo
            .createQueryBuilder("f")
            .leftJoinAndSelect("f.lastMessage", "m")
            .leftJoinAndSelect("m.poster", "p")
            .orderBy("f.id")
            .getMany();

        return forums.map(f => ({
            id: f.id,
            name: f.name,
            description: f.description,
            last: {
                username: f.lastMessage.poster.username,
                dateLabel: format(new Date(f.lastMessage.datetime), "dddd D MMM YYYY à HH:mm", { locale: fr }),
                avatar: `/img/avatars/${f.lastMessage.poster.id.toString().padStart(3, "0")}.png`
            }
        }));
    }

    /**
     * Renvoie la liste des sujets d'un forum
     */
    async getTopics(forumId: number) {
        const forum = await this.forumRepo
            .createQueryBuilder("f")
            .where(`f.id = ${forumId}`)
            .getOne();

        const topics = await this.topicRepo
            .createQueryBuilder("c")
            .leftJoin("c.forum", "f")
            .leftJoinAndSelect("c.firstMessage", "m1")
            .leftJoinAndSelect("m1.poster", "p1")
            .leftJoinAndSelect("c.lastMessage", "m2")
            .leftJoinAndSelect("m2.poster", "p2")
            .where(`c."forumId" = ${forumId}`)
            .orderBy("m2.datetime", "DESC")
            .getMany();

        return {
            forum,
            topics: topics.map(t => ({
                id: t.id,
                name: t.name,
                first: {
                    username: t.firstMessage.poster.username,
                    dateLabel: format(new Date(t.firstMessage.datetime), "dddd D MMM YYYY à HH:mm", { locale: fr })
                },
                last: {
                    username: t.lastMessage.poster.username,
                    dateLabel: format(new Date(t.lastMessage.datetime), "dddd D MMM YYYY à HH:mm", { locale: fr }),
                    avatar: `/img/avatars/${t.lastMessage.poster.id.toString().padStart(3, "0")}.png`
                }
            }))
        };
    }

    /**
     * Renvoie la liste des messages d'une discussion
     */
    async getPosts(topicId: number) {
        // On récupère les infos sur le sujet
        const topic = await this.topicRepo
            .createQueryBuilder("c")
            .leftJoinAndSelect("c.forum", "f")
            .leftJoinAndSelect("c.firstMessage", "m1")
            .leftJoinAndSelect("c.lastMessage", "m2")
            .where(`c.id = ${topicId}`)
            .getOne();

        // On récupère les messages
        const posts = await this.msgRepo
            .createQueryBuilder("m")
            .leftJoin("m.topic", "t")
            .leftJoinAndSelect("m.poster", "p")
            .where(`t.id = ${topicId}`)
            .orderBy("m.datetime", "ASC")
            .getMany();

        return {
            topic,
            posts: posts.map(e => ({
                ...e,
                text: this.parseMessageText(e.text),
                dateLabel: format(new Date(e.datetime), "dddd D MMM YYYY", { locale: fr }),
                timeLabel: format(new Date(e.datetime), "HH:mm", { locale: fr }),
                shortLabel: format(new Date(e.datetime), "le D MMM YYYY à HH:mm", { locale: fr }),
                poster: {
                    id: e.poster.id,
                    rootFamily: e.poster.rootFamily,
                    username: e.poster.username,
                    avatar: `/img/avatars/${e.poster.id.toString().padStart(3, "0")}.png`
                }
            }))
        };
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

        // on récupère les messages sur la période demandée
        const data = await this.msgRepo
            .createQueryBuilder("m")
            .leftJoin("m.forum", "f")
            .leftJoinAndSelect("m.poster", "p")
            .where(`f.id = 2`)
            .andWhere({ datetime: Between(from, to) })
            .orderBy("m.datetime", "ASC")
            .getMany();

        return {
            posts: data.map(e => ({
                ...e,
                text: this.parseMessageText(e.text),
                dateLabel: format(new Date(e.datetime), "dddd D à HH:mm", { locale: fr }),
                poster: {
                    id: e.poster.id,
                    rootFamily: e.poster.rootFamily,
                    username: e.poster.username,
                    avatar: `/img/avatars/${e.poster.id.toString().padStart(3, "0")}.png`
                }
            }))
        };
    }

    /**
     * Enregistre une pièce jointe sur le serveur
     * @param data les infos sur le message à poster
     * @param user l'utilisateur qui fait la demande
     */
    async savePost(data: any, user: any) {
        let msg = null;
        if (data.id) {
            // Si l'id est renseigné, on récupère l'instance en base pour la mettre à jour
            msg = await this.msgRepo.findOne({ where: { id: data.id } });
        }
        if (!msg) {
            msg = new ForumMessage();
        }
        // On met à jour le message
        msg.text = data.text;
        msg.datetime = new Date();
        msg.poster = user;
        msg.forum = await this.forumRepo.findOne({ where: { id: data.forumId } });

        // On extrait du message les images transmise encodé en base64 afin de les enregistré en
        // tant que fichier et économiser la taille de la base de donnée
        const bases64data = msg.text.match(/src="(data:image\/[^;]+;base64[^"]+)"/g);
        if (Array.isArray(bases64data) && bases64data.length > 0) {
            const currentYear = new Date().getFullYear();
            for (const img64 of bases64data) {
                const imageBuffer = decodeBase64Image(img64.substr(5, img64.length - 1));
                const fileName = new Date().getTime();
                const fileExt = imageBuffer.type.substr(imageBuffer.type.indexOf("/") + 1);

                const thumbPath = path.join(process.env.PATH_FILES, `attachments/${currentYear}/${fileName}_mini.${fileExt}`);
                const webPath = path.join(process.env.PATH_FILES, `attachments/${currentYear}/${fileName}.${fileExt}`);
                const webUrl = `${process.env.URL_FILES}/attachments/${currentYear}/${fileName}.${fileExt}`;

                await saveImage(imageBuffer.buffer, thumbPath, webPath, null);
                msg.text = msg.text.replace(img64, `src="${webUrl}"`);
            }
        }

        await this.msgRepo.save(msg);
        return {
            ...msg,
            text: this.parseMessageText(msg.text),
            dateLabel: format(new Date(msg.datetime), "dddd D à HH:mm", { locale: fr }),
            poster: {
                id: msg.poster.id,
                rootFamily: msg.poster.rootFamily,
                username: msg.poster.username,
                avatar: `/img/avatars/${msg.poster.id.toString().padStart(3, "0")}.png`
            }
        };
    }

    /**
     * Supprime un message du forum
     * @param id l'identifiant du message
     * @param user
     */
    async deletePost(id: number, user: User) {
        let msg = null;
        if (id) {
            // Si l'id est renseigné, on récupère l'instance en base pour la mettre à jour
            msg = await this.msgRepo.findOne({ where: { id: id } });
        }
        if (!msg) {
            throw new BadRequestError(`Le message avec l'identifiant n°${id} n'existe pas.`);
        }

        if (user.roles.indexOf("admin") > -1 || user.id === msg.poster.id) {
            return this.msgRepo.remove(msg);
        }
        throw new BadRequestError(`Vous n'avez pas les droits nécessaire pour supprimer ce message.`);
    }

    /**
     * Retourne la liste des sujets mis en avant
     */
    pinnedTopics() {
        return this.topicRepo
            .createQueryBuilder("t")
            .where(`t.pinned IS TRUE`)
            .getMany();
    }

    /**
     * Met en avant un sujet ou le retire
     * @param topicId l'identifiant du sujet
     */
    async switchPin(topicId: number) {
        // On récupère les infos sur le sujet
        const topic = await this.topicRepo
            .createQueryBuilder("t")
            .where(`t.id = ${topicId}`)
            .getOne();

        if (topic) {
            topic.pinned = !topic.pinned;
            await this.topicRepo.save(topic);

            this.wsService.broadcast({
                message: "pinnedTopicsChanged",
                payload: await this.pinnedTopics()
            });
            return topic;
        }
        throw new BadRequestError(`Le sujet n°${topicId} n'existe pas`);
    }

    /**
     * Enregistre une pièce jointe sur le serveur
     * @param file la pièce jointe
     * @param userId l'utilisateur qui fait la demande
     */
    async saveFile(file: any, userId: any) {
        const currentYear = new Date().getFullYear();
        const fileName = `${userId}_${new Date().getTime()}`;
        const fileExt = file.originalname.substr(file.originalname.lastIndexOf("."));
        const filePath = path.join(process.env.PATH_FILES, `attachments/${currentYear}/${fileName}${fileExt}`);
        const fileUrl = `${process.env.URL_FILES}/attachments/${currentYear}/${fileName}${fileExt}`;

        if (file.mimetype === "image/jpeg") {
            const thumb = path.join(process.env.PATH_FILES, `attachments/${currentYear}/${fileName}_mini${fileExt}`);
            await saveImage(file.buffer, thumb, filePath, null);
            return {
                url: fileUrl,
                href: `${process.env.URL_FILES}/attachments/${currentYear}/${fileName}_mini${fileExt}`
            };
        } else {
            fs.writeFileSync(filePath, file);
            return { url: fileUrl, href: null };
        }
    }

    /**
     * Supprime une pièce jointe du serveur
     * @param fileURI 
     * @param user 
     */
    deleteFile(fileURI: string, user: User) {
        // On analyse l'url pour retrouver le fichier sur le serveur
        const filePath = fileURI.replace(process.env.URL_FILES, process.env.PATH_FILES);
        if (fs.existsSync(filePath)) {
            if (user.roles.contains("Admin") || filePath.indexOf(`/${user.id}_`) > -1) {
                return fs.unlinkSync(filePath);
            } else {
                throw new BadRequestError(`Vous n'avez pas les droits nécessaire pour supprimer ce fichier.`);
            }
        }
        throw new BadRequestError(`Le fichier ${fileURI} n'existe pas.`);
    }
    
    /**
     * Sauvegarde un message en cours d'édition pour l'utilisateur courrant
     * @param draft 
     * @param user 
     */
    async saveDraft(draft: any, id: any) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (user) {
            user.draft = draft;
            this.userRepo.save(user);
        }
    }

    /**
     * Récupère le brouillon en cours d'édition de l'utilisateur si il existe
     * @param id l'identifiant de l'utilisateur
     */
    async getDraft(id: any) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (user) {
            return user.draft;
        }
        return null;
    }

    /**
     * TO REMOVE AND FIX PROBLEMS DIRECTLY IN DATABASE
     * @param text 
     */
    parseMessageText(text: string) {
        text = text.replace(/\{SMILIES_PATH\}/g, `${process.env.URL_FILES}/smilies`);
        text = text.replace(/\\r\\n/g, "<br/>");
        text = text.replace(/\\n/g, "<br/>");
        return text;
    }
}

export const forumService = new ForumService();
