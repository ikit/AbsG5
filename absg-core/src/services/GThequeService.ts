import { User } from "../entities";
import * as fs from "fs";
import * as path from "path";
import { fetchFolder } from "../middleware/commonHelper";
import { GThequeCollection } from "../entities/GThequeCollection";
import { getRepository, Repository } from "typeorm";
import { GTheque } from "../entities/GTheque";

class GThequeService {
    private collectionRepo: Repository<GThequeCollection> = null;
    private thequeRepo: Repository<GTheque> = null;

    public initService() {
        this.collectionRepo = getRepository(GThequeCollection);
        this.thequeRepo = getRepository(GTheque);
    }

    /**
     * Retourne l'arborescence de fichier disponnible dans le theque en fonction des droits de l'utilisateur
     * @param user l'utilisateur qui demande à voir l'arborescence
     */
    public async getGTheque(user: User) {
        const col = await this.thequeRepo
            .createQueryBuilder("t")
            .leftJoinAndSelect("t.collection", "c")
            .where(`t."userId" = ${user.id}`)
            .orderBy("c.title", "ASC")
            .getMany();

        const result = col.map(c => ({
            ...c.collection,
            count: c.data.filter(e => e).length,
            total: c.collection.items.length
        }));

        for (let cIdx = 0; cIdx < result.length; cIdx++) {
            const c = result[cIdx];
            for (let idx = 0; idx < c.items.length; idx++) {
                c.items[idx].ok = col[cIdx].data[idx];
            }
        }

        return result;
    }


    public async getCollection() {
        return this.collectionRepo
            .createQueryBuilder("c")
            .orderBy("c.title", "ASC")
            .getMany();
    }
}

export const gthequeService = new GThequeService();
