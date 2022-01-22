import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from ".";
import { GThequeCollection } from "./GThequeCollection";


@Entity()
export class GTheque {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => GThequeCollection)
    @JoinColumn()
    collection: GThequeCollection;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @Column("json", { comment: "Les infos décrivant la collection de l'utilisateur" })
    data: any[];
}