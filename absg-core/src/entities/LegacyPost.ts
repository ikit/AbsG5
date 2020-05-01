import { Entity, PrimaryColumn, Column } from "typeorm";
@Entity()
export class LegacyPosts {
    @PrimaryColumn()
    post_id: number;
    
    @Column({ nullable: true })
    topic_id: number;
    
    @Column({ nullable: true })
    forum_id: number;
    
    @Column({ nullable: true })
    poster_id: number;
    
    @Column({ nullable: true })
    time: number;

    @Column({ nullable: true })
    text: string;
    
    @Column({ nullable: true })
    attachment: number;
}
