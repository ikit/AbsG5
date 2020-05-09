import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Forum } from "./Forum";
import { ForumMessage } from "./ForumMessage";

@Entity()
export class ForumTopic {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @ManyToOne(() => Forum)
    @JoinColumn()
    forum: Forum;

    @Column({ comment: "Nom de la discussion" })
    name: string;

    @OneToOne(() => ForumMessage)
    @JoinColumn()
    firstMessage: ForumMessage;

    @OneToOne(() => ForumMessage)
    @JoinColumn()
    lastMessage: ForumMessage;

    @Column({ comment: "Est-ce que la discussion est épinglée" })
    pinned: boolean;
}
