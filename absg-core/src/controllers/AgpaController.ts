import { getRepository } from "typeorm";
import { JsonController, Param, Body, Get, Post, Delete, NotFoundError } from "routing-controllers";
import { AgpaPhoto, AgpaAward } from "../entities";
import { agpaService } from "../services/AgpaService";

@JsonController('/agpa')
export class AgpaController {

    private photosRepo = getRepository(AgpaPhoto);

    @Get('')
    welcome() {
        return agpaService.welcom();
    }

    @Get('/rules')
    rules() {
        return { current: "Réglement actuel", timestamp: new Date() };
    }

    @Get('/ceremony/:year')
    async getCeremony(@Param("year") year: number) {
        const rawData = await this.photosRepo.query(`SELECT * FROM agpa_photo LIMIT 2`);
        return { categories: [], photos: rawData, awards: [], stats: {} };
    }

    @Get('/archives')
    archives() {
        return agpaService.archivesSummary();
    }

    @Get('/archives/:year')
    getYear(@Param("year") year: number) {
        return { categories: [], users: [], awards: [], stats: {} };
    }

    @Get('/archives/:year/files')
    getArchivesFile(@Param("year") year: number) {
        return "zip download from cloud";
    }

    @Get('/archives/:year/category/:cat')
    getCategory(@Param("year") year: number, @Param("cat") cat: number) {
        return { photos: [], stats: {} };
    }

    @Get('/archives/:year/author/:userId')
    getYearAuthor(@Param("year") year: number, @Param("userId") userId: number) {
        return { categories: [], stats: {} };
    }

    @Get('/photo/:photoId')
    getPhoto(@Param("photoId") photoId: number) {
        return { };
    }

    @Get('/stats')
    getStats() {
        return { };
    }

    @Post('/stats')
    getFilteredStats(@Body() filters: any) {
        return { statsFilters: filters };
    }

    @Get('/palmares')
    getPalmares() {
        return { };
    }

    @Post('/palmares')
    getFilteredPalmares(@Body() filters: any) {
        return { palmaresFilters: filters };
    }


    @Delete('/:photoId')
    async remove(@Param("photoId") photoId: number) {

        return "this.citationsRepo.remove(citation)";
    }
}
