import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { AgpaCategory } from "./AgpaCategory";
import { User } from "./User";

// liste des véhicules attendus pour la mission
@Entity()
export class AgpaPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User)
    @JoinColumn()
    user: User;

    @ManyToOne(type => AgpaCategory)
    @JoinColumn()
    category: AgpaCategory;

    @Column({ comment: "Année de la photo" })
    year: number;

    @Column({ comment: "Nom du fichier", length: 20 })
    filename: string;

    @Column({ comment: "Titre de la photo" })
    title: string;

    @Column({ comment: "Classement de la photo" })
    ranking: number;

    @Column({ comment: "Numéro de la photo" })
    number: number;

    @Column({ comment: "Nombre de votes reçu par la photo" })
    votes: number;

    @Column({ comment: "Nombre de votes reçu par le titre la photo" })
    votesTitle: number;

    @Column({ comment: "Score obtenu par la photo" })
    score: number;

    @Column({ comment: "Score homogonéisé obtenu par la photo" })
    gscore: number;

    @Column("json", { comment: "Erreur disqualifiant la photo", nullable: true })
    error: any;

    // Transient properties
    awards: Map<number, string> = null; // catId => award
    categoryId: number;

    public fromJSON(json: any) {
        this.id = json.id ? json.id : null;
        this.year = json.year ? json.year : null;
        this.filename = json.filename ? json.filename : null;
        this.title = json.title ? json.title : null;
        this.ranking = json.ranking ? json.ranking : null;
        this.number = json.number ? json.number : null;
        this.votes = json.votes ? json.votes : null;
        this.votesTitle = json.votesTitle ? json.votesTitle : null;
        this.score = json.score ? json.score : null;
        this.gscore = json.gscore ? json.gscore : null;
        this.error = json.error ? json.error : null;

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
