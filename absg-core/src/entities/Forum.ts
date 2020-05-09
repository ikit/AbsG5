import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { ForumMessage } from "./ForumMessage";

@Entity()
export class Forum {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    
    @Column()
    description: string;

    @OneToOne(() => ForumMessage)
    @JoinColumn()
    firstMessage: ForumMessage;

    @OneToOne(() => ForumMessage)
    @JoinColumn()
    lastMessage: ForumMessage;

    @Column({ comment: "Est-ce que le forum est archivé", default: false })
    archived: boolean;
}
