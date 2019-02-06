import { getRepository } from "typeorm";
import { JsonController, Param, Body, Get, Post, Delete, NotFoundError } from "routing-controllers";
import { Citation } from "../entities";

@JsonController('/citations')
export class CitationController {

    private citationsRepo = getRepository(Citation);

    @Get('')
    all() {
        return this.citationsRepo.find();
    }

    @Get('/:id')
    one(@Param("id") id: number) {
        return this.citationsRepo.findOne(id);
    }

    @Post('/')
    save(@Body() citation: Citation) {
        return this.citationsRepo.save(citation);
    }

    @Delete('/:id')
    async remove(@Param("id") id: number) {
        let citation = await this.citationsRepo.findOne(id);
        if (!citation) {
            throw new NotFoundError(`Citations was not found.`);
        }
        return this.citationsRepo.remove(citation);
    }

}