import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";

export enum LogSeverity {
    panic,
    alert,
    critical,
    error,
    warning,
    notice,
    info,
    debug
}

@Entity()
export class LogSystem {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @Column({ comment: "Date d'émission du log" })
    datetime: Date;

    @Column({ comment: "Sévérité du log respectant la RFC Syslog", default: 6 })
    severity: LogSeverity;

    @Column({ comment: "Identifiant du module à l'origine du log" })
    module: string;

    @Column({ comment: "Id / Code Error code si nécessaire", nullable: true })
    messageId: string;

    @Column({ comment: "Message du log" })
    message: string;

    @Column("json", { comment: "Méta-donnée attachée au log", nullable: true })
    data: any;
}
