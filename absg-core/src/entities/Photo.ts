import { Entity, ManyToOne, PrimaryColumn, Column, ManyToMany, JoinColumn } from "typeorm";
import { Person } from "./Person";
import { Place } from "./Place";

@Entity()
export class Photo {

    @PrimaryColumn({ comment: "Le nom de l'image" })
    id: string;
    @PrimaryColumn({ comment: "Le dossier de l'image" })
    folder: string;

    @Column({ comment: "Commentaire de l'image", nullable: true })
    comment: string;

    @Column({ comment: "Date de la prise de vue", nullable: true })
    date: Date;

    @Column("json", { comment: "La liste des principales personnes connues sur la photo", nullable: true })
    persons: number[];

    @ManyToOne(() => Place)
    @JoinColumn()
    place: Place;

    @Column("json", { comment: "La position GPS de la prise de vue", nullable: true })
    gps: any;

    @Column({ comment: "Photo mise en évidence par les membres", default: false })
    starred: boolean;

    @Column({ comment: "Indique si la photo a déjà été trié (true) ou non (false)", default: false })
    checked: boolean;
}
