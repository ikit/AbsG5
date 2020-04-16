import {
    JsonController,
    Param,
    Body,
    Get,
    Post,
    Delete,
    Authorized,
    UploadedFile,
    CurrentUser
} from "routing-controllers";

import { immtService } from "../services";

@Authorized()
@JsonController("/immt")
export class ImmtController {
    /**
     * Renvoie la dernière image du moment en date
     */
    @Get("/last")
    last() {
        return immtService.last();
    }

    /**
     * Récupère les infos pour initialiser l'écran des Immt
     */
    @Get("/")
    initData() {
        return immtService.all();
    }

    /**
     * Récupère une immt via son identifiant (clés composée year + day)
     * @param year l'année de l'immt
     * @param day  le jour dans l'année de l'immt
     */
    @Get("/:year([0-9]{4})/:day([0-9]{1,3})")
    getById(@Param("year") year: number, @Param("day") day: number) {
        return immtService.fromId(year, day);
    }

    /**
     * Récupère les immt en fonction des données de filtrage fournis
     * @param filteringData
     */
    @Get("/")
    get(@Body() filteringData: any) {
        return immtService.getImmts(filteringData.pageIndex, filteringData.pageSize);
    }

    /**
     * Enregistre une nouvelle image du moment
     * @param image l'image
     * @param body d'autres informations sur l'image comme l'auteur et le titre
     */
    @Post("/")
    async save(@UploadedFile("image") image: any, @Body() body: any, @CurrentUser() session: any) {
        console.log("========= SAVE IMMT");
        console.log(image);
        console.log(body);
        console.log(session);
        console.log("========= SAVE IMMT");
        return immtService.save(image, body.title, session);
    }

    @Delete("/:year([0-9]{4})/:day([0-9]{1,3})")
    remove(@Param("year") year: number, @Param("day") day: number) {
        return immtService.remove(year, day);
    }
}
