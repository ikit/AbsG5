import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Person } from "./Person";
import { Place } from "./Place";
import { User } from "./User";

@Entity()
export class EventG {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @Column({ comment: "Année du début de l'événement", width: 4, nullable: true })
    startYear: number;

    @Column({ comment: "Mois du début de l'événement", width: 2, nullable: true })
    startMonth: number;

    @Column({ comment: "Jour du début de l'événement", width: 2, nullable: true })
    startDay: number;

    @Column({ comment: "Heure de début de l'événement (en heure)", width: 5, nullable: true })
    startTime: number;

    @Column({ comment: "Année de fin de l'événement", width: 4, nullable: true })
    endYear: number;

    @Column({ comment: "Mois de fin de l'événement", width: 2, nullable: true })
    endMonth: number;

    @Column({ comment: "Jour de fin de l'événement", width: 2, nullable: true })
    endDay: number;

    @Column({ comment: "Heure de fin de l'événement (en heure)", nullable: true })
    endTime: number;

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

    start?: Date;
    end?: Date;
    username?: string;
}
