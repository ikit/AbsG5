import { getRepository } from "typeorm";
import { JsonController, Param, Body, Get, Post, Delete, NotFoundError, Authorized } from "routing-controllers";
import { Immt } from "../entities";

import { immtService } from "../services";
import { success, issue } from "../middleware/jsonHelper";

@JsonController("/immt")
export class ImmtController {
    /**
     * Renvoie la dernière image du moment en date
     */
    @Authorized()
    @Get("")
    async last() {
        return await immtService.last();
    }

    /**
     * Récupère les infos pour initialiser l'écran des Immt
     */
    @Authorized()
    @Get("/init")
    async initData() {
        try {
            return await immtService.getInitData();
        } catch (ex) {
            return issue("Impossible de récupérer les données d'initialisation de la section immt", ex);
        }
    }

    /**
     * Récupère une immt via son identifiant (clés composée year + day)
     * @param year l'année de l'immt
     * @param day  le jour dans l'année de l'immt
     */
    @Authorized()
    @Get("/:year([0-9]{4})/:day([0-9]{1,3})")
    async getById(@Param("year") year: number, @Param("day") day: number) {
        return await immtService.fromId(year, day);
    }

    /**
     * Récupère les immt en fonction des données de filtrage fournis
     * @param filteringData
     */
    @Authorized()
    @Post("/")
    async get(@Body() filteringData: any) {
        return await immtService.getImmts(filteringData.pageIndex, filteringData.pageSize);
    }

    @Authorized()
    @Post("/")
    async save(@Body() citation: Immt) {
        return await immtService.save(citation);
    }

    @Authorized()
    @Delete("/:year([0-9]{4})/:day([0-9]{1,3})")
    async remove(@Param("year") year: number, @Param("day") day: number) {
        return await immtService.remove(year, day);
    }
}
