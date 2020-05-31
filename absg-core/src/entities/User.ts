import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Person } from "./Person";

@Entity()
export class User {
    @PrimaryGeneratedColumn({ comment: "user_id" })
    id: number;

    @OneToOne(() => Person)
    @JoinColumn()
    person: Person;

    @Column({ comment: "display name of the user", unique: true })
    username: string;

    @Column({ comment: "clean name of the user used for login" })
    usernameClean: string;

    @Column({ comment: "hash of the user password", nullable: true })
    passwordHash: string;

    @Column({ comment: "Authentication token", nullable: true })
    token: string;

    @Column("json", { comment: "users authorisations", nullable: true })
    roles: any;

    @Column("json", { comment: "Le dernier message en cours d'édition du forum", nullable: true })
    draft: any;

    @Column({ comment: "Le dernier passage enregistré de l'utilisateur sur le site", nullable: true })
    lastTime: Date;

    @Column("json", { comment: "Données concernant l'activité de l'utilisateur", nullable: true })
    activity: any;

    @Column({ comment: "Authentication token", nullable: true })
    rootFamily: string;

    @Column({ comment: "Si le compte est activé ou non", default: true })
    isActive: boolean;

    public fromJSON(json: any) {
        Object.assign(this, json);
        if (json.person) {
            this.person = new Person().fromJSON(json.person);
        }
        return this;
    }

    public setLastActivity(url: string) {
        if (!this.activity) {
            this.activity = {
                lastAction: url, // lien (route) vers la dernière section du site visité
                lastAnnounce: 0, // dernière date à laquelle on a affiché l'annonce en cours du site à l'utilisateur (pas plus d'une fois par jour)
                unreadNotifications: [] // liste des id des notifications non lues de l'utilisateur
            };
        } else {
            this.activity.lastActio = url;
        }
    }
}
