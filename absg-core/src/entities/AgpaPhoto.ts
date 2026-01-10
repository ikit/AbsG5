import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { AgpaCategory } from "./AgpaCategory";
import { User } from "./User";

// liste des véhicules attendus pour la mission
@Entity()
export class AgpaPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @ManyToOne(() => AgpaCategory)
    @JoinColumn()
    category: AgpaCategory;

    @Column({ comment: "Année de la photo" })
    year: number;

    @Column({ comment: "Nom du fichier", length: 20 })
    filename: string;

    @Column({ comment: "Titre de la photo" })
    title: string;

    @Column({ comment: "Numéro de la photo (ordre d'affichage lors du vote)", nullable: true })
    number: number;

    @Column({ comment: "Nombre de votes reçu par la photo", nullable: true })
    votes: number;

    @Column({ comment: "Nombre de votes reçu par le titre de la photo", nullable: true })
    votesTitle: number;

    @Column({ comment: "Score brut obtenu (somme des points des votes)", nullable: true })
    score: number;

    // ========== Scores V2010 (algorithme historique) ==========
    @Column({ comment: "Score homogénéisé V2010 (Note G)", nullable: true })
    scoreV2010: number;

    @Column({ comment: "Classement V2010 (toutes catégories confondues)", nullable: true })
    rankingV2010: number;

    // ========== Scores V2026 (nouvel algorithme) ==========
    @Column({ comment: "Score homogénéisé V2026", nullable: true })
    scoreV2026: number;

    @Column({ comment: "Classement V2026 (toutes catégories confondues)", nullable: true })
    rankingV2026: number;

    // ========== Métadonnées ==========
    @Column("json", { comment: "Erreur disqualifiant la photo", nullable: true })
    error: any;

    @Column("json", {
        comment: "Détails des calculs par algorithme (pour transparence/debug)",
        nullable: true
    })
    scoreDetails: {
        v2010?: {
            scoreNote: number;      // Composante points du score
            votesNote: number;      // Composante votes du score
            catTotalPhotos: number; // Nb photos dans la catégorie
            catScoresSum: number;   // Total points distribués dans la catégorie
            catVotesSum: number;    // Total votes distribués dans la catégorie
            calculatedAt: string;
        };
        v2026?: {
            gueudelot: { votes: number; points: number; rank: number };
            guibert: { votes: number; points: number; rank: number };
            guyomard: { votes: number; points: number; rank: number };
            avgRank: number;        // Rang moyen des 3 familles
            rankMin: number;        // Meilleur rang moyen de la catégorie
            rankMax: number;        // Pire rang moyen de la catégorie
            rankInCategory: number; // Classement dans la catégorie (1 = 1er)
            calculatedAt: string;
        };
    };

    // Transient properties
    awards: Map<number, string> = null; // catId => award
    categoryId: number;

    public fromJSON(json: any) {
        this.id = json.id ? json.id : null;
        this.year = json.year ? json.year : null;
        this.filename = json.filename ? json.filename : null;
        this.title = json.title ? json.title : null;
        this.number = json.number ? json.number : null;
        this.votes = json.votes ? json.votes : null;
        this.votesTitle = json.votesTitle ? json.votesTitle : null;
        this.score = json.score ? json.score : null;
        // Scores V2010 (rétrocompatibilité avec ancien champ gscore/ranking)
        this.scoreV2010 = json.scoreV2010 ?? json.gscore ?? null;
        this.rankingV2010 = json.rankingV2010 ?? json.ranking ?? null;
        // Scores V2026
        this.scoreV2026 = json.scoreV2026 ?? null;
        this.rankingV2026 = json.rankingV2026 ?? null;
        this.error = json.error ? json.error : null;
        this.scoreDetails = json.scoreDetails ?? null;

        if (json.user) {
            const user = new User();
            user.fromJSON(json.user);
            this.user = user;
        } else if (json.username) {
            const user = new User();
            user.id = json.userId;
            user.username = json.username;
            this.user = user;
        }
        if (json.category) {
            const category = new AgpaCategory();
            category.fromJSON(json.category);
            this.category = category;
            this.categoryId = category.id;
        } else if (json.categoryId) {
            this.categoryId = json.categoryId;
        }

        this.awards = new Map<number, string>();
        if (json.award && json.awardCategory) {
            this.awards.set(json.awardCategory, json.award);
        }
    }
}
