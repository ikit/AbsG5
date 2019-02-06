import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Place } from "./Place";
import { User } from "./User";
import { Website } from "./Website";


export enum Sex {
    female,
    male,
    undefined
}


@Entity()
export class Person {
    @PrimaryGeneratedColumn({ comment: 'id' })
    id: number;

    @Column({ nullable: true, comment: 'Prénom' })
    firstname: string;

    @Column({ nullable: true, comment: 'Seconds prénoms' })
    firstname2: string;

    @Column({ nullable: true, comment: 'Nom de famille' })
    lastname: string;

    @Column({ nullable: true, comment: 'Surnom' })
    surname: string;

    @Column("enum", { enum: ['female', 'male', 'undefined'], comment: `Sexe`, default: 'undefined' })
    sex: Sex;

    @Column({ comment: `Date de naissance` })
    dateOfBirth: Date;

    @Column({ nullable: true, comment: 'Date du décé' })
    dateOfDeath: Date;

    @OneToOne(type => Place)
    @JoinColumn()
    homePlace: Place;

    @OneToOne(type => Place)
    @JoinColumn()
    jobPlace: Place;

    @Column({ nullable: true, comment: `Numéro de téléphone personnel` })
    phone: string;

    @Column({ default: 1, comment: `Email` })
    email: string;

    @OneToMany(type => Website, website => website.id)
    websites: Website[];

}