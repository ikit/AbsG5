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

    @Get('/archives')
    archives() {
        return agpaService.archivesSummary();
    }

    @Get('/archives/:year')
    getYear(@Param("year") year: number) {
        return agpaService.archiveEditionSummary(year);
    }

    @Get('/archives/:year/files')
    getArchivesFile(@Param("year") year: number) {
        // TODO
        return "zip download from cloud";
    }
    
    @Get('/ceremony/:year')
    async getCeremony(@Param("year") year: number) {
        // TODO
        const rawData = await this.photosRepo.query(`SELECT * FROM agpa_photo LIMIT 2`);
        return { categories: [], photos: rawData, awards: [], stats: {} };
    }
    

    @Get('/stats')
    getStats() {
        // TODO
        return { };
    }

    @Get('/palmares')
    getPalmares() {
        // TODO
        return { };
    }


    @Delete('/:photoId')
    async remove(@Param("photoId") photoId: number) {

        return "this.citationsRepo.remove(citation)";
    }
}
