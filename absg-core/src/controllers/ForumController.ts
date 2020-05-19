import {
    JsonController,
    Param,
    Get,
    Authorized,
    UploadedFile,
    Body,
    CurrentUser,
    Post,
    Delete
} from "routing-controllers";

import { forumService } from "../services";

@Authorized()
@JsonController("/forum")
export class ForumController {
    /**
     * Renvoie la liste des forums
     */
    @Get("/browse")
    getForums() {
        return forumService.getForums();
    }

    /**
     * Renvoie la liste des sujets d'un forum
     */
    @Get("/browse/:forumId")
    getTopics(@Param("forumId") forumId: number) {
        return forumService.getTopics(forumId);
    }

    /**
     * Renvoie la liste des messages d'une discussion
     */
    @Get("/read/:topicId/")
    getPosts(@Param("topicId") topicId: number) {
        return forumService.getPosts(topicId);
    }

    /**
     * Récupère les messages TBZ en fonction des paramètres année et mois fournis
     * @param year l'année
     * @param day  le mois de 1 à 12
     */
    @Get("/tbz/:year([0-9]{4})/:month([0-9]{1,2})")
    getTbz(@Param("year") year: number, @Param("month") month: number) {
        return forumService.getTbzPosts(year, month);
    }

    /**
     * Enregistre une pièce jointe sur le serveur
     * @param body les infos sur le message à poster
     * @param user l'utilisateur qui fait la demande
     * /!\ Note: je force l'usage du multipart/form-data avec @UploadedFile car
     *     sinon la limite en taille des body/json empeche de poster des messages avec image encodé
     */
    @Post("/post")
    savePost(@UploadedFile("image") image: any, @Body() body: any, @CurrentUser() user: any) {
        return forumService.savePost(body, user);
    }

    /**
     * Supprime un message du forum
     * @param id l'identifiant du message
     * @param user 
     */
    @Delete("/post/:id")
    deletePost(@Param("id") id: number, @CurrentUser() user: any) {
        return forumService.deletePost(id, user);
    }

    /**
     * Retourne la liste des sujets mis en avant
     */
    @Get("/pinnedTopics")
    pinnedTopics() {
        return forumService.pinnedTopics();
    }

    /**
     * Met en avant un sujet ou le retire
     * @param id l'identifiant du sujet
     */
    @Get("/topic/:id/switchPin")
    switchPin(@Param("id") id: number) {
        return forumService.switchPin(id);
    }

    /**
     * Enregistre une pièce jointe sur le serveur
     * @param file la pièce jointe
     * @param user l'utilisateur qui fait la demande
     */
    @Post("/uploadFile")
    saveFile(@UploadedFile("file") file: any, @CurrentUser() user: any) {
        return forumService.saveFile(file, user.id);
    }

    /**
     * Supprime une pièce jointe du serveur
     * @param fileURI 
     * @param user 
     */
    @Delete("/uploadFile/:fileURI")
    deleteFile(@Param("fileURI") fileURI: string, @CurrentUser() user: any) {
        return forumService.deleteFile(decodeURI(fileURI), user);
    }

    /**
     * Sauvegarde un message en cours d'édition pour l'utilisateur courrant
     * @param body 
     * @param user 
     */
    @Post("/draft")
    saveDraft(@Body() body: any, @CurrentUser() user: any) {
        return forumService.saveDraft(body, user.id);
    }

    /**
     * Récupère le brouillon en cours d'édition de l'utilisateur si il existe
     * @param user 
     */
    @Get("/draft")
    getDraft(@CurrentUser() user: any) {
        return forumService.getDraft(user.id);
    }
}
