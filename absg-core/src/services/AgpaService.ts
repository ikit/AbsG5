import { getConnection, getRepository, Equal } from "typeorm";
import { format, addDays } from "date-fns";
import { AgpaPhoto, AgpaAward, AgpaAwardType, AgpaCategory, AgpaVote } from "../entities";
import { initAGPAContext, findMaxArchiveEdition } from "../middleware/agpaCommonHelpers";
import { buildArchiveSummary } from "../middleware/agpaArchiveHelper";







class AgpaService {

    private photosRepo = getRepository(AgpaPhoto);

    /**
     * Retourne les informations sur l'édition en cours (AgpaContext)
     */
    public welcom() {
        return initAGPAContext(new Date());
    }
    
    /**
     * Retourne les informations sur les anciennes éditions
     */
    public archivesSummary() {
        return buildArchiveSummary();
    }

    /**
     * 
     * @param year Retourne les informations sur une ancienne édition
     */
    public archiveEditionSummary(year: number) {

        if (year >= 2006 && year <= findMaxArchiveEdition()) {
            return initAGPAContext(new Date(year, 11, 30));
        }
        else {
            return null;
        }
    }
}


export const agpaService = new AgpaService();

