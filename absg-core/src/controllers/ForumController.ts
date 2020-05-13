import { JsonController, Param, Get, Authorized } from "routing-controllers";

import { forumService } from "../services";

@Authorized()
@JsonController("/forum")
export class ForumController {

    /**
     * Récupère la liste des sujets à mettre en premier plan, avec les derniers messages pour chacun d'eux
     */
    @Get("/")
    initData() {
        return {};
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
    // @QueryParam("y") year: number


    // /**
    //  * Enregistre une nouvelle image du moment
    //  * @param image l'image
    //  * @param body d'autres informations sur l'image comme l'auteur et le titre
    //  */
    // @Post("/")
    // async save(@UploadedFile("image") image: any, @Body() body: any, @CurrentUser() session: any) {
    //     return immtService.save(image, body.title, session);
    // }

    // @Delete("/:year([0-9]{4})/:day([0-9]{1,3})")
    // remove(@Param("year") year: number, @Param("day") day: number) {
    //     return immtService.remove(year, day);
    // }
}
