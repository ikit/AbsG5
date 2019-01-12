import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export enum LogType {
    panic,
    alert,
    critical,
    error,
    warning,
    notice,
    info,
    debug
};


@Entity()
export class Log {

    @PrimaryGeneratedColumn({ comment: 'id' })
    id: number;
    
    @OneToOne(type => User)
    @JoinColumn()
    user: User;
    
    @Column({ comment: 'Date d\'émission du log' })
    datetime: Date;
    
    @Column({ comment: 'Type du log respectant la RFC Syslog' })
    type: LogType;
    
    @Column({ comment: 'Identifiant du module à l\'origine du log' })
    module: string;

    @Column({ comment: 'Id / Code Error code si nécessaire', nullable: true })
    messageId: string;
    
    @Column({ comment: 'Message du log' })
    message: string;
    
    @Column("json", { comment: 'Méta-donnée attachée au log', nullable: true })
    data: any;



}