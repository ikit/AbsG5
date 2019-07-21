import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Immt {
    @PrimaryColumn({ comment: 'Année de l\'image', width: 4 })
    year: number;

    @PrimaryColumn({ comment: 'Jour dans l\'année de l\'image', width: 3 })
    day: number;
    
    @ManyToOne(type => User)
    @JoinColumn()
    user: User;
    
    @Column({ comment: 'Titre de l\'image', nullable: true })
    title: string;
}
