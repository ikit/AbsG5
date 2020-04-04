import { JsonController, Param, Body, Get, Post, Delete, Authorized, QueryParam, Req } from "routing-controllers";
import { Request } from "express";
import { Citation } from "../entities";
import { citationService } from "../services";
import { getUserFromHeader } from "../middleware";

@Authorized()
@JsonController("/citations")
export class CitationController {
    @Get("")
    async getRandom() {
        return await citationService.random();
    }

    @Get("/init")
    async initData() {
        return await citationService.getInitData();
    }

    @Get("/list")
    async list(
        @QueryParam("pageIndex") pageIndex: number,
        @QueryParam("pageSize") pageSize: number,
        @QueryParam("authorId") authorId: number = null
    ) {
        return await citationService.getCitations(pageIndex, pageSize, authorId);
    }

    @Get("/:id([0-9]+)")
    async getById(@Param("id") id: number) {
        return await citationService.fromId(id);
    }

    @Get("/author/:id([0-9]+)")
    async getByAuthor(@Param("id") id: number) {
        return await citationService.fromAuthor(id);
    }

    @Post("/")
    async save(@Req() request: Request, @Body() citation: Citation) {
        const user = await getUserFromHeader(request);
        return await citationService.save(user, citation);
    }

    @Delete("/:id")
    async remove(@Req() request: Request, @Param("id") id: number) {
        const user = await getUserFromHeader(request);
        return await citationService.remove(user, id);
    }
}
