import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class PassaG {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @Column({ comment: "Date et heure de passage sur le site" })
    date: Date;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @Column("json", { comment: `Données sur les actions réalisées` })
    data: any;
}
