import { getConnection, getRepository, Equal } from "typeorm";
import { format, getDayOfYear } from "date-fns";
import { Immt, User, LogModule } from "../entities";
import { NotFoundError } from "routing-controllers";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../middleware/logger";

class ImmtService {
    private immtsRepo = null;

    public initService() {
        this.immtsRepo = getRepository(Immt);
    }

    /**
     * Renvoie la dernière image du moment en date
     */
    public async last() {
        return await this.immtsRepo.findOne({ order: { year: "DESC", day: "DESC" } });
    }

    /**
     * Retourne les infos nécessaire à l'initialisation de l'écran "immt" du site
     */
    public async getInitData() {
        const result = {
            immts: [],
            total: 0
        };

        // On récupère la liste des 20 dernière images
        result.immts = await this.immtsRepo.query(`SELECT i.*, u.username AS "posterName"
            FROM immt i
            LEFT JOIN "user" u ON i."userId"=u.id
            ORDER BY year DESC, day DESC LIMIT 20;`);

        // On récupère le nombre total de citations
        result.total = await this.immtsRepo.query(`SELECT COUNT(*) FROM immt;`);
        result.total = result.total[0].count;
        return result;
    }

    /**
     * Renvoie une immt à partir de son identifiant (composé de l'année et du jour dans l'année)
     */
    public async fromId(year: number, day: number) {
        const result = await this.immtsRepo.query(`SELECT i.*, u.username AS "posterName"
            FROM immt i 
            LEFT JOIN "user" u ON i."userId"=u.id
            WHERE i.year=${year} AND i.day=${day}`);
        return result[0];
    }

    /**
     * Renvoie les immt en fonction des informations de filtrage et de pagination
     */
    public async getImmts(pageIndex: number, pageSize: number) {
        let query = `SELECT i.*, u.username AS "posterName" 
            FROM immt i 
            LEFT JOIN "user" u ON i."userId"=u.id`;
        query += `OFFSET ${pageIndex * pageSize} LIMIT ${pageSize} ORDER BY year DESC, day DESC;`;

        const result = await this.immtsRepo.query(query);

        return result;
    }

    /**
     * Sauvegarde une image du moment
     * @param image l'image
     * @param title le titre de l'image du moment
     * @param user l'utilisateur qui poste l'image du moment
     */
    public async save(image: any, title: string, user: User) {
        const immt = new Immt();
        immt.user = user;
        immt.year = new Date().getFullYear();
        immt.title = title;
        immt.day = getDayOfYear(new Date());

        const filename = path.join(process.env.IMMT_PATH, `${immt.year}_${immt.day.toString().padStart(3, '0')}.jpg`);
        fs.writeFileSync(filename, image.buffer);
        this.immtsRepo.save(immt);
        
        logger.notice(`Nouvelle image du moment ajouté par ${user.username}`, {
            { userId: user.id, module: LogModule.photos }
        );

        return immt;
    }

    /**
     * Supprime une image du moment
     * Une immt ne peut être supprimé que par un admin,
     * ou bien par le poster si il s'agit de la dernière immt ajouté
     */
    public async remove(year: number, day: number) {
        // TODO: retrieve user info to check permission to delete

        const immt = await this.immtsRepo.find({ where: { year, day }, take: 1 });
        if (!immt) {
            throw new NotFoundError(`Immt was not found.`);
        }
        return this.immtsRepo.remove(immt);
    }
}

export const immtService = new ImmtService();
