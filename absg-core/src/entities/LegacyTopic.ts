import { Entity, PrimaryColumn, Column } from "typeorm";
@Entity()
export class LegacyTopics {
    @PrimaryColumn()
    topic_id: number;

    @Column({ nullable: true })
    forum_id: number;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    first_post_id: number;

    @Column({ nullable: true })
    first_post_time: number;

    @Column({ nullable: true })
    first_poster_id: number;

    @Column({ nullable: true })
    first_poster_name: string;

    @Column({ nullable: true })
    last_post_id: number;

    @Column({ nullable: true })
    last_post_time: number;

    @Column({ nullable: true })
    last_poster_id: number;

    @Column({ nullable: true })
    last_poster_name: string;

    @Column({ nullable: true })
    replies: number;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    old_type: number;

    @Column({ nullable: true })
    poll_title: string;
}
