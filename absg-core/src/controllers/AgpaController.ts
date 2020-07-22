import { getRepository } from "typeorm";
import { JsonController, Param, Get, Delete, Authorized, CurrentUser, UploadedFile, Post, Body } from "routing-controllers";
import { AgpaPhoto } from "../entities";
import { agpaService } from "../services/AgpaService";
import { getMetaData } from "../middleware/agpaCommonHelpers";

@Authorized()
@JsonController("/agpa")
export class AgpaController {
    private photosRepo = getRepository(AgpaPhoto);

    /**
     * Récupère les données d'initialisation des AGPA (contexte, metadata, ...)
     */
    @Get("")
    welcome() {
        return getMetaData();
    }

    /**
     * Récupère les données globale sur l'ensemble des éditions permettant de faire
     * le résumé des archives
     * @param user l'utilisateur qui fait la demande
     */
    @Get("/archives")
    archives(@CurrentUser() user) {
        return agpaService.getArchiveSummary(user);
    }

    /**
     * Récupère les données détaillées pour une édition en particulier
     * @param year 
     * @param user 
     */
    @Get("/archives/:year([0-9]{4})")
    getEdition(@Param("year") year: number, @CurrentUser() user) {
        return agpaService.getArchiveEdition(year, user);
    }

    /**
     * Récupère les données détaillées pour une catégorie d'une édition en particulier
     * @param year 
     * @param catId 
     * @param user 
     */
    @Get("/archives/:year([0-9]{4})/:catId([0-9]{1,2})")
    getCategory(@Param("year") year: number, @Param("catId") catId: number, @CurrentUser() user) {
        return agpaService.getArchiveCategory(year, catId, user);
    }

    /**
     * Permet de télécharger au format CSV les données des AGPA
     * @param year 
     */
    @Get("/archives/:year([0-9]{4})/files")
    getArchivesFile(@Param("year") year: number) {
        // TODO
        return "zip download from cloud";
    }

    @Get("/ceremony/:year([0-9]{4})")
    getCeremony(@Param("year") year: number) {
        return agpaService.getCeremonyData(year);
    }

    @Get("/stats")
    getStats() {
        // TODO
        return {};
    }

    @Get("/palmares")
    getPalmares() {
        return agpaService.getPalmaresData();
    }

    /**
     * Récupère les informations de l'utilisateur pour la phase 1
     * @param user 
     */
    @Get("/p1")
    getP1Data(@CurrentUser() user) {
        return agpaService.getP1Data(user);
    }

    /**
     * Enregistre ou modifie une photo
     * @param image la photo si défini
     * @param body les informations sur la photo au format json
     * @param user l'utilisateur qui effectue la demande
     */
    @Post("/photo")
    savePhoto(@UploadedFile("image") image: any, @Body() body: any, @CurrentUser() user: any) {
        return agpaService.savePhoto(body, image, user);
    }

    /**
     * Supprime une photo si autorisé
     * @param photoId 
     * @param user 
     */
    @Delete("/photo/:photoId([0-9]+)")
    remove(@Param("photoId") photoId: number, @CurrentUser() user) {
        return agpaService.deletePhoto(photoId, user);
    }
}
