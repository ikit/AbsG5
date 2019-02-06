import { Entity, Column, OneToOne, JoinColumn, Index, PrimaryGeneratedColumn } from "typeorm";
import { AgpaCategory } from "./AgpaCategory";
import { AgpaPhoto } from "./AgpaPhoto";
import { User } from "./User";

@Entity()
@Index(["year", "category", "user", "photo"], { unique: true })
export class AgpaVote {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ comment: 'Année de la photo', width: 4 })
    year: number;
    
    @OneToOne(type => AgpaCategory)
    @JoinColumn()
    category: AgpaCategory;
    
    @OneToOne(type => User)
    @JoinColumn()
    user: User;
    
    @OneToOne(type => AgpaPhoto)
    @JoinColumn()
    photo: AgpaPhoto;
    
    @Column({ comment: 'Vote attribué à la photo', width: 1 })
    score: number;
}