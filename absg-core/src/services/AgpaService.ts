import { getRepository } from "typeorm";
import { AgpaPhoto } from "../entities";
import { initAGPAContext, getMaxArchiveEdition } from "../middleware/agpaCommonHelpers";
import { archiveSummary, archiveEdition, archiveCategory, palmaresData } from "../middleware/agpaArchiveHelper";
import { ceremonyData } from "../middleware/agpaCeremonyHelper";

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
        } else {
            return null;
        }
    }

    public getArchiveCategory(year: number, catId: number) {
        if (year >= 2006 && year <= getMaxArchiveEdition()) {
            return archiveCategory(year, catId);
        } else {
            return null;
        }
    }

    public getPalmaresData() {
        return palmaresData(null, null);
    }

    public getCeremonyData(year: number) {
        if (year >= 2006 && year <= getMaxArchiveEdition()) {
            return ceremonyData(year);
        } else {
            return null;
        }
    }
}

export const agpaService = new AgpaService();
