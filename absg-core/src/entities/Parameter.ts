import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Parameter {
    @PrimaryColumn({ comment: "Identifiant unique du paramètre" })
    key: string;

    @Column("json", { comment: "valeur du paramètre", nullable: true })
    value: any;
}
