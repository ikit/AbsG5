# AGPA - Proposition Architecture Multi-Algorithmes (V2010 / V2026)

## Objectif

Permettre de calculer et conserver les résultats du palmarès AGPA avec deux méthodes de calcul différentes :
- **V2010** : Algorithme actuel (historique, depuis 2008)
- **V2026** : Nouvel algorithme (à définir)

Les deux méthodes doivent pouvoir coexister et être consultables en parallèle.

---

## 1. Modifications du Modèle de Données

### 1.1 Nouvelle Enumération : AlgorithmVersion

```typescript
// absg-core/src/entities/AgpaAlgorithmVersion.ts

export enum AgpaAlgorithmVersion {
    V2010 = "v2010",  // Algorithme historique
    V2026 = "v2026"   // Nouvel algorithme
}
```

### 1.2 Modification de l'Entité AgpaAward

Ajouter une colonne pour identifier la version de l'algorithme :

```typescript
// absg-core/src/entities/AgpaAward.ts

import { Entity, Column, JoinColumn, Index, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { AgpaCategory } from "./AgpaCategory";
import { AgpaPhoto } from "./AgpaPhoto";
import { User } from "./User";
import { AgpaAlgorithmVersion } from "./AgpaAlgorithmVersion";

export enum AgpaAwardType {
    honor = "honor",
    nominated = "nominated",
    bronze = "bronze",
    sylver = "sylver",
    gold = "gold",
    diamond = "diamond"
}

@Entity()
@Index(["year", "category", "user", "award", "algorithmVersion"], { unique: true })
export class AgpaAward {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ comment: "Année d'attribution de l'agpa", width: 4 })
    year: number;

    @ManyToOne(() => AgpaCategory)
    @JoinColumn()
    category: AgpaCategory;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @Column("enum", {
        enum: ["honor", "nominated", "bronze", "sylver", "gold", "diamond"],
        comment: `L'agpa décerné`
    })
    award: AgpaAwardType;

    @ManyToOne(() => AgpaPhoto)
    @JoinColumn()
    photo: AgpaPhoto;

    // NOUVEAU: Version de l'algorithme utilisé
    @Column("enum", {
        enum: AgpaAlgorithmVersion,
        default: AgpaAlgorithmVersion.V2010,
        comment: "Version de l'algorithme de calcul"
    })
    algorithmVersion: AgpaAlgorithmVersion;
}
```

### 1.3 Modification de l'Entité AgpaPhoto (scores multi-versions)

On ajoute des colonnes dédiées pour chaque version d'algorithme (accès direct) + un champ JSON pour les détails de calcul :

```typescript
// absg-core/src/entities/AgpaPhoto.ts (modification)

// Champs communs (indépendants de l'algorithme)
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

// ========== Détails de calcul (pour transparence/debug) ==========
@Column("json", {
    comment: "Détails des calculs par algorithme",
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
        // À définir selon le nouvel algorithme
        calculatedAt: string;
        [key: string]: any;
    };
};
```

**Avantages de cette approche :**
- Accès direct aux scores/rankings sans parser de JSON
- Facilité de tri et filtrage SQL (`ORDER BY scoreV2010 DESC`)
- Détails de calcul disponibles pour transparence
- Les anciens champs `gscore` et `ranking` sont renommés en `scoreV2010` et `rankingV2010`

**Migration SQL :**
```sql
-- Renommer les colonnes existantes
ALTER TABLE agpa_photo RENAME COLUMN gscore TO "scoreV2010";
ALTER TABLE agpa_photo RENAME COLUMN ranking TO "rankingV2010";

-- Ajouter les nouvelles colonnes V2026
ALTER TABLE agpa_photo ADD COLUMN "scoreV2026" INTEGER;
ALTER TABLE agpa_photo ADD COLUMN "rankingV2026" INTEGER;

-- Ajouter le champ JSON pour les détails
ALTER TABLE agpa_photo ADD COLUMN "scoreDetails" JSONB;
```

### 1.4 Nouvelle Entité : AgpaPalmaresEntry

Stocker le palmarès précalculé pour chaque version :

```typescript
// absg-core/src/entities/AgpaPalmaresEntry.ts

import { Entity, Column, JoinColumn, Index, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { AgpaAlgorithmVersion } from "./AgpaAlgorithmVersion";

@Entity()
@Index(["user", "yearFrom", "yearTo", "algorithmVersion"], { unique: true })
export class AgpaPalmaresEntry {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @Column({ comment: "Année de début de la période" })
    yearFrom: number;

    @Column({ comment: "Année de fin de la période" })
    yearTo: number;

    @Column("enum", {
        enum: AgpaAlgorithmVersion,
        comment: "Version de l'algorithme de calcul"
    })
    algorithmVersion: AgpaAlgorithmVersion;

    @Column({ comment: "Position au classement" })
    rank: number;

    @Column({ comment: "Total de points palmarès" })
    totalPoints: number;

    @Column("json", { comment: "Détail des récompenses" })
    awards: {
        total: number;
        diamond: number;
        gold: number;
        sylver: number;
        bronze: number;
        nominated: number;
        honor: number;
    };

    @Column("json", { comment: "Stats par catégories", nullable: true })
    statsByCategories: any;

    @Column("json", { comment: "Stats par années", nullable: true })
    statsByYears: any;

    @Column("json", { comment: "Données de participation", nullable: true })
    participation: {
        total: number;
        first: number;
        last: number;
    };

    @Column({ comment: "Date du calcul" })
    calculatedAt: Date;
}
```

### 1.5 Schéma de Migration SQL

```sql
-- Migration: Add algorithm version support

-- 1. Ajouter la colonne algorithmVersion à agpa_award
ALTER TABLE agpa_award
ADD COLUMN "algorithmVersion" VARCHAR(10) DEFAULT 'v2010';

-- 2. Mettre à jour l'index unique
DROP INDEX IF EXISTS "IDX_agpa_award_unique";
CREATE UNIQUE INDEX "IDX_agpa_award_unique"
ON agpa_award (year, "categoryId", "userId", award, "algorithmVersion");

-- 3. Renommer les colonnes existantes de agpa_photo
ALTER TABLE agpa_photo RENAME COLUMN gscore TO "scoreV2010";
ALTER TABLE agpa_photo RENAME COLUMN ranking TO "rankingV2010";

-- 4. Ajouter les nouvelles colonnes V2026 et scoreDetails
ALTER TABLE agpa_photo ADD COLUMN "scoreV2026" INTEGER;
ALTER TABLE agpa_photo ADD COLUMN "rankingV2026" INTEGER;
ALTER TABLE agpa_photo ADD COLUMN "scoreDetails" JSONB;

-- 5. Créer la table agpa_palmares_entry (optionnel, pour cache)
CREATE TABLE agpa_palmares_entry (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "user"(id),
    "yearFrom" INTEGER NOT NULL,
    "yearTo" INTEGER NOT NULL,
    "algorithmVersion" VARCHAR(10) NOT NULL,
    rank INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    awards JSONB NOT NULL,
    "statsByCategories" JSONB,
    "statsByYears" JSONB,
    participation JSONB,
    "calculatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE ("userId", "yearFrom", "yearTo", "algorithmVersion")
);

-- 6. Migrer les awards existants vers V2010
UPDATE agpa_award SET "algorithmVersion" = 'v2010' WHERE "algorithmVersion" IS NULL;
```

---

## 2. Architecture du Code Backend

### 2.1 Interface de l'Algorithme

Créer une interface commune pour tous les algorithmes :

```typescript
// absg-core/src/middleware/agpaAlgorithms/IAgpaAlgorithm.ts

import { AgpaAlgorithmVersion } from "../../entities/AgpaAlgorithmVersion";

export interface PhotoScore {
    photoId: number;
    votes: number;
    votesTitle: number;
    score: number;
    gscore: number;
    ranking: number;
    calculationDetails?: any;
}

export interface AwardAttribution {
    userId: number;
    categoryId: number;
    photoId?: number;
    award: string;
}

export interface AlgorithmContext {
    year: number;
    categories: Map<number, any>;
    photos: Map<number, any>;
    users: Map<number, any>;
    votes: any[];
}

export interface IAgpaAlgorithm {
    version: AgpaAlgorithmVersion;
    name: string;
    description: string;

    // Étape 1: Vérification des votes
    checkVotes(ctx: AlgorithmContext): Promise<AlgorithmContext>;

    // Étape 2: Calcul des notes
    computeScores(ctx: AlgorithmContext): Promise<PhotoScore[]>;

    // Étape 3: Attribution des récompenses
    attributeAwards(ctx: AlgorithmContext): Promise<AwardAttribution[]>;

    // Étape 4: Attribution des diamants
    attributeDiamonds(ctx: AlgorithmContext): Promise<AwardAttribution[]>;

    // Étape 5: Attribution des honneurs
    attributeHonors(ctx: AlgorithmContext): Promise<AwardAttribution[]>;

    // Calcul des points palmarès
    palmaresPoints(award: string): number;
}
```

### 2.2 Implémentation V2010 (Algorithme Actuel)

Refactoriser le code existant pour implémenter l'interface :

```typescript
// absg-core/src/middleware/agpaAlgorithms/AgpaAlgorithmV2010.ts

import { IAgpaAlgorithm, AlgorithmContext, PhotoScore, AwardAttribution } from "./IAgpaAlgorithm";
import { AgpaAlgorithmVersion } from "../../entities/AgpaAlgorithmVersion";
import { AgpaAwardType } from "../../entities";

export class AgpaAlgorithmV2010 implements IAgpaAlgorithm {
    version = AgpaAlgorithmVersion.V2010;
    name = "Algorithme V2010";
    description = "Algorithme historique basé sur le règlement 2008-2010";

    // Coefficients de calcul de la Note G
    private readonly SCORE_COEF = 9990.00999001;  // 10^7/1001
    private readonly VOTES_COEF = 9.99000999001;  // 10^4/1001

    async checkVotes(ctx: AlgorithmContext): Promise<AlgorithmContext> {
        // Code existant de p4CheckVotes refactorisé
        // ... (reprendre le code de agpaAlgorithmsHelper.ts)
        return ctx;
    }

    async computeScores(ctx: AlgorithmContext): Promise<PhotoScore[]> {
        const scores: PhotoScore[] = [];

        // Phase 1: Agrégation des votes
        for (const [catId, category] of ctx.categories) {
            if (catId <= 0 && catId !== -3) continue;

            category.judgesNumber = 0;
            category.scoresSum = 0;
            category.votesSum = 0;

            for (const voterStats of category.votes || []) {
                if (!voterStats.valid) continue;

                category.judgesNumber += 1;
                for (const vote of voterStats.votes) {
                    const photo = ctx.photos.get(vote.photoId);
                    if (!photo) continue;

                    if (catId === -3) {
                        photo.votesTitle = (photo.votesTitle || 0) + 1;
                    } else {
                        photo.votes = (photo.votes || 0) + 1;
                        photo.score = (photo.score || 0) + vote.score;
                        category.scoresSum += vote.score;
                        category.votesSum += 1;
                    }
                }
            }
        }

        // Phase 2: Calcul de la Note G
        for (const [photoId, photo] of ctx.photos) {
            const cat = ctx.categories.get(photo.categoryId);
            if (!cat || cat.scoresSum === 0 || cat.votesSum === 0) {
                scores.push({
                    photoId,
                    votes: photo.votes || 0,
                    votesTitle: photo.votesTitle || 0,
                    score: photo.score || 0,
                    gscore: 0,
                    ranking: 0,
                    calculationDetails: { error: "No votes in category" }
                });
                continue;
            }

            const scoreNote = (photo.score || 0) * (cat.totalPhotos / cat.scoresSum) * this.SCORE_COEF;
            const votesScore = (photo.votes || 0) * (cat.totalPhotos / cat.votesSum) * this.VOTES_COEF;
            const gscore = Math.round(scoreNote + votesScore);

            scores.push({
                photoId,
                votes: photo.votes || 0,
                votesTitle: photo.votesTitle || 0,
                score: photo.score || 0,
                gscore,
                ranking: 0,
                calculationDetails: {
                    scoreNote: Math.round(scoreNote),
                    votesScore: Math.round(votesScore),
                    catTotalPhotos: cat.totalPhotos,
                    catScoresSum: cat.scoresSum,
                    catVotesSum: cat.votesSum
                }
            });
        }

        // Tri et attribution du ranking
        scores.sort((a, b) => b.gscore - a.gscore);
        scores.forEach((s, idx) => s.ranking = idx + 1);

        return scores;
    }

    async attributeAwards(ctx: AlgorithmContext): Promise<AwardAttribution[]> {
        // Code existant de p4AgpaAttribution refactorisé
        // ...
        return [];
    }

    async attributeDiamonds(ctx: AlgorithmContext): Promise<AwardAttribution[]> {
        // Code existant de p4DiamondAttribution refactorisé
        // ...
        return [];
    }

    async attributeHonors(ctx: AlgorithmContext): Promise<AwardAttribution[]> {
        // Code existant de p4HonorAttribution refactorisé
        // ...
        return [];
    }

    palmaresPoints(award: string): number {
        switch (award) {
            case AgpaAwardType.diamond: return 5;
            case AgpaAwardType.gold: return 4;
            case AgpaAwardType.sylver: return 3;
            case AgpaAwardType.bronze: return 2;
            case AgpaAwardType.nominated: return 1;
            default: return 0;
        }
    }
}
```

### 2.3 Implémentation V2026 (Nouvel Algorithme)

Template pour le nouvel algorithme à définir :

```typescript
// absg-core/src/middleware/agpaAlgorithms/AgpaAlgorithmV2026.ts

import { IAgpaAlgorithm, AlgorithmContext, PhotoScore, AwardAttribution } from "./IAgpaAlgorithm";
import { AgpaAlgorithmVersion } from "../../entities/AgpaAlgorithmVersion";

export class AgpaAlgorithmV2026 implements IAgpaAlgorithm {
    version = AgpaAlgorithmVersion.V2026;
    name = "Algorithme V2026";
    description = "Nouvel algorithme de calcul des AGPA";

    // TODO: Définir les nouveaux coefficients/paramètres
    // private readonly NEW_PARAM = ...;

    async checkVotes(ctx: AlgorithmContext): Promise<AlgorithmContext> {
        // TODO: Implémenter les nouvelles règles de validation des votes
        // Possibilités:
        // - Nouveaux seuils min/max
        // - Nouvelles règles d'éligibilité
        // - Pondération différente selon l'âge/expérience
        return ctx;
    }

    async computeScores(ctx: AlgorithmContext): Promise<PhotoScore[]> {
        // TODO: Implémenter le nouveau calcul de score
        // Possibilités:
        // - Nouvelle formule de Note G
        // - Prise en compte de nouveaux critères
        // - Système de bonus/malus
        // - Normalisation différente
        return [];
    }

    async attributeAwards(ctx: AlgorithmContext): Promise<AwardAttribution[]> {
        // TODO: Implémenter les nouvelles règles d'attribution
        // Possibilités:
        // - Nouveaux types de récompenses
        // - Nouvelles règles de départage
        // - Quotas différents
        return [];
    }

    async attributeDiamonds(ctx: AlgorithmContext): Promise<AwardAttribution[]> {
        // TODO: Implémenter les nouvelles conditions pour le diamant
        return [];
    }

    async attributeHonors(ctx: AlgorithmContext): Promise<AwardAttribution[]> {
        // TODO: Implémenter les nouvelles règles d'honneur
        return [];
    }

    palmaresPoints(award: string): number {
        // TODO: Définir le nouveau barème de points
        // Possibilité de barème différent du V2010
        return 0;
    }
}
```

### 2.4 Factory et Registry des Algorithmes

```typescript
// absg-core/src/middleware/agpaAlgorithms/AgpaAlgorithmFactory.ts

import { IAgpaAlgorithm } from "./IAgpaAlgorithm";
import { AgpaAlgorithmVersion } from "../../entities/AgpaAlgorithmVersion";
import { AgpaAlgorithmV2010 } from "./AgpaAlgorithmV2010";
import { AgpaAlgorithmV2026 } from "./AgpaAlgorithmV2026";

class AgpaAlgorithmFactory {
    private algorithms: Map<AgpaAlgorithmVersion, IAgpaAlgorithm> = new Map();

    constructor() {
        // Enregistrer les algorithmes disponibles
        this.register(new AgpaAlgorithmV2010());
        this.register(new AgpaAlgorithmV2026());
    }

    register(algorithm: IAgpaAlgorithm): void {
        this.algorithms.set(algorithm.version, algorithm);
    }

    get(version: AgpaAlgorithmVersion): IAgpaAlgorithm {
        const algorithm = this.algorithms.get(version);
        if (!algorithm) {
            throw new Error(`Algorithm version ${version} not found`);
        }
        return algorithm;
    }

    getAll(): IAgpaAlgorithm[] {
        return Array.from(this.algorithms.values());
    }

    getAvailableVersions(): AgpaAlgorithmVersion[] {
        return Array.from(this.algorithms.keys());
    }
}

export const algorithmFactory = new AgpaAlgorithmFactory();
```

### 2.5 Service de Calcul Multi-Algorithmes

```typescript
// absg-core/src/services/AgpaCalculationService.ts

import { AgpaAlgorithmVersion } from "../entities/AgpaAlgorithmVersion";
import { AgpaPhotoScore, AgpaPalmaresEntry, AgpaAward } from "../entities";
import { algorithmFactory } from "../middleware/agpaAlgorithms/AgpaAlgorithmFactory";
import { getRepository } from "../middleware/database";
import { getMetaData } from "../middleware/agpaCommonHelpers";

class AgpaCalculationService {
    /**
     * Calcule les résultats d'une édition avec un algorithme spécifique
     */
    async calculateEdition(year: number, version: AgpaAlgorithmVersion): Promise<{
        scores: any[];
        awards: any[];
    }> {
        const algorithm = algorithmFactory.get(version);

        // Récupérer le contexte de l'édition
        let ctx = await getMetaData(year, true);

        // Exécuter le pipeline de calcul
        ctx = await algorithm.checkVotes(ctx);
        const scores = await algorithm.computeScores(ctx);
        let awards = await algorithm.attributeAwards(ctx);
        const diamonds = await algorithm.attributeDiamonds(ctx);
        const honors = await algorithm.attributeHonors(ctx);

        awards = [...awards, ...diamonds, ...honors];

        return { scores, awards };
    }

    /**
     * Sauvegarde les scores calculés pour une version
     */
    async saveScores(year: number, version: AgpaAlgorithmVersion, scores: any[]): Promise<void> {
        const repo = getRepository(AgpaPhotoScore);

        for (const score of scores) {
            await repo.upsert({
                photoId: score.photoId,
                algorithmVersion: version,
                votes: score.votes,
                votesTitle: score.votesTitle,
                score: score.score,
                gscore: score.gscore,
                ranking: score.ranking,
                calculationDetails: score.calculationDetails,
                calculatedAt: new Date()
            }, ["photoId", "algorithmVersion"]);
        }
    }

    /**
     * Sauvegarde les awards calculés pour une version
     */
    async saveAwards(year: number, version: AgpaAlgorithmVersion, awards: any[]): Promise<void> {
        const repo = getRepository(AgpaAward);

        // Supprimer les awards existants pour cette version/année
        await repo.delete({ year, algorithmVersion: version });

        // Insérer les nouveaux awards
        for (const award of awards) {
            await repo.save({
                year,
                categoryId: award.categoryId,
                userId: award.userId,
                photoId: award.photoId,
                award: award.award,
                algorithmVersion: version
            });
        }
    }

    /**
     * Calcule et sauvegarde le palmarès pour une période et version
     */
    async calculatePalmares(
        yearFrom: number,
        yearTo: number,
        version: AgpaAlgorithmVersion
    ): Promise<AgpaPalmaresEntry[]> {
        const algorithm = algorithmFactory.get(version);
        const awardRepo = getRepository(AgpaAward);
        const palmaresRepo = getRepository(AgpaPalmaresEntry);

        // Récupérer les awards de la période pour cette version
        const awards = await awardRepo.find({
            where: {
                algorithmVersion: version
            },
            relations: ["user", "category", "photo"]
        });

        // Filtrer par période
        const periodAwards = awards.filter(a => a.year >= yearFrom && a.year <= yearTo);

        // Agréger par utilisateur
        const userStats = new Map<number, any>();

        for (const award of periodAwards) {
            if (!userStats.has(award.user.id)) {
                userStats.set(award.user.id, {
                    userId: award.user.id,
                    username: award.user.username,
                    totalPoints: 0,
                    awards: { total: 0, diamond: 0, gold: 0, sylver: 0, bronze: 0, nominated: 0, honor: 0 },
                    statsByYears: {},
                    statsByCategories: {}
                });
            }

            const stats = userStats.get(award.user.id);
            const points = algorithm.palmaresPoints(award.award);

            stats.totalPoints += points;
            stats.awards[award.award] = (stats.awards[award.award] || 0) + 1;
            if (!['nominated', 'honor'].includes(award.award)) {
                stats.awards.total += 1;
            }
        }

        // Trier par points et attribuer le rang
        const sorted = Array.from(userStats.values())
            .sort((a, b) => b.totalPoints - a.totalPoints);

        // Sauvegarder
        const entries: AgpaPalmaresEntry[] = [];
        for (let i = 0; i < sorted.length; i++) {
            const entry = await palmaresRepo.save({
                userId: sorted[i].userId,
                yearFrom,
                yearTo,
                algorithmVersion: version,
                rank: i + 1,
                totalPoints: sorted[i].totalPoints,
                awards: sorted[i].awards,
                statsByCategories: sorted[i].statsByCategories,
                statsByYears: sorted[i].statsByYears,
                calculatedAt: new Date()
            });
            entries.push(entry);
        }

        return entries;
    }

    /**
     * Compare les résultats entre deux versions d'algorithme
     */
    async compareVersions(
        year: number,
        version1: AgpaAlgorithmVersion,
        version2: AgpaAlgorithmVersion
    ): Promise<{
        scoreDifferences: any[];
        rankingChanges: any[];
        awardDifferences: any[];
    }> {
        const scoreRepo = getRepository(AgpaPhotoScore);

        const scores1 = await scoreRepo.find({
            where: { algorithmVersion: version1 },
            relations: ["photo"]
        });
        const scores2 = await scoreRepo.find({
            where: { algorithmVersion: version2 },
            relations: ["photo"]
        });

        // Filtrer par année
        const yearScores1 = scores1.filter(s => s.photo.year === year);
        const yearScores2 = scores2.filter(s => s.photo.year === year);

        // Créer des maps pour comparaison
        const map1 = new Map(yearScores1.map(s => [s.photo.id, s]));
        const map2 = new Map(yearScores2.map(s => [s.photo.id, s]));

        const scoreDifferences = [];
        const rankingChanges = [];

        for (const [photoId, score1] of map1) {
            const score2 = map2.get(photoId);
            if (score2) {
                if (score1.gscore !== score2.gscore) {
                    scoreDifferences.push({
                        photoId,
                        gscore1: score1.gscore,
                        gscore2: score2.gscore,
                        difference: score2.gscore - score1.gscore
                    });
                }
                if (score1.ranking !== score2.ranking) {
                    rankingChanges.push({
                        photoId,
                        ranking1: score1.ranking,
                        ranking2: score2.ranking,
                        change: score1.ranking - score2.ranking
                    });
                }
            }
        }

        // TODO: Comparer les awards
        const awardDifferences = [];

        return { scoreDifferences, rankingChanges, awardDifferences };
    }
}

export const agpaCalculationService = new AgpaCalculationService();
```

---

## 3. Modifications des APIs

### 3.1 Nouveaux Endpoints

```typescript
// absg-core/src/controllers/AgpaController.ts (ajouts)

import { AgpaAlgorithmVersion } from "../entities/AgpaAlgorithmVersion";
import { agpaCalculationService } from "../services/AgpaCalculationService";
import { algorithmFactory } from "../middleware/agpaAlgorithms/AgpaAlgorithmFactory";

// GET /api/agpa/algorithms
// Liste les algorithmes disponibles
@Get("/algorithms")
async getAlgorithms() {
    return algorithmFactory.getAll().map(algo => ({
        version: algo.version,
        name: algo.name,
        description: algo.description
    }));
}

// GET /api/agpa/palmares/:version
// Récupère le palmarès pour une version spécifique
@Get("/palmares/:version")
async getPalmaresByVersion(
    @Param("version") version: AgpaAlgorithmVersion
) {
    return agpaCalculationService.calculatePalmares(2006, null, version);
}

// GET /api/agpa/palmares/sliding/:version
// Palmarès glissant pour une version
@Get("/palmares/sliding/:version")
async getSlidingPalmaresByVersion(
    @Param("version") version: AgpaAlgorithmVersion,
    @QueryParam("yearFrom") yearFrom?: number,
    @QueryParam("yearTo") yearTo?: number
) {
    // ...
}

// POST /api/agpa/calculate/:year/:version
// Déclenche le calcul pour une édition et version (admin)
@Post("/calculate/:year/:version")
@Authorized("admin")
async calculateEdition(
    @Param("year") year: number,
    @Param("version") version: AgpaAlgorithmVersion
) {
    const results = await agpaCalculationService.calculateEdition(year, version);
    await agpaCalculationService.saveScores(year, version, results.scores);
    await agpaCalculationService.saveAwards(year, version, results.awards);
    return { success: true, ...results };
}

// GET /api/agpa/compare/:year
// Compare les résultats des deux algorithmes pour une année
@Get("/compare/:year")
async compareAlgorithms(@Param("year") year: number) {
    return agpaCalculationService.compareVersions(
        year,
        AgpaAlgorithmVersion.V2010,
        AgpaAlgorithmVersion.V2026
    );
}
```

### 3.2 Modification des Endpoints Existants

Les endpoints existants acceptent un paramètre optionnel `version` :

```typescript
// GET /api/agpa/palmares?version=v2010
// GET /api/agpa/palmares?version=v2026
// Si non spécifié, utilise V2010 par défaut (rétrocompatibilité)
```

---

## 4. Modifications Frontend

### 4.1 Sélecteur de Version

Ajouter un composant pour basculer entre les versions :

```vue
<!-- AlgorithmVersionSelector.vue -->
<template>
  <v-btn-toggle v-model="selectedVersion" mandatory>
    <v-btn value="v2010">
      <v-icon start>fas fa-history</v-icon>
      V2010 (Historique)
    </v-btn>
    <v-btn value="v2026">
      <v-icon start>fas fa-sparkles</v-icon>
      V2026 (Nouveau)
    </v-btn>
  </v-btn-toggle>
</template>
```

### 4.2 Affichage Comparatif

Ajouter une vue pour comparer les deux algorithmes :

```vue
<!-- PalmaresComparison.vue -->
<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <h3>Palmarès V2010</h3>
        <PalmaresList :version="'v2010'" />
      </v-col>
      <v-col cols="6">
        <h3>Palmarès V2026</h3>
        <PalmaresList :version="'v2026'" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h3>Différences</h3>
        <v-data-table
          :headers="diffHeaders"
          :items="differences"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
```

---

## 5. Plan d'Implémentation

### Phase 1: Infrastructure (1-2 jours)
1. Créer l'enum `AgpaAlgorithmVersion`
2. Créer les nouvelles entités (`AgpaPhotoScore`, `AgpaPalmaresEntry`)
3. Modifier l'entité `AgpaAward`
4. Exécuter les migrations SQL
5. Créer l'interface `IAgpaAlgorithm`

### Phase 2: Refactoring V2010 (2-3 jours)
1. Créer `AgpaAlgorithmV2010` en refactorisant le code existant
2. Créer la factory et le registry
3. Créer `AgpaCalculationService`
4. Tester que les calculs sont identiques à l'existant

### Phase 3: APIs et Frontend (1-2 jours)
1. Ajouter les nouveaux endpoints
2. Modifier les endpoints existants
3. Créer les composants frontend de sélection
4. Créer la vue comparative

### Phase 4: Nouvel Algorithme V2026 (selon besoins)
1. Définir les nouvelles règles
2. Implémenter `AgpaAlgorithmV2026`
3. Tester et valider
4. Recalculer toutes les éditions avec V2026

---

## 6. Rétrocompatibilité

- **Données existantes** : Les awards existants sont marqués `V2010` par défaut
- **API par défaut** : Sans paramètre `version`, l'API retourne les données V2010
- **Frontend** : Le sélecteur de version est optionnel, V2010 par défaut
- **Calcul historique** : Possibilité de recalculer toutes les éditions avec V2026

---

## 7. Questions Ouvertes pour V2026

Avant d'implémenter le nouvel algorithme, il faut définir :

1. **Formule de score** : Nouvelle formule de Note G ?
2. **Validation des votes** : Nouveaux seuils min/max ?
3. **Départage** : Nouveaux critères pour les ex-aequo ?
4. **Barème** : Nouveau barème de points palmarès ?
5. **Diamants** : Nouvelles conditions ?
6. **Catégories spéciales** : Changements pour meilleur photographe/titre/photo ?

---

*Document créé le 2026-01-10*
