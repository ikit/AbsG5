import { palmaresPoints } from "../agpaArchiveHelper";

/**
 * Décris une entrée de palmarès pour un user donnée
 */
export class AgpaPalmares {
    userId: number; // l'id de l'utilisateur (négatif pour les famille: -1: gueudelot, -2: guibert, -3: guyo...)
    username: string; // le nom de l'utilisateur
    from: number; // année de l'édition de départ pour la prise en compte du calcul du palmarès
    to: number; // année de l'édition de fin pour la prise en compte du calcul du palmarès
    statsByCategories: any; // le détails des récompenses pour chaque catégorie { catId: [totalNomination, totalBronze, totalArgent, totalOr, totalDiamant], ...}
    totalAward: number; // le total de récompense obtenu (les nominations ne sont pas prises en compte)
    totalPoints: number; // le total de points obtenu

    public constructor(userId: number, from: number, to: number) {
        this.userId = userId;
        this.from = from;
        this.to = to;
        this.totalAward = 0;
        this.totalPoints = 0;
        this.statsByCategories = {};
    }

    // Ajoute un award au palmares et met à jours les stats
    addAward(award: any) {
        if (award.userId === this.userId && award.year >= this.from && award.year <= this.to) {
            if (!(award.categoryId in this.statsByCategories)) {
                this.statsByCategories[award.categoryId] = [0, 0, 0, 0, 0];
            }
            const stats = this.statsByCategories[award.categoryId];
            this.statsByCategories[award.categoryId] = [
                award.award === "nominated" ? stats[0] + 1 : stats[0],
                award.award === "bronze" ? stats[1] + 1 : stats[1],
                award.award === "sylver" ? stats[2] + 1 : stats[2],
                award.award === "gold" ? stats[3] + 1 : stats[3],
                award.award === "diamond" ? stats[4] + 1 : stats[4]
            ];
            this.totalAward += award.award !== "nominated" ? 1 : 0;
            this.totalPoints += palmaresPoints(award.award);
        }
    }
}
