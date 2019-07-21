import { getConnection, getRepository, Equal } from "typeorm";
import { format } from "date-fns";
import { Immt } from "../entities";

class ImmtService {

    private immtsRepo = null;

    public initService() {
        this.immtsRepo = getRepository(Immt);
    }

    /**
     * Renvoie la dernière image du moment en date
     */
    public async last() {
        return await this.immtsRepo.findOne({ order: { year: "DESC", day: "DESC" }});
    }

}

export const immtService = new ImmtService();
