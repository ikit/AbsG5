import { Entity, OneToOne, Column, JoinColumn, PrimaryColumn, Index, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
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

    @ManyToOne(type => AgpaCategory)
    @JoinColumn()
    category: AgpaCategory;

    @ManyToOne(type => User)
    @JoinColumn()
    user: User;

    @Column("enum", { enum: ['honor', 'nominated', 'bronze', 'sylver', 'gold', 'diamond'], comment: `'L\'agpa décerné` })
    award: AgpaAwardType;

    @ManyToOne(type => AgpaPhoto)
    @JoinColumn()
    photo: AgpaPhoto;
}
