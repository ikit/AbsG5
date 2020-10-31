import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Person } from "./Person";

@Entity()
export class Citation {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @ManyToOne(() => User)
    @JoinColumn()
    poster: User;

    @Column({ comment: "La citation", type: "text" })
    citation: string;

    @ManyToOne(() => Person)
    @JoinColumn()
    author: Person;

    @Column({ comment: "Année où a été prononcé la citation", nullable: true })
    year: number;

    fromJSON(json: any): Citation {
        Object.assign(this, json);
        if (this.author) {
            this.author = new Person().fromJSON(this.author);
        }
        return this;
    }
}
