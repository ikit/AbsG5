import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, ManyToOne } from "typeorm";
import { Discussion } from "./Discussion";


// fait le lien entre une mission et un vehicule
@Entity()
export class Message {
    @PrimaryGeneratedColumn({ comment: 'id' })
    id: number;
    
    @OneToOne(type => Discussion)
    @JoinColumn()
    discussion: Discussion;
    
    @Column({ comment: 'Contenu du message', type: 'text' })
    message: string;
    
    @Column({ comment: 'Date du message' })
    datetime: Date;

    // TODO: attachment ? (file, pool, agpa photo, calendar, etc...)

}
