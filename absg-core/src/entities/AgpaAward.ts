import { Entity, OneToOne, Column, JoinColumn, PrimaryColumn, Index, PrimaryGeneratedColumn } from "typeorm";
import { AgpaCategory } from "./AgpaCategory";
import { AgpaPhoto } from "./AgpaPhoto";
import { User } from "./User";


export enum AgpaAwardType {
    honor,
    nominated,
    bronze,
    sylver,
    gold,
    diamond
}

@Entity()
@Index(["year", "category", "user", "award"], { unique: true })
export class AgpaAward {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ comment: 'Année d\'attribution de l\'agpa', width: 4 })
    year: number;

    @OneToOne(type => AgpaCategory)
    @JoinColumn()
    category: AgpaCategory;

    @OneToOne(type => User)
    @JoinColumn()
    user: User;

    @Column({ comment: 'L\'agpa décerné' })
    award: AgpaAwardType;

    @OneToOne(type => User)
    @JoinColumn()
    photo: AgpaPhoto;
}
