import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Person } from "./Person";

@Entity()
export class Citation {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @ManyToOne(type => User)
    @JoinColumn()
    poster: User;

    @Column({ comment: "La citation", type: "text" })
    citation: string;

    @ManyToOne(type => Person)
    @JoinColumn()
    author: Person;
}
