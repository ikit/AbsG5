import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum GThequeType {
    Comic = "COMIC",
    Book = "BOOK",
    Wine = "WINE",
    Manga = "MANGA",
    BoardGame = "BOARDGAME",
    Lego = "LEGO",
}


@Entity()
export class GThequeCollection {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @Column({ comment: "Titre de la collection" })
    title: string;

    @Column({ comment: "Type de la collection" })
    type: GThequeType;

    @Column("json", { comment: "Les items de la collection" })
    items: any[];
}
