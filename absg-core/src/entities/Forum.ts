import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Message } from "./Message";


@Entity()
export class Forum {
    @PrimaryGeneratedColumn({ comment: 'id' })
    id: number;
    
    @Column({ comment: 'Nom du forum' })
    name: string;
    
    @Column({ comment: 'Description du forum' })
    description: string;
    
    @Column({ comment: 'Est-ce que l\'accès au forum est privé' })
    private: boolean;
    
    @Column({ comment: 'Est-ce que le forum est archivé' })
    archived: boolean;
    
    @OneToOne(type => Message)
    @JoinColumn()
    lastMessage: Message;
}