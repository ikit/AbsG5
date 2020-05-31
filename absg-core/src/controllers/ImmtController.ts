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
import { User } from "../entities";

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
     * Enregistre une nouvelle image du moment
     * @param image l'image
     * @param body d'autres informations sur l'image comme l'auteur et le titre
     */
    @Post("/")
    async save(@UploadedFile("image") image: any, @Body() body: any, @CurrentUser() user: User) {
        return immtService.save(image, body.title, user);
    }

    @Delete("/:year([0-9]{4})/:day([0-9]{1,3})")
    remove(@Param("year") year: number, @Param("day") day: number, @CurrentUser() user: User) {
        return immtService.remove(year, day, user);
    }
}
