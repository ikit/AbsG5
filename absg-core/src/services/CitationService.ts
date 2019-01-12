import { getConnection, getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Citation } from "../entities";

export class CitationService {

    private citationsRepo = getRepository(Citation);

}