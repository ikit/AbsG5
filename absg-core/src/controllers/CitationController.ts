import { JsonController, Param, Body, Get, Post, Delete, Authorized, Req, CurrentUser } from "routing-controllers";
import { Request } from "express";
import { Citation, User } from "../entities";
import { citationService } from "../services";

@Authorized()
@JsonController("/citations")
export class CitationController {
    @Get("")
    async getRandom() {
        return await citationService.random();
    }

    @Get("/list")
    async list(@QueryParam("authorId") authorId: number = null) {
        return await citationService.getCitations(authorId);
    }

    @Get("/author/:id([0-9]+)")
    async getByAuthor(@Param("id") id: number) {
        return await citationService.fromAuthor(id);
    }

    @Post("/")
    async save(@Req() request: Request, @Body() citation: Citation, @CurrentUser() user: User) {
        return await citationService.save(user, citation);
    }

    @Delete("/:id")
    async remove(@Req() request: Request, @Param("id") id: number, @CurrentUser() user: User) {
        return await citationService.remove(user, id);
    }
}
