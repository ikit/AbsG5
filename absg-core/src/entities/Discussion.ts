import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Forum } from "./Forum";
import { Message } from "./Message";

export enum DiscussionType {
    thread,
    important
}

@Entity()
export class Discussion {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @OneToOne(type => Forum)
    @JoinColumn()
    forum: Forum;

    @Column({ comment: "Nom de la discussion" })
    name: string;

    @OneToOne(type => Message)
    @JoinColumn()
    firstMessage: Message;

    @OneToOne(type => Message)
    @JoinColumn()
    lastMessage: Message;

    @Column({ comment: "Nombre de réponse" })
    replies: number;

    @Column({ comment: "Est-ce que la discussion est épinglée" })
    pinned: boolean;
}
