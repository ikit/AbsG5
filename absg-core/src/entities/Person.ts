import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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

    @Column({ nullable: true, comment: "Adresse de la personne" })
    address: string;

    @Column({ nullable: true, comment: "Le dernier emplois exercé par cette personne" })
    job: string;

    @Column({ nullable: true, comment: "Numéro de téléphone personnel" })
    phone: string;

    @Column({ nullable: true, comment: "Email" })
    email: string;

    @Column({ comment: "Photo de la personne", nullable: true })
    photo: string;

    @Column("json", { nullable: true, comment: "Dernière coordonnée GPS connu pour la personne (VoyaG)" })
    lastLocation: string;

    fromJSON(json: any): Person {
        Object.assign(this, json);
        console.log(json);
        // Post-traitement pour corriger le bug de conversion txt/json des valeurs null
        for (const [key, value] of Object.entries(this)) {
            if (value === "null" || value === "undefined") {
                this[key] = null;
            }
        }
        if (this.dateOfBirth && typeof this.dateOfBirth != "object") {
            this.dateOfBirth = new Date(this.dateOfBirth);
        }
        if (this.dateOfDeath && typeof this.dateOfDeath != "object") {
            this.dateOfDeath = new Date(this.dateOfDeath);
        }
        console.log(this);
        return this;
    }

    getFullname(): string {
        if (this.surname) {
            return this.surname;
        }
        const fullname = `${this.firstname} ${this.lastname}`.trim();
        return fullname ? fullname : `Personne ID ${this.id}`;
    }
}
