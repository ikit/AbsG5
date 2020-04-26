import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { differenceInMonths, format } from "date-fns";

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

    @Column({ nullable: true, comment: "Dernière adresse connue de la personne" })
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
    lastLocation: any;

    @Column("json", { nullable: true, comment: "Liste des photos du trombinoscope concernant la personne" })
    trombi: any;

    fromJSON(json: any): Person {
        Object.assign(this, json);
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
        return this;
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
            if (this.dateOfDeath && this.dateOfDeath.getTime() < lastDay.getTime()) {
                lastDay = this.dateOfDeath;
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

    // Trouve parmi la liste des photos du trombinoscope le concernant, la photo la plus proche
    // de l'année demandé (respecte la chronologie, donc la photo ne peut pas être plus récente)
    // Si aucune trombi trouvé, prend la photo de l'annuaire
    getPhotos(year: number = null): string[] {
        let filename = null;
        let folder = null;
        if (!year) {
            year = new Date().getFullYear();
        }

        if (Array.isArray(this.trombi)) {
            folder = "trombi/";
            let filenameYear = 0;
            for (const t of this.trombi) {
                const ty = Number.parseInt(t.substring(0, 4));
                if (ty > year) {
                    break;
                }
                if (ty >= filenameYear) {
                    filenameYear = ty;
                    filename = `${this.id}_${t}.jpg`;
                }
            }
            
            if (this.id == 2) {
                console.log(folder, filename);
            }
        }

        if (!filename) {
            filename = this.photo;
            folder = "persons/";
        }

        return [
            `${process.env.URL_FILES}${folder}mini/${filename ? filename : "no-photo.png"}`,
            `${process.env.URL_FILES}${folder}${filename ? filename : "no-photo.png"}`
        ];
    }
}
