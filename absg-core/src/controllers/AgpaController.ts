import { getRepository } from "typeorm";
import { JsonController, Param, Get, Delete, Authorized, CurrentUser } from "routing-controllers";
import { AgpaPhoto } from "../entities";
import { agpaService } from "../services/AgpaService";
import { getMetaData } from "../middleware/agpaCommonHelpers";

@Authorized()
@JsonController("/agpa")
export class AgpaController {
    private photosRepo = getRepository(AgpaPhoto);

    @Get("")
    welcome() {
        return getMetaData();
    }

    @Get("/archives")
    archives(@CurrentUser() user) {
        return agpaService.getArchiveSummary(user);
    }

    @Get("/archives/:year([0-9]{4})")
    getEdition(@Param("year") year: number, @CurrentUser() user) {
        return agpaService.getArchiveEdition(year, user);
    }

    @Get("/archives/:year([0-9]{4})/:catId([0-9]{1,2})")
    getCategory(@Param("year") year: number, @Param("catId") catId: number, @CurrentUser() user) {
        return agpaService.getArchiveCategory(year, catId, user);
    }

    @Get("/archives/:year([0-9]{4})/files")
    getArchivesFile(@Param("year") year: number) {
        // TODO
        return "zip download from cloud";
    }

    @Get("/ceremony/:year([0-9]{4})")
    async getCeremony(@Param("year") year: number) {
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

    @Delete("/:photoId([0-9]+)")
    async remove(@Param("photoId") photoId: number) {
        return "this.citationsRepo.remove(citation)";
    }
}
