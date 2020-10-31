import { palmaresPoints } from "../agpaPalmaresHelper";

/**
 * Décris une entrée de palmarès pour un user donnée
 */
export class AgpaPalmares {
    userId: number; // l'id de l'utilisateur (négatif pour les famille: -1: gueudelot, -2: guibert, -3: guyo...)
    username: string; // le nom de l'utilisateur
    rootFamily: string; // la famille mère de l'utilisateur
    from: number; // année de l'édition de départ pour la prise en compte du calcul du palmarès
    to: number; // année de l'édition de fin pour la prise en compte du calcul du palmarès
    awards: any; // le totals des récompenses { total, diamond, gold, sylver, bronze, nominated, honor } (pour le total, nominated & honor ne sont pas prises en compte)
    statsByCategories: any; // le détails des récompenses pour chaque catégorie { catId: [nominated, bronze, sylver, gold, diamond, totalAgpa, totalPoints], ...}
    statsByYears: any; // les scores par années { year: [nominated, bronze, sylver, gold, diamond, totalAgpa, totalPoints]}
    totalPoints: number; // le total de points obtenu
    participation: 0; // le nombre d'édition auxquelles à participer l'utilisateur
    bestCat: any; // la catégorie où le joueur fait son score maximal
    bestYear: any; // l'année où le joueur à fait son score maximal

    public constructor(userId: number, from: number, to: number) {
        this.userId = userId;
        this.from = from;
        this.to = to;
        this.awards = { total: 0, diamond: 0, gold: 0, sylver: 0, bronze: 0, nominated: 0, honor: 0 };
        this.totalPoints = 0;
        this.statsByCategories = [];
        this.statsByYears = [];
        this.bestCat = null;
        this.bestYear = null;
    }

    // Ajoute un award au palmares et met à jours les stats
    addAward(award: any) {
        if (award.userId === this.userId && award.year >= this.from && award.year <= this.to) {
            let cat = this.statsByCategories.find(e => e.id === award.categoryId);
            if (!cat) {
                cat = {
                    id: award.categoryId,
                    title: award.catTitle,
                    order: award.order,
                    stats: [0, 0, 0, 0, 0, 0, 0] // nominated, bronze, sylver, gold, diamond, totalAgpa, totalPoints
                };
                this.statsByCategories.push(cat);
            }
            let year = this.statsByYears.find(e => e.year === award.year);
            if (!year) {
                year = {
                    year: award.year,
                    stats: [0, 0, 0, 0, 0, 0, 0, 0] // honor, nominated, bronze, sylver, gold, diamond, totalAgpa, totalPoints
                };
                this.statsByYears.push(year);
            }
            switch (award.award) {
                case "honor":
                    this.awards.honor += 1;
                    year.stats.splice(0, 1, year.stats[0] + 1);
                    break;
                case "nominated":
                    cat.stats.splice(0, 1, cat.stats[0] + 1);
                    year.stats.splice(1, 1, year.stats[1] + 1);
                    this.awards.nominated += 1;
                    break;
                case "bronze":
                    cat.stats.splice(1, 1, cat.stats[1] + 1);
                    cat.stats.splice(5, 1, cat.stats[5] + 1);
                    cat.stats.splice(6, 1, cat.stats[6] + palmaresPoints(award.award));
                    year.stats.splice(2, 1, year.stats[2] + 1);
                    year.stats.splice(6, 1, year.stats[6] + 1);
                    year.stats.splice(7, 1, year.stats[7] + palmaresPoints(award.award));
                    this.awards.bronze += 1;
                    this.awards.total += 1;
                    break;
                case "sylver":
                    cat.stats.splice(2, 1, cat.stats[2] + 1);
                    cat.stats.splice(5, 1, cat.stats[5] + 1);
                    cat.stats.splice(6, 1, cat.stats[6] + palmaresPoints(award.award));
                    year.stats.splice(3, 1, year.stats[3] + 1);
                    year.stats.splice(6, 1, year.stats[6] + 1);
                    year.stats.splice(7, 1, year.stats[7] + palmaresPoints(award.award));
                    this.awards.sylver += 1;
                    this.awards.total += 1;
                    break;
                case "gold":
                    cat.stats.splice(3, 1, cat.stats[3] + 1);
                    cat.stats.splice(5, 1, cat.stats[5] + 1);
                    cat.stats.splice(6, 1, cat.stats[6] + palmaresPoints(award.award));
                    year.stats.splice(4, 1, year.stats[4] + 1);
                    year.stats.splice(6, 1, year.stats[6] + 1);
                    year.stats.splice(7, 1, year.stats[7] + palmaresPoints(award.award));
                    this.awards.gold += 1;
                    this.awards.total += 1;
                    break;
                case "diamond":
                    cat.stats.splice(4, 1, cat.stats[4] + 1);
                    cat.stats.splice(5, 1, cat.stats[5] + 1);
                    cat.stats.splice(6, 1, cat.stats[6] + palmaresPoints(award.award));
                    year.stats.splice(5, 1, year.stats[5] + 1);
                    year.stats.splice(6, 1, year.stats[6] + 1);
                    year.stats.splice(7, 1, year.stats[7] + palmaresPoints(award.award));
                    this.awards.diamond += 1;
                    this.awards.total += 1;
                    break;
            }

            this.awards.total += ["nominated", "honor"].find(e => e === award.award) ? 0 : 1;
            this.totalPoints += palmaresPoints(award.award);
            // On récupère la meilleure année/catégorie pour le jouruer
            this.statsByYears.sort((a: { stats: number[] }, b: { stats: number[] }) => b.stats[7] - a.stats[7]);
            this.statsByCategories.sort((a: { stats: number[] }, b: { stats: number[] }) => b.stats[6] - a.stats[6]);
            this.bestYear = this.statsByYears[0];
            this.bestCat = this.statsByCategories[0];
        }
    }
}
