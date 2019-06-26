import { getConnection, getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Citation } from "../entities";

class CitationService {

    private citationsRepo = getRepository(Citation);


}

export const citationService = new CitationService();
