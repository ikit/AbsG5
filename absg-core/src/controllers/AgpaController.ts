import {
    JsonController,
    Param,
    QueryParam,
    Get,
    Delete,
    Authorized,
    CurrentUser,
    Post,
    Body,
    Req,
    Res
} from "routing-controllers";
import { AgpaPhoto, User } from "../entities";
import { agpaService, AgpaAlgorithmVersion } from "../services/AgpaService";
import { agpaBadgeService } from "../services/AgpaBadgeService";
import { getMetaData } from "../middleware/agpaCommonHelpers";
import { AppDataSource } from "../data-source";
import archiver from "archiver";
import { Response } from "express";

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
     * Récupère la liste de toutes les éditions disponibles avec leurs statistiques
     * Utilisé par le module de supervision pour permettre la sélection d'une édition
     */
    @Get("/editions")
    getEditionsList(@CurrentUser() user: User) {
        if (user.is("admin")) {
            return agpaService.getEditionsList();
        }
        return null;
    }

    /**
     * Récupère les étapes de calcul V2026 pour une édition
     * Permet de visualiser le processus de calcul étape par étape
     * @param year l'année de l'édition
     */
    @Get("/monitoring/:year([0-9]{4})/v2026-steps")
    getV2026Steps(@Param("year") year: number, @CurrentUser() user: User) {
        if (user.is("admin")) {
            return agpaService.getV2026CalculationSteps(year);
        }
        return null;
    }

    /**
     * Récupère les votes organisés par votant pour une édition
     * @param year l'année de l'édition
     */
    @Get("/monitoring/:year([0-9]{4})/votes-by-voter")
    getVotesByVoter(@Param("year") year: number, @CurrentUser() user: User) {
        if (user.is("admin")) {
            return agpaService.getVotesByVoter(year);
        }
        return null;
    }

    /**
     * Récupère l'évolution du palmarès glissant sur toutes les fenêtres de 3 ans
     */
    @Get("/palmares/sliding-evolution")
    getSlidingPalmaresEvolution(@CurrentUser() user: User) {
        if (user.is("admin")) {
            return agpaService.getSlidingPalmaresEvolution();
        }
        return null;
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
     * Permet de télécharger au format ZIP les données CSV des AGPA d'une édition
     * Contient: photos.csv, users.csv, votes.csv, categories.csv, awards.csv, badges.csv
     * @param year l'année de l'édition
     * @param response la réponse Express
     */
    @Get("/archives/:year([0-9]{4})/files")
    async getArchivesFile(@Param("year") year: number, @Res() response: Response) {
        const exportData = await agpaService.getExportData(year);

        // Configurer les headers pour le téléchargement ZIP
        response.setHeader("Content-Type", "application/zip");
        response.setHeader("Content-Disposition", `attachment; filename=AGPA-${year}.zip`);

        // Créer l'archive ZIP
        const archive = archiver("zip", { zlib: { level: 9 } });

        // Pipe l'archive vers la réponse
        archive.pipe(response);

        // Ajouter les fichiers CSV à l'archive
        archive.append(exportData.photos, { name: `AGPA-${year}/photos.csv` });
        archive.append(exportData.users, { name: `AGPA-${year}/users.csv` });
        archive.append(exportData.votes, { name: `AGPA-${year}/votes.csv` });
        archive.append(exportData.categories, { name: `AGPA-${year}/categories.csv` });
        archive.append(exportData.awards, { name: `AGPA-${year}/awards.csv` });
        archive.append(exportData.badges, { name: `AGPA-${year}/badges.csv` });

        // Finaliser l'archive
        await archive.finalize();

        return response;
    }

    /**
     * Télécharge toutes les données AGPA au format ZIP avec CSVs
     * Contient: photos.csv, users.csv, votes.csv, categories.csv, awards.csv, badges.csv
     */
    @Get("/data/export-all")
    async getFullExport(@Res() response: Response) {
        const exportData = await agpaService.getAllExportData();

        response.setHeader("Content-Type", "application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=AGPA-Export.zip");

        const archive = archiver("zip", { zlib: { level: 9 } });
        archive.pipe(response);

        archive.append(exportData.photos, { name: "AGPA-Export/photos.csv" });
        archive.append(exportData.users, { name: "AGPA-Export/users.csv" });
        archive.append(exportData.votes, { name: "AGPA-Export/votes.csv" });
        archive.append(exportData.categories, { name: "AGPA-Export/categories.csv" });
        archive.append(exportData.awards, { name: "AGPA-Export/awards.csv" });
        archive.append(exportData.badges, { name: "AGPA-Export/badges.csv" });

        await archive.finalize();

        return response;
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
     * Récupère les meilleures photos de l'utilisateur connecté pour le mini-diaporama
     */
    @Get("/my-best-photos")
    getMyBestPhotos(@CurrentUser() user: User) {
        return agpaService.getMyBestPhotos(user.id);
    }

    /**
     * Récupère les statistiques "palmarès glissant" pour une période donnée
     */
    @Get("/palmares/sliding")
    getSlidingPalmares(
        @QueryParam("yearFrom") yearFrom?: number,
        @QueryParam("yearTo") yearTo?: number
    ) {
        return agpaService.getSlidingPalmaresData(yearFrom, yearTo);
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
     * Récupère les membres actifs d'une famille avec leurs badges principaux
     * @param family le nom de la famille (gueudelot, guyomard, guibert)
     */
    @Get("/family-badges/:family")
    getFamilyBadges(@Param("family") family: string) {
        return agpaService.getFamilyBadges(family);
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
     * @param year l'année de l'édition
     * @param algorithm l'algorithme à utiliser (V2010 ou V2026, défaut: V2026)
     * @param user l'utilisateur qui effectue la demande
     */
    @Get("/monitoring/:year([0-9]+)")
    monitoring(@Param("year") year: number, @CurrentUser() user: User) {
        if (user.is("admin")) {
            return agpaService.monitoring(year, user, "V2026");
        } else {
            return null;
        }
    }

    /**
     * Effectue le dépouillement des votes avec choix de l'algorithme
     * @param year l'année de l'édition
     * @param algorithm l'algorithme à utiliser (V2010 ou V2026)
     * @param user l'utilisateur qui effectue la demande
     */
    @Get("/monitoring/:year([0-9]+)/:algorithm")
    monitoringWithAlgorithm(
        @Param("year") year: number,
        @Param("algorithm") algorithm: string,
        @CurrentUser() user: User
    ) {
        if (user.is("admin")) {
            const algo: AgpaAlgorithmVersion = algorithm === "V2010" ? "V2010" : "V2026";
            return agpaService.monitoring(year, user, algo);
        } else {
            return null;
        }
    }

    /**
     * Recalcule les scores, awards et badges pour toutes les éditions (admin only)
     * @param fromYear année de début (défaut: 2006)
     * @param toYear année de fin (défaut: année courante)
     * @param algorithm l'algorithme à utiliser (V2010 ou V2026, défaut: V2026)
     * @param user l'utilisateur qui effectue la demande
     */
    @Post("/recalculate")
    async recalculate(
        @Body() body: { fromYear?: number; toYear?: number; algorithm?: string },
        @CurrentUser() user: User
    ) {
        if (!user.is("admin")) {
            throw new Error("Accès refusé - Admin uniquement");
        }
        const fromYear = body?.fromYear ?? 2006;
        const toYear = body?.toYear ?? new Date().getFullYear();
        const algo: AgpaAlgorithmVersion = body?.algorithm === "V2010" ? "V2010" : "V2026";
        return agpaService.recalculateAllEditions(fromYear, toYear, algo);
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
