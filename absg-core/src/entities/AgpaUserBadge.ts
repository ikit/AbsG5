import { Entity, Column, JoinColumn, Index, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

export enum BadgeType {
    voter = "voter",
    photographer = "photographer",
    combo = "combo"
}

export enum BadgeTiming {
    direct = "direct",
    progressive = "progressive"
}

@Entity()
@Index(["user", "year", "badgeName"], { unique: true })
@Index(["user", "year"])
@Index(["badgeType", "badgeTiming"])
export class AgpaUserBadge {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @Column({ comment: "Année d'attribution du badge", width: 4 })
    year: number;

    @Column({ length: 100, comment: "Nom du badge obtenu" })
    badgeName: string;

    @Column("enum", {
        enum: BadgeType,
        comment: "Type de badge: voter, photographer, combo"
    })
    badgeType: BadgeType;

    @Column("enum", {
        enum: BadgeTiming,
        comment: "Timing du badge: direct (année en cours) ou progressive (fenêtre glissante 3 ans)"
    })
    badgeTiming: BadgeTiming;

    @Column({ default: true, comment: "Indique si le badge est toujours actif" })
    isActive: boolean;

    @CreateDateColumn({ comment: "Date de calcul et d'attribution du badge" })
    computedAt: Date;

    @Column("jsonb", {
        nullable: true,
        comment: "Statistiques ayant permis l'obtention du badge (pour debug/transparence/explication)"
    })
    statsSnapshot: Record<string, any>;
}
