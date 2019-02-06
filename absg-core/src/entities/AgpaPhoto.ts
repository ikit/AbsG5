import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { AgpaCategory } from "./AgpaCategory";
import { User } from "./User";


// liste des véhicules attendus pour la mission
@Entity()
export class AgpaPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => User)
    @JoinColumn()
    author: User;

    @OneToOne(type => AgpaCategory)
    @JoinColumn()
    category: AgpaCategory;
    
    @Column({ comment: 'Année de la photo', width: 4 })
    year: number;

    @Column({ comment: 'Nom du fichier', length: 20 })
    filename: string;

    @Column({ comment: 'Titre de la photo' })
    title: string;

    @Column({ comment: 'Classement de la photo', width: 4 })
    ranking: number;

    @Column({ comment: 'Numéro de la photo', width: 4 })
    number: number;

    @Column({ comment: 'Nombre de votes reçu par la photo', width: 4 })
    votes: number;

    @Column({ comment: 'Nombre de votes reçu par le titre la photo', width: 4 })
    votesTitle: number;

    @Column({ comment: 'Score obtenu par la photo', width: 3 })
    score: number;

    @Column({ comment: 'Score homogonéisé obtenu par la photo', width: 6 })
    gscore: number;

    @Column("json", { comment: 'Erreur disqualifiant la photo' })
    error: any;
}