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
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @Column({ nullable: true, comment: "Prénom" })
    firstname: string;

    @Column({ nullable: true, comment: "Seconds prénoms" })
    firstname2: string;

    @Column({ nullable: true, comment: "Nom de famille" })
    lastname: string;

    @Column({ nullable: true, comment: "Surnom" })
    surname: string;

    @Column("enum", { enum: ["female", "male", "undefined"], comment: `Sexe`, default: "undefined" })
    sex: Sex;

    @Column({ nullable: true, comment: `Date de naissance` })
    dateOfBirth: Date;

    @Column({ nullable: true, comment: "Date du décé" })
    dateOfDeath: Date;

    @OneToOne(type => Place)
    @JoinColumn()
    homePlace: Place;

    @Column("json", { nullable: true, comment: "Liste des emplois" })
    jobs: any;

    @Column({ nullable: true, comment: `Numéro de téléphone personnel` })
    phone: string;

    @Column({ nullable: true, comment: `Email` })
    email: string;

    @OneToMany(
        type => Website,
        website => website.id
    )
    websites: Website[];

    @Column("json", { nullable: true, comment: "Dernière coordonnée GPS connu pour la personne (VoyaG)" })
    lastLocation: string;

    fromJSON(json: any): Person {
        Object.assign(this, json);
        return this;
    }

    getFullname() : string {
        if (this.surname) {
            return this.surname;
        }
        const fullname = `${this.firstname} ${this.lastname}`.trim();
        return fullname ? fullname : `Personne ID ${this.id}`;
    }
}
