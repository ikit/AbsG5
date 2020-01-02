import { Entity, PrimaryColumn, Column } from "typeorm";
import { AgpaPhoto } from "./AgpaPhoto";
import { User } from "./User";

@Entity()
export class AgpaCategory {
    @PrimaryColumn()
    id: number;

    @Column({ comment: "Ordre d'affichage de la catégorie", width: 2 })
    order: number;

    @Column({ comment: "Titre de la catégorie" })
    title: string;

    @Column({ comment: "Description de la catégorie" })
    description: string;

    @Column({ comment: "Couleur de la catégorie", length: 7 })
    color: string;

    // Transient properties
    photos: number[]; // liste des id des photos de la catégorie
    nbrPhotos: number; // nombre de photos posté dans la catégorie
    authors: number[]; // liste des id des users qui ont participé à la catégorie

    // Methods
    public fromJSON(json: any) {
        this.id = json.id ? json.id : null;
        this.order = json.order ? json.order : null;
        this.title = json.title ? json.title : null;
        this.description = json.description ? json.description : null;
        this.color = json.color ? json.color : null;
    }
}
