import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Person } from "./Person";

@Entity()
export class Place {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ comment: "Nom de l'endroit" })
    name: string;

    @Column({ nullable: true, comment: "Description" })
    description: string;

    @Column({ comment: "Coordonnée GPS" })
    location: string;

    @OneToMany(
        type => Person,
        p => p.id
    )
    inhabitants: Person[];
}
