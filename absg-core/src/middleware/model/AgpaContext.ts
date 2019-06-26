import { AgpaCategory, AgpaPhoto, User } from "../../entities";
import { getRepository } from "typeorm";
import { AgpaPhase } from "./AgpaPhase";
import { addDays } from "date-fns";

export class AgpaContext {
    categories: Map<number, AgpaCategory>;  // catId => category
    photos: Map<number, AgpaPhoto>;         // photoId => photo
    authors: Map<number, string>;           // userId => user name
    date: Date;
    editionYear: number;
    phase: number = null;
    phases: AgpaPhase[];
    totalPhotos: number = 0;
    totalAuthors: number = 0;

    lastUpdateRefDate : Date = null; // La date de référence utilisé pour la dernière maj du contexte


    /**
     * Indique en fonction d'une date donnée, si les infos du contexte doivent être rafraichit ou non
     * 
     * @param date 
     */
    shallBeReset(date: Date) {
        const currentYear = new Date(Date.now()).getFullYear();
        const year = date.getFullYear();

        // Si pas encore init, il le faut
        if (!this.lastUpdateRefDate) return true;
        // Si dernier update ne correspond à l'année voulu, il le faut
        if (year != this.lastUpdateRefDate.getFullYear()) return true;
        // Pour les année passé, pas besoin de rafraichir le contexte à chaque fois... 
        if (year < currentYear) return !this.lastUpdateRefDate;

        // Pour l'année en cours (si phase < 5), on raffraichi tout le temps car les données peuvent changer à tout moment.
        return true;
    }


    /**
     * 
     * @param date 
     */
    async reset(date: Date) : Promise<void> {
        const currentYear = new Date(Date.now()).getFullYear();
        this.categories = new Map<number, AgpaCategory>();
        this.photos = new Map<number, AgpaPhoto>();
        this.authors = new Map<number, string>();
        this.totalPhotos = 0;
        this.totalAuthors = 0;
        this.lastUpdateRefDate = date;

        // On calcul l'édition en fonction de la date
        // Une édition commence au 1er octobre pour se terminer fin décembre
        // Mais en fonction du calendrier, peut déborder sur janvier/février de l'année suivante
        // Aussi pour calculer l'édition: si on est avant octobre, il s'agit de l'édition précédente
        // Sinon il s'agit de l'année courante :)
        this.editionYear = date.getFullYear();
        if (date.getMonth() < 9) {
            this.editionYear--;
        }

        // Les durées des phases par défaut sont :
        //   1 : enregistrement des oeuvre        [ du 1er octobre au 15 décembre ] => 76 jours
        //   2 : vérification des photos          [ du 15 au 17 décembre ] => 2 jourss
        //   3 : votes                            [ du 17 au 21 décembre ] => 4 jours
        //   4 : calculs et préparation cérémonie [ du 21 au 24 décembre ] => 3 jours
        //   5 : post cérémonie                   [ du 24 jusqu'au démarrage de la prochaine édition ] 
        // Mais pour l'année en cours, on récupère les durées via la DB car on peut les modifier
        // pour s'adapter au contraintes des agendas des participants
        this.phases = [];
        let startDate =  new Date(this.editionYear, 9, 1, 0, 0, 0);
        const phasesDayDurations = [76,2,4,3, null];
        if (this.editionYear < currentYear ) {
            // TODO: for current year, phases durations may be changed to fit users calendars}
            // retrieve it from db
        }

        for (let idx=0; idx < phasesDayDurations.length; idx++) {
            const p = new AgpaPhase();
            p.id = idx + 1;
            p.startDate = new Date(startDate);
            if (phasesDayDurations[idx]) {
                startDate = addDays(startDate, phasesDayDurations[idx]);
                p.endDate = new Date(startDate);
            } else {
                p.endDate = new Date(startDate.getFullYear() + 1, 8, 31);
            }
            this.phases.push(p);
            
            // On sélectionne la phase en fonction de la date fourni
            if (date > p.startDate) {
                this.phase = p.id;
            }
        }

        
        // Reset categories informations
        const repo = getRepository(AgpaCategory);
        let sql = `SELECT c.*, v.title as "sTitle", v.description as "sDescription"
            FROM agpa_category c
            LEFT JOIN agpa_category_variation v ON c.id = v.id AND v.year=${this.editionYear}
            ORDER BY c.order ASC`;
        const result = await repo.query(sql);

        for(const row of result)
        {
            const cat = new AgpaCategory()
            cat.fromJSON(row);
            cat.photos = [];
            cat.nbrPhotos = 0;
            cat.authors = [];
            this.categories.set(cat.id, cat);
        }
    }
}
