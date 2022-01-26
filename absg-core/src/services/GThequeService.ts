import { User } from "../entities";
import * as fs from "fs";
import * as path from "path";
import { fetchFolder } from "../middleware/commonHelper";
import { GThequeCollection } from "../entities/GThequeCollection";
import { getRepository, Repository } from "typeorm";
import { GTheque } from "../entities/GTheque";
import * as urljoin from "url-join";

class GThequeService {
    private collectionRepo: Repository<GThequeCollection> = null;
    private thequeRepo: Repository<GTheque> = null;
    private defaultFolderThumb = urljoin(process.env.URL_FILES, "cloud", "_", "thumb.folder.png");
    private defaultFileThumb = urljoin(process.env.URL_FILES, "cloud", "_", "thumb.file.png");

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

    /**
     * Récupère la liste de toutes les collections définies en base
     */
    public async getCollections() {
        return this.collectionRepo
            .createQueryBuilder("c")
            .orderBy("c.title", "ASC")
            .getMany();
    }

    /**
     * Retourne l'arbirescence de tout les fichiers présent dans le grenier
     */
    public getGrenaryFiles() {
        const localFiles = fetchFolder(path.join(process.env.PATH_FILES, "cloud"));

        // méthode récursive pour l'analye et la mise en forme de l'arborescence
       const parseFolder = (item, list, rootPath) => {
            if (item.name.startsWith("_")) {
                return null; // dossier/fichier technique a ignorer
            }

            if (item.type === "folder") {
                const localPath = urljoin(rootPath, item.name);
                let thumb = item.content.find(f => f.name === `_thumb.${item.name}`);
                if (thumb) {
                    thumb = urljoin(process.env.URL_FILES, "cloud", rootPath, `${thumb.name}${thumb.type}`);
                } else {
                    thumb = this.defaultFolderThumb;
                }
                const content = item.content.map(f => parseFolder(f, item.content, localPath)).filter(f => f !== null);
                // Si le dossier ne contient rien, on l'ignore
                if (content.length === 0) {
                    return null;
                }
                // On retourne le fichier correctement formaté
                return {
                    name: item.name,
                    type: item.type,
                    content,
                    path: "/" + localPath,
                    thumb
                };
            }

            // Pour les fichier, on récupère le thumb et on l'url publique
            let thumb = list.find(f => f.name === `_thumb.${item.name}`);
            if (thumb) {
                thumb = urljoin(process.env.URL_FILES, "cloud", rootPath, `${thumb.name}${thumb.type}`);
            } else {
                thumb = this.defaultFileThumb;
            }

            const url = urljoin(process.env.URL_FILES, "cloud", rootPath, item.name + item.type);
            return {
                ...item,
                thumb,
                url
            };
        }

        return localFiles.map(f => parseFolder(f, localFiles, "")).filter(f => f !== null);
    }
}

export const gthequeService = new GThequeService();
