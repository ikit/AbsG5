import { getRepository } from "typeorm";
import { JsonController, Param, Body, Get, Post, Delete, NotFoundError } from "routing-controllers";
import { Immt } from "../entities";

import { immtService } from "../services";


@JsonController('/immt')
export class ImmtController {


    /**
     * Renvoie la dernière image du moment en date
     */
    @Get('')
    async last() {
        return await immtService.last();
    }

}
