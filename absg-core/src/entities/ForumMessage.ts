import { Entity, PrimaryGeneratedColumn, JoinColumn, Column, ManyToOne } from "typeorm";
import { ForumTopic } from "./ForumTopic";
import { Forum } from "./Forum";
import { User } from "./User";

@Entity()
export class ForumMessage {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;
    
    @ManyToOne(() => Forum)
    @JoinColumn()
    forum: Forum;

    @ManyToOne(() => ForumTopic)
    @JoinColumn()
    topic: ForumTopic;
    
    @ManyToOne(() => User)
    @JoinColumn()
    poster: User;

    @Column({ comment: "Date du message" })
    datetime: Date;

    @Column({ comment: "Contenu du message", type: "text" })
    text: string;
}
