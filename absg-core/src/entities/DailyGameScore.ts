import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { User } from "./User";

@Entity({ name: "daily_game_score" })
@Index(["userId", "gameType", "date"], { unique: true })
export class DailyGameScore {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "user_id" })
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "game_type", length: 50 })
    gameType: "sudoku" | "wiki_mystery";

    @Column({ type: "date" })
    date: string;

    @Column({ default: false })
    completed: boolean;

    @Column({ name: "attempts", default: 0 })
    attempts: number;

    @Column({ name: "hints_used", default: 0 })
    hintsUsed: number;

    @Column({ name: "completed_at", nullable: true })
    completedAt: Date;
}
