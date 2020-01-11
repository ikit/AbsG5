import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class LogPassag {
    @PrimaryColumn({ comment: "Date du passage (au maximum 1/heure)" })
    datetime: Date;

    @PrimaryColumn({ comment: "L'utilisateur concernée par le log" })
    userId: number;
}
