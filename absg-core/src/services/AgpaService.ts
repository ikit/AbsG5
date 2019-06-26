import { getConnection, getRepository, Equal } from "typeorm";
import { format, addDays } from "date-fns";
import { AgpaPhoto, AgpaAward, AgpaAwardType, AgpaCategory, AgpaVote } from "../entities";
import { initAGPAContext } from "../middleware/agpaCommonHelpers";
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

    
}


export const agpaService = new AgpaService();

