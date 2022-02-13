import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { differenceInMonths } from "date-fns";

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

    @Column({ nullable: true, comment: `Date de naissance au format YYYY.MM.DD` })
    dateOfBirth: string;

    @Column({ nullable: true, comment: "Date du décé au format YYYY.MM.DD" })
    dateOfDeath: string;

    @Column({ nullable: true, comment: "Dernière adresse connue de la personne" })
    address: string;

    @Column({ nullable: true, comment: "Le dernier emplois exercé par cette personne" })
    job: string;

    @Column({ nullable: true, comment: "Numéro de téléphone personnel" })
    phone: string;

    @Column({ nullable: true, comment: "Email" })
    email: string;

    @Column({ comment: "La maison mère à laquelle est rattéché la personne (gueudelot, guibert, guyo)", nullable: true })
    rootFamily: string;

    @Column("json", { nullable: true, comment: "Dernière coordonnée GPS connu pour la personne (VoyaG)" })
    lastLocation: any;

    @Column("json", { nullable: true, comment: "Liste des photos du trombinoscope concernant la personne" })
    trombis: any[];

    fromJSON(json: any): Person {
        Object.assign(this, json);
        // Post-traitement pour corriger le bug de conversion txt/json des valeurs null
        for (const [key, value] of Object.entries(this)) {
            if (value === "null" || value === "undefined") {
                this[key] = null;
            }
        }
        return this;
    }

    /**
     * Trouve parmi la liste des photos du trombinoscope le concernant, la photo la plus proche
     * de l'année demandé (respecte la chronologie, donc la photo ne peut pas être plus récente)
     * renvoie null le trombi est vide
     * renvoi la photo la plus récente si l'année n'est pas précisée
     * @param year l'année de la photo recherchée
     * @returns la photo si existe, sinon null
     */
    getPhoto(year: number = null): any {
        if (!year) {
            year = new Date().getFullYear();
        }

        if (Array.isArray(this.trombis) && this.trombis.length > 0) {
            let lastPhoto = this.trombis[0];
            for (const p of this.trombis) {
                if (p.year > year) {
                    break;
                }
                lastPhoto = p;
            }
            return lastPhoto;
        }

        return null;
    }

    getQuickName(): string {
        if (this.surname) {
            return this.surname.trim();
        }
        return this.firstname ? this.firstname : `Personne ID ${this.id}`;
    }

    getFullname(): string {
        if (this.surname) {
            return this.surname;
        }
        const fullname = `${this.firstname} ${this.lastname}`.trim();
        return fullname ? fullname : `Personne ID ${this.id}`;
    }

    getAge(year = null): string {
        let age = "";
        let birth = null;
        if (this.dateOfBirth) {
            birth = new Date(this.dateOfBirth);
            let lastDay = year ? new Date(year, 11, 31) : new Date();
            if (this.dateOfDeath && new Date(this.dateOfDeath).getTime() < lastDay.getTime()) {
                lastDay = new Date(this.dateOfDeath);
            }

            const y = lastDay.getFullYear() - birth.getFullYear();
            if (y > 1) {
                age = `${y} ans`;
            } else {
                const m = differenceInMonths(lastDay, birth);
                age = `${m} mois`;
            }
        }
        return age;
    }
}
