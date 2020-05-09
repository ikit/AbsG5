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

    @Column("json", { comment: "Keep trace of the last action of the user on the server", nullable: true })
    lastActivity: any;

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
}
