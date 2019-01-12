import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Person } from "./Person";
import { Place } from "./Place";
import { User } from "./User";

@Entity()
export class EventG {
    @PrimaryGeneratedColumn({ comment: 'id' })
    id: number;

    @Column({ comment: 'Année du début de l\'événement', width: 4 })
    startYear: number;

    @Column({ comment: 'Mois du début de l\'événement', width: 2})
    startMonth: number;

    @Column({ comment: 'Jour du début de l\'événement', width: 2 })
    startDay: number;

    @Column({ comment: 'Heure de début de l\'événement (en seconde)', width: 5 })
    startTime: number;

    @Column({ comment: 'Année de fin de l\'événement', width: 4, nullable: true })
    endYear: number;

    @Column({ comment: 'Mois de fin de l\'événement', width: 2, nullable: true })
    endMonth: number;

    @Column({ comment: 'Jour de fin de l\'événement', width: 2, nullable: true })
    endDay: number;

    @Column({ comment: 'Heure de fin de l\'événement (en seconde)', nullable: true })
    endTime: number;

    @Column({ comment: 'Titre de l\'événement' })
    title: string;

    @Column({ comment: 'Description de l\'événement', type: 'text', nullable: true })
    description: string;

    @Column({ comment: 'Coordonnée GPS de l\'événement', nullable: true })
    location: string;

    @OneToOne(type => User)
    @JoinColumn()
    author: User;

    @Column("json", { comment: 'Information de personnalisation de l\'événement', nullable: true })
    style: any;

    @OneToMany(type => Person, person => person.id)
    persons: Person[];

    @OneToMany(type => Place, place => place.id)
    places: Place[];
}
