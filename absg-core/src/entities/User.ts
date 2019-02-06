import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Person } from './Person';

@Entity()
export class User {
    @PrimaryGeneratedColumn({ comment: 'user_id' })
    id: number;

    @OneToOne(type => Person)
    @JoinColumn()
    person: Person;

    @Column({ comment: 'display name of the user', unique: true })
    username: string;

    @Column({ comment: 'clean name of the user used for login' })
    usernameClean: string;

    @Column({ comment: 'hash of the user password', unique: true })
    passwordHash: string;

    @Column({ comment: 'Authentication token', nullable: true })
    token: string;

    @Column("json", { comment: 'users authorisations', nullable: true })
    acl: any;

    @Column("json", { comment: 'use to compute notifications for the user', nullable: true })
    lastActivity: any;
}
