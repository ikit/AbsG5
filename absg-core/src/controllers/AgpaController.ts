import { getRepository } from "typeorm";
import { JsonController, Param, Body, Get, Post, Delete, NotFoundError, Authorized } from "routing-controllers";
import { AgpaPhoto, AgpaAward } from "../entities";
import { agpaService } from "../services/AgpaService";
import { getMetaData } from "../middleware/agpaCommonHelpers";

@JsonController("/agpa")
export class AgpaController {
    private photosRepo = getRepository(AgpaPhoto);

    @Authorized()
    @Get("")
    welcome() {
        return agpaService.welcom();
    }

    @Authorized()
    @Get("/metaData")
    getMeta() {
        return getMetaData();
    }

    @Authorized()
    @Get("/archives")
    archives() {
        return agpaService.getArchiveSummary();
    }

    @Authorized()
    @Get("/archives/:year([0-9]{4})")
    getEdition(@Param("year") year: number) {
        return agpaService.getArchiveEdition(year);
    }
    @Authorized()
    @Get("/archives/:year([0-9]{4})/:catId([0-9]{1,2})")
    getCategory(@Param("year") year: number, @Param("catId") catId: number) {
        return agpaService.getArchiveCategory(year, catId);
    }

    @Authorized()
    @Get("/archives/:year([0-9]{4})/files")
    getArchivesFile(@Param("year") year: number) {
        // TODO
        return "zip download from cloud";
    }

    @Get("/ceremony/:year([0-9]{4})")
    async getCeremony(@Param("year") year: number) {
        return agpaService.getCeremonyData(year);
    }

    @Authorized()
    @Get("/stats")
    getStats() {
        // TODO
        return {};
    }

    @Authorized()
    @Get("/palmares")
    getPalmares() {
        // TODO
        return {};
    }

    @Authorized()
    @Delete("/:photoId([0-9]+)")
    async remove(@Param("photoId") photoId: number) {
        return "this.citationsRepo.remove(citation)";
    }
}
