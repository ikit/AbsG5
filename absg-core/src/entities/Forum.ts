import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Forum {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ comment: "Nom du forum" })
    name: string;

    @Column({ comment: "Est-ce que le forum est archivé", default: false })
    archived: boolean;
}
