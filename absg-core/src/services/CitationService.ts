import { getConnection, getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Citation } from "../entities";
import { initAGPAContext } from "../middleware/agpaCommonHelpers";

class CitationService {

    private citationsRepo = getRepository(Citation);

    public welcom() {
        return initAGPAContext(2018);
    }

}

export const citationService = new CitationService();
