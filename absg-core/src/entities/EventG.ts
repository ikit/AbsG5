import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Person } from "./Person";
import { Place } from "./Place";
import { User } from "./User";

@Entity()
export class EventG {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @Column({ comment: "Date de début de l'événement", nullable: false })
    startDate: Date;

    @Column({ comment: "Date de fin de l'événement", nullable: true })
    endDate: Date;

    @Column({ comment: "Titre de l'événement" })
    name: string;

    @Column({ comment: "Description de l'événement", type: "text", nullable: true })
    details: string;

    @Column({ comment: "Coordonnée GPS de l'événement", nullable: true })
    location: string;

    @ManyToOne(type => User)
    @JoinColumn()
    author: User;

    @Column({ comment: "Le type d'événement: gueudelot, guibert, guyomard, all, birthday, special", nullable: true })
    type: string;

    @OneToMany(
        type => Person,
        person => person.id
    )
    persons: Person[];

    @OneToMany(
        type => Place,
        place => place.id
    )
    places: Place[];

    fromJSON(json): EventG {
        Object.assign(this, json);
        return this;
    }
}
