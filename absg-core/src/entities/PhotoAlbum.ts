import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PhotoAlbum {
    @PrimaryGeneratedColumn({ comment: "L'identifiant unique de l'album" })
    id: number;

    @Column({ comment: "Le titre de l'album" })
    title: string;

    @Column({ comment: "Commentaire de l'album", nullable: true })
    comment: string;

    @Column({ comment: "Date de la prise de vue au format YYYY-MM-DD HH-MM-SS", nullable: true })
    date: string;

    @Column("json", { comment: "La liste des photos de l'album", nullable: true })
    photos: any;

    @Column({ comment: "Le nom de la photo à utiliser comme couverture", nullable: true })
    coverPhoto: string;

    @Column({ comment: "L'ordre d'affichage des albums les uns par rapport aux autres", default: 1 })
    order: number;

    @Column({
        comment: "Indique si l'album concerne une famille et est donc 'reserve' aux membres de celle-ci",
        nullable: true
    })
    family: string;
}
