import { getRepository } from "typeorm";
import { JsonController, Param, Body, Get, Post, Delete, NotFoundError } from "routing-controllers";
import { Immt } from "../entities";

import { immtService } from "../services";
import { success, issue } from "../middleware/jsonHelper";


@JsonController('/immt')
export class ImmtController {


    /**
     * Renvoie la dernière image du moment en date
     */
    @Get('')
    async last() {
        return await immtService.last();
    }

    /**
     * Récupère les infos pour initialiser l'écran des Immt
     */
    @Get('/init')
    async initData() {
        try {
            return success(await immtService.getInitData());
        } catch (ex) {
            return issue('Impossible de récupérer les données d\'initialisation de la section immt', ex);
        }
    }

    /**
     * Récupère une immt via son identifiant (clés composée year + day)
     * @param year l'année de l'immt
     * @param day  le jour dans l'année de l'immt
     */
    @Get('/:year/:day')
    async getById(@Param("year") year: number, @Param("day") day: number) {
        try {
            return success(await immtService.fromId(year, day));
        } catch (ex) {
            return issue(`Impossible de récupérer les données de l'image demandée`, ex);
        }
    }

    /**
     * Récupère les immt en fonction des données de filtrage fournis
     * @param filteringData 
     */
    @Post('/')
    async get(@Body() filteringData: any) {
        try {
            return success(await immtService.getImmts(filteringData.pageIndex, filteringData.pageSize));
        } catch (ex) {
            return issue('Impossible de récupérer les images demandées', ex);
        }
    }

    @Post('/')
    async save(@Body() citation: Immt) {
        try {
            return success(await immtService.save(citation));
        } catch (ex) {
            return issue(`Impossible de sauvegarder l'image`, ex);
        }
    }

    @Delete('/:year/:day')
    async remove(@Param("year") year: number, @Param("day") day: number) {
        try {
            return success(await immtService.remove(year, day));
        } catch (ex) {
            return issue(`Impossible de supprimer l'image`, ex);
        }
    }
}
