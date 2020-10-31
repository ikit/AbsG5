import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum LogSeverity {
    emerg = "emerg",
    alert = "alert",
    crit = "crit",
    error = "error", // erreur système (visible par les admins)
    warning = "warning", // warning système (visible par les admins)
    notice = "notice", // info publique (vue par les user ==> notifications)
    info = "info", // info systeme (visible par les admins)
    debug = "debug" // debug mode only
}
export enum LogModule {
    absg = "absg",
    citations = "citations",
    photos = "photos",
    agenda = "agenda",
    event = "event",
    agpa = "agpa"
}

@Entity()
export class LogSystem {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number; // identifiant unique du log

    @Column({ comment: "Qui est à l'origine du log", nullable: true })
    userId: number;

    @Column({ comment: "Date d'émission du log" })
    datetime: Date;

    @Column({ comment: "Sévérité du log respectant la RFC Syslog", default: "info" })
    severity: LogSeverity;

    @Column({ comment: "Identifiant du module à l'origine du log", default: "absg" })
    module: LogModule;

    @Column({ comment: "Message du log" })
    message: string;

    @Column("json", { comment: "Méta-donnée attachée au log", nullable: true })
    data: any;
}
