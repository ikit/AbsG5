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
        this.statsByCategories = [];
    }

    // Ajoute un award au palmares et met à jours les stats
    addAward(award: any) {
        if (award.userId === this.userId && award.year >= this.from && award.year <= this.to) {
            let cat = this.statsByCategories.find(e => {
                return e.id === award.categoryId;
            });
            if (!cat) {
                cat = {
                    id: award.categoryId,
                    title: award.catTitle,
                    color: award.color,
                    order: award.order,
                    stats: [0, 0, 0, 0, 0, 0, 0] // nominated, bronze, sylver, gold, diamond, totalAgpa, totalPoints
                };
                this.statsByCategories.push(cat);
            }
            cat.stats = [
                award.award === "nominated" ? cat.stats[0] + 1 : cat.stats[0],
                award.award === "bronze" ? cat.stats[1] + 1 : cat.stats[1],
                award.award === "sylver" ? cat.stats[2] + 1 : cat.stats[2],
                award.award === "gold" ? cat.stats[3] + 1 : cat.stats[3],
                award.award === "diamond" ? cat.stats[4] + 1 : cat.stats[4],
                award.award !== "nominated" ? cat.stats[5] + 1 : cat.stats[5],
                cat.stats[6] + palmaresPoints(award.award)
            ];
            this.totalAward += award.award !== "nominated" ? 1 : 0;
            this.totalPoints += palmaresPoints(award.award);
        }
    }
}
