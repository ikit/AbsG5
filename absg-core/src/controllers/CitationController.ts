import { JsonController, Param, Body, Get, Post, Delete, Authorized, QueryParam } from "routing-controllers";
import { Citation } from "../entities";
import { citationService } from "../services";

@JsonController("/citations")
export class CitationController {
    @Authorized()
    @Get("")
    async getRandom() {
        return await citationService.random();
    }

    @Authorized()
    @Get("/init")
    async initData() {
        return await citationService.getInitData();
    }

    @Authorized()
    @Get("/list")
    async list(
        @QueryParam("pageIndex") pageIndex: number,
        @QueryParam("pageSize") pageSize: number,
        @QueryParam("authorId") authorId: number = null
    ) {
        return await citationService.getCitations(pageIndex, pageSize, authorId);
    }

    @Authorized()
    @Get("/:id([0-9]+)")
    async getById(@Param("id") id: number) {
        return await citationService.fromId(id);
    }

    @Authorized()
    @Get("/author/:id([0-9]+)")
    async getByAuthor(@Param("id") id: number) {
        return await citationService.fromAuthor(id);
    }

    @Authorized()
    @Post("/")
    async get(@Body() filteringData: any) {
        return await citationService.getCitations(
            filteringData.pageIndex,
            filteringData.pageSize,
            filteringData.authorId
        );
    }

    @Authorized()
    @Post("/")
    async save(@Body() citation: Citation) {
        return await citationService.save(citation);
    }

    @Authorized()
    @Delete("/:id")
    async remove(@Param("id") id: number) {
        return await citationService.remove(id);
    }
}
