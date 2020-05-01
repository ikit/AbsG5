import { Entity, PrimaryColumn, Column } from "typeorm";
@Entity()
export class LegacyForum {
    @PrimaryColumn()
    forum_id: number;

    @Column({ nullable: true })
    parent_id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    private: number;

    @Column({ nullable: true })
    archived: number;

    @Column({ nullable: true })
    last_post_id: number;

    @Column({ nullable: true })
    last_post_time: number;
    
    @Column({ nullable: true })
    last_poster_name: string;

    @Column({ nullable: true })
    last_poster_id: number;
}
