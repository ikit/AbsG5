import { Entity, PrimaryColumn, Column } from "typeorm";

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

    @Column({ comment: "Première année où la catégorie est apparue", nullable: true  })
    from: number;

    @Column({ comment: "Dernière année où la catégorie était jouable", nullable: true })
    to: number;

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
