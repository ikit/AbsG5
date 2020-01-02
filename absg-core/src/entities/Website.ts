import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Website {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @Column({ comment: "Titre du site web" })
    name: string;

    @Column({ comment: "Description du site web" })
    description: string;

    @Column({ comment: "Url du site web" })
    url: string;

    @Column({ comment: "Date de la dernière maj du site" })
    lastUpdate: Date;

    @OneToOne(type => User)
    @JoinColumn()
    lastUpdateBy: User;

    @Column({ comment: "Nombre de clicks reçu par le site" })
    clicks: number;
}
