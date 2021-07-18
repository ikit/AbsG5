import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Photo {
    @PrimaryColumn({ comment: "Le nom de l'image" })
    id: string;
    @PrimaryColumn({ comment: "Le dossier de l'image" })
    folder: string;

    @Column({ comment: "Commentaire de l'image", nullable: true })
    comment: string;

    @Column({ comment: "Date de la prise de vue au format YYYY-MM-DD HH-MM-SS", nullable: true })
    date: string;

    @Column("json", { comment: "Les personnes principales sur la photo", nullable: true })
    persons: any;

    @Column({ comment: "L'endroit où a été prise la photo", nullable: true })
    place: string;

    @Column("json", { comment: "La position GPS de la prise de vue", nullable: true })
    gps: any;

    @Column({ comment: "Indique si la photo a été marqué comme étant en double", default: false })
    doublon: boolean;

    @Column({
        comment: "Indique si la photo concerne une famille et est donc 'reserve' aux membres de celle-ci",
        nullable: true
    })
    family: string;

    @ManyToOne(() => User)
    @JoinColumn()
    poster: User;
}
