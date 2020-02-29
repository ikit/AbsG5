import { JsonController, Param, Body, Get, Post, Delete, Authorized, QueryParam, Req } from "routing-controllers";
import { Request } from "express";
import { Citation } from "../entities";
import { citationService } from "../services";
import { getUserFromHeader } from "../middleware";

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
    async save(@Req() request: Request, @Body() citation: Citation) {
        const user = await getUserFromHeader(request);
        return await citationService.save(user, citation);
    }

    @Authorized()
    @Delete("/:id")
    async remove(@Req() request: Request, @Param("id") id: number) {
        const user = await getUserFromHeader(request);
        return await citationService.remove(user, id);
    }
}
