import { getConnection, getRepository, Equal } from "typeorm";
import { format, addDays } from "date-fns";
import { AgpaPhoto, AgpaAward, AgpaAwardType, AgpaCategory, AgpaVote } from "../entities";
import { initAGPAContext, getMaxArchiveEdition } from "../middleware/agpaCommonHelpers";
import { archiveSummary, archiveEdition, archiveCategory } from "../middleware/agpaArchiveHelper";







class AgpaService {

    private photosRepo = null;


    public initService() {
        this.photosRepo = getRepository(AgpaPhoto);
    }

    /**
     * Retourne les informations sur l'édition en cours (AgpaContext)
     */
    public welcom() {

        return initAGPAContext(new Date());
    }
    
    /**
     * Retourne les informations sur les anciennes éditions
     */
    public getArchiveSummary() {
        return archiveSummary();
    }

    /**
     * 
     * @param year Retourne les informations sur une ancienne édition
     */
    public getArchiveEdition(year: number) {

        if (year >= 2006 && year <= getMaxArchiveEdition()) {
            return archiveEdition(year);
        }
        else {
            return null;
        }
    }

    public getArchiveCategory(year: number, catId: number) {
        if (year >= 2006 && year <= getMaxArchiveEdition()) {
            return archiveCategory(year, catId);
        }
        else {
            return null;
        }
    }
}


export const agpaService = new AgpaService();

