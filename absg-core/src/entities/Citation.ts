import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Person } from "./Person";

@Entity()
export class Citation {
    @PrimaryGeneratedColumn({ comment: 'id' })
    id: number;
    
    @OneToOne(type => User)
    @JoinColumn()
    poster: User;
    
    @Column({ comment: 'La citation', type: 'text' })
    citation: string;

    @OneToOne(type => Person)
    @JoinColumn()
    author: Person;
}