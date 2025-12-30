import {
    JsonController,
    Param,
    Get,
    Delete,
    Authorized,
    CurrentUser,
    Post,
    Body,
    Req
} from "routing-controllers";
import { AgpaPhoto, User } from "../entities";
import { agpaService } from "../services/AgpaService";
import { agpaBadgeService } from "../services/AgpaBadgeService";
import { getMetaData } from "../middleware/agpaCommonHelpers";
import { AppDataSource } from "../data-source";

@Authorized()
@JsonController("/agpa")
export class AgpaController {
    private get photosRepo() {
        return AppDataSource.getRepository(AgpaPhoto);
    }

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
     * @param session l'utilisateur qui fait la demande
     */
    @Get("/archives")
    archives(@CurrentUser() session: any) {
        return agpaService.getArchiveSummary(session);
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
        return `Zip AGPA-${year}.zip created`;
    }

    @Get("/ceremony/:year([0-9]{4})")
    getCeremony(@Param("year") year: number) {
        return agpaService.getCeremonyData(year);
    }

    @Get("/ceremony/:year([0-9]{4})/notifyMasterSlide/:slide([0-9]+)/:hash")
    notifyMasterSlide(
        @Param("year") year: number,
        @Param("slide") slide: number,
        @Param("hash") hash: string,
        @CurrentUser() user
    ) {
        return agpaService.notifyMasterSlide(year, slide, hash, user);
    }

    @Get("/palmares")
    getPalmares() {
        return agpaService.getPalmaresData();
    }

    /**
     * Récupère les statistiques "palmarès glissant" pour les 3 dernières éditions
     */
    @Get("/palmares/sliding")
    getSlidingPalmares() {
        return agpaService.getSlidingPalmaresData();
    }

    /**
     * Récupère les profils de votes pour une édition donnée
     * @param year l'année de l'édition à analyser
     */
    @Get("/vote-profiles/:year([0-9]{4})")
    getVoteProfiles(@Param("year") year: number) {
        return agpaService.getVoteProfiles(year);
    }

    /**
     * Récupère l'historique complet des badges d'un utilisateur
     * @param user l'utilisateur qui effectue la demande
     */
    @Get("/my-badges-history")
    getMyBadgesHistory(@CurrentUser() user: User) {
        return agpaService.getMyBadgesHistory(user);
    }

    /**
     * Récupère l'historique des badges d'un utilisateur spécifique (admin only)
     * @param userId l'identifiant de l'utilisateur
     * @param currentUser l'utilisateur qui effectue la demande
     */
    @Get("/badges-history/:userId([0-9]+)")
    getBadgesHistoryForUser(@Param("userId") userId: number, @CurrentUser() currentUser: User) {
        if (!currentUser.is("admin")) {
            throw new Error("Accès refusé - Admin uniquement");
        }
        return agpaService.getBadgesHistoryForUser(userId);
    }

    /**
     * Recalcule tous les badges pour une année donnée (admin only)
     * Supprime les badges existants et les recalcule pour tous les utilisateurs
     * @param year l'année pour laquelle recalculer les badges
     * @param currentUser l'utilisateur qui effectue la demande
     */
    @Post("/compute-badges/:year([0-9]{4})")
    async computeBadges(@Param("year") year: number, @CurrentUser() currentUser: User) {
        if (!currentUser.is("admin")) {
            throw new Error("Accès refusé - Admin uniquement");
        }
        return await agpaBadgeService.computeBadgesForYear(year);
    }

    /**
     * Récupère les informations de l'utilisateur pour la phase 1
     * @param user l'utilisateur qui effectue la demande
     */
    @Get("/p1")
    getP1Data(@CurrentUser() user) {
        return agpaService.getP1Data(user);
    }

    /**
     * Récupère les informations de l'utilisateur pour la phase 2
     * @param user l'utilisateur qui effectue la demande
     */
    @Get("/p2")
    getP2Data(@CurrentUser() user) {
        return agpaService.getP2Data(user);
    }

    /**
     * Récupère les informations de l'utilisateur pour la phase 3
     * @param user l'utilisateur qui effectue la demande
     */
    @Get("/p3")
    getP3Data(@CurrentUser() user) {
        return agpaService.getP3Data(user);
    }

    /**
     * Récupère les informations de l'utilisateur pour la phase 3
     * @param user l'utilisateur qui effectue la demande
     */
    @Get("/close-edition")
    closeEdition() {
        return agpaService.closeEdition();
    }

    /**
     * Effectue le dépouillement des votes
     * @param user l'utilisateur qui effectue la demande
     */
    @Get("/monitoring/:year([0-9]+)")
    monitoring(@Param("year") year: number, @CurrentUser() user: User) {
        if (user.is("admin")) {
            return agpaService.monitoring(year, user);
        } else {
            return null;
        }
    }

    /**
     * Enregistre ou modifie une photo
     * @param req la requête express contenant les fichiers
     * @param user l'utilisateur qui effectue la demande
     */
    @Post("/photo")
    savePhoto(@Req() req: any, @CurrentUser() user: any) {
        // Extract data from express-fileupload format
        const body = req.body;
        const image = req.files?.image;
        return agpaService.savePhoto(body, image, user);
    }

    /**
     * Supprime une photo si autorisé
     * @param photoId
     * @param user l'utilisateur qui effectue la demande
     */
    @Delete("/photo/:photoId([0-9]+)")
    remove(@Param("photoId") photoId: number, @CurrentUser() user) {
        return agpaService.deletePhoto(photoId, user);
    }

    /**
     * Met à jour le vote d'un utilisateur pour une photo
     * @param photoId
     * @param vote
     * @param user l'utilisateur qui effectue la demande
     */
    @Get("/vote/:photoId([0-9]+)/:vote")
    vote(@Param("photoId") photoId: number, @Param("vote") vote: number, @CurrentUser() user) {
        return agpaService.vote(photoId, vote, user);
    }
}
