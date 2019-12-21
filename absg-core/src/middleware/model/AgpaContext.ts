import { AgpaCategory, AgpaPhoto, User } from "../../entities";
import { getRepository } from "typeorm";
import { AgpaPhase } from "./AgpaPhase";
import { addDays, differenceInHours } from "date-fns";
import { getPhasesBoundaries, getCurrentEdition, getCurrentPhase, agpaCtx } from "../agpaCommonHelpers";

export class AgpaContext {
    categories: Map<number, AgpaCategory>; // catId => category
    photos: Map<number, AgpaPhoto>; // photoId => photo
    authors: Map<number, string>; // userId => user name
    date: Date;
    editionYear: number;
    phase: number = null;
    phases: AgpaPhase[];
    totalPhotos = 0;
    totalAuthors = 0;

    lastUpdateRefDate: Date = null; // La date de référence utilisé pour la dernière maj du contexte

    /**
     * Vérifie en fonction de la date courante si les infos du contexte doivent être rafraichient
     *
     */
    async checkForReset(): Promise<AgpaContext> {
        const currentYear = new Date().getFullYear();

        // Si pas encore init ou bien dernier reset à plus de 24h: il faut rafraichir le contexte
        const needToRefresh = !this.lastUpdateRefDate || differenceInHours(currentYear, this.lastUpdateRefDate) >= 24;

        // On recalcul le contexte

        if (needToRefresh) {
            return this.reset(new Date());
        }

        return agpaCtx;
    }

    /**
     *
     * @param date
     */
    async reset(date: Date): Promise<AgpaContext> {
        console.log("reset AGPA contexte");
        this.categories = new Map<number, AgpaCategory>();
        this.photos = new Map<number, AgpaPhoto>();
        this.authors = new Map<number, string>();
        this.totalPhotos = 0;
        this.totalAuthors = 0;
        this.lastUpdateRefDate = date;

        // On récupère les dates butoires des différentes phases
        this.editionYear = getCurrentEdition();
        this.phases = getPhasesBoundaries();

        // On en déduis la phase actuelle pour l'édition en cours
        for (const p of this.phases) {
            if (date > p.startDate) {
                this.phase = p.id;
            }
        }

        // Reset les infos des catégories
        const repo = getRepository(AgpaCategory);
        let sql = `SELECT c.*, v.title as "sTitle", v.description as "sDescription"
            FROM agpa_category c
            LEFT JOIN agpa_category_variation v ON c.id = v.id AND v.year=${this.editionYear}
            ORDER BY c.order ASC`;
        let result = await repo.query(sql);

        for (const row of result) {
            const cat = new AgpaCategory();
            cat.fromJSON(row);
            cat.photos = [];
            cat.nbrPhotos = 0;
            cat.authors = [];
            this.categories.set(cat.id, cat);
        }

        // On récupère les photos
        sql = `SELECT p.*, U.username, a.award, a."categoryId" as "awardCategoryId"
            FROM agpa_photo p 
                INNER JOIN "user" u ON U.id = p."userId" 
                LEFT JOIN agpa_award a ON a."photoId" = p.id 
            WHERE p.year=${this.editionYear}
            ORDER BY p."categoryId" ASC, p.gscore DESC, p.number ASC`;

        // On récupère les données
        result = await repo.query(sql);
        for (const row of result) {
            // On vérifie que la photo n'est pas déjà enregistré (peux arriver si la photo à plusieurs award (Agpa bronze + meilleur titre par exemple)
            if (!this.photos.has(row.id)) {
                // On augmente le nombre de photo inscrite dans la catégorie concernée
                this.categories.get(row.categoryId).photos.push(row.id);
                this.categories.get(row.categoryId).nbrPhotos++;
                this.totalPhotos++;

                // On ajoute l'autheur si il ne l'a pas déjà été
                if (!this.authors.has(row.userId)) {
                    this.authors.set(row.userId, row.username);
                    this.totalAuthors++;
                }

                // On reformate les infos des awards (en liste car une photos peut en avoir plusieurs)
                const awards = new Map<number, string>();
                if (row.award != null) {
                    awards.set(row.awardCategoryId, row.award);
                }

                // On stocke les infos de la photo
                const photo = new AgpaPhoto();
                photo.fromJSON(row);
                photo.awards = awards;

                this.photos.set(photo.id, photo);
            } else {
                // on ajoute l'award
                this.photos.get(row.id).awards.set(row.awardCategoryId, row.award);
            }
        }
        return this;
    }
}
