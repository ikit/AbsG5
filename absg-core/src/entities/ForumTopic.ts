import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Forum } from "./Forum";
import { ForumMessage } from "./ForumMessage";

@Entity()
export class ForumTopic {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;

    @ManyToOne(() => Forum)
    forum: Forum;

    @Column({ comment: "Nom de la discussion" })
    name: string;

    @ManyToOne(() => ForumMessage)
    firstMessage: ForumMessage;

    @ManyToOne(() => ForumMessage)
    lastMessage: ForumMessage;

    @Column({ comment: "Est-ce que la discussion est épinglée" })
    pinned: boolean;
}
