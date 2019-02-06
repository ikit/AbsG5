import { Entity, Column, OneToOne, JoinColumn, Index, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./Person";


@Entity()
@Index(["person", "datetime"], { unique: true })   
export class PersonLocation {
    @PrimaryGeneratedColumn({ comment: 'id' })
    id: number;
    
    @OneToOne(type => Person)
    @JoinColumn()
    person: Person;
 
    @Column({ comment: 'Date de l\'événement' })
    datetime: Date;

    @Column({ comment: 'Coordonnée GPS de l\'événement' })
    location: string;
}