import { AgpaCategory, AgpaPhoto, User } from "../../entities";
import { getRepository } from "typeorm";

export class AgpaContext {
    categories: Map<number, AgpaCategory>;
    photos: Map<number, AgpaPhoto>;
    authors: Map<number, string>;
    date: Date;
    totalPhotos: number = 0;
    totalAuthors: number = 0;


    async reset(year: number) {
        this.categories = new Map<number, AgpaCategory>();
        this.photos = new Map<number, AgpaPhoto>();
        this. authors = new Map<number, string>();
        this.totalPhotos = 0;
        this.totalAuthors = 0;
        
        
        const repo = getRepository(AgpaCategory);
        let sql = `SELECT c.*, v.title as "sTitle", v.description as "sDescription"
            FROM agpa_category c
            LEFT JOIN agpa_category_variation v ON c.id = v.id AND v.year=${year}
            ORDER BY c.order ASC`;
        const result = await repo.query(sql);

        for(const row of result)
        {
            const cat = new AgpaCategory()
            cat.fromJSON(row);
            cat.photos = [];
            cat.nbrPhotos = 0;
            cat.authors = [];
            this.categories.set(cat.id, cat);
        }
    }
}
