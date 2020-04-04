import { JsonController, Param, Body, Get, Post, Delete, Authorized } from "routing-controllers";
import { Immt } from "../entities";

import { immtService } from "../services";

@Authorized()
@JsonController("/immt")
export class ImmtController {
    /**
     * Renvoie la dernière image du moment en date
     */
    @Get("")
    async last() {
        return await immtService.last();
    }

    /**
     * Récupère les infos pour initialiser l'écran des Immt
     */
    @Get("/init")
    async initData() {
        try {
            return await immtService.getInitData();
        } catch (ex) {
            throw new Error("Impossible de récupérer les données d'initialisation de la section immt");
        }
    }

    /**
     * Récupère une immt via son identifiant (clés composée year + day)
     * @param year l'année de l'immt
     * @param day  le jour dans l'année de l'immt
     */
    @Get("/:year([0-9]{4})/:day([0-9]{1,3})")
    async getById(@Param("year") year: number, @Param("day") day: number) {
        return await immtService.fromId(year, day);
    }

    /**
     * Récupère les immt en fonction des données de filtrage fournis
     * @param filteringData
     */
    @Post("/")
    async get(@Body() filteringData: any) {
        return await immtService.getImmts(filteringData.pageIndex, filteringData.pageSize);
    }

    @Post("/")
    async save(@Body() citation: Immt) {
        return await immtService.save(citation);
    }

    @Delete("/:year([0-9]{4})/:day([0-9]{1,3})")
    async remove(@Param("year") year: number, @Param("day") day: number) {
        return await immtService.remove(year, day);
    }
}
