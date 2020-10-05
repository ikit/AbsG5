import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ForumTopic } from "./ForumTopic";
import { Forum } from "./Forum";
import { User } from "./User";

@Entity()
export class ForumMessage {
    @PrimaryGeneratedColumn({ comment: "id" })
    id: number;
    
    @ManyToOne(() => Forum)
    forum: Forum;

    @ManyToOne(() => ForumTopic)
    topic: ForumTopic;
    
    @ManyToOne(() => User)
    poster: User;

    @Column({ comment: "Date du message" })
    datetime: Date;

    @Column({ comment: "Contenu du message", type: "text" })
    text: string;

    public constructor(data: any = null) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
