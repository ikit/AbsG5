import { JsonController, Param, Body, Get, Post, Delete, NotFoundError } from "routing-controllers";
import { Citation } from "../entities";
import { citationService } from "../services";
import { success, issue } from "../middleware/jsonHelper";

@JsonController('/citations')
export class CitationController {

    @Get('')
    async getRandom() {
        try {
            return success(await citationService.random());
        } catch (ex) {
            return issue('Impossible de récupérer une citation aléatoirement', ex);
        }
    }

    @Get('/init')
    async initData() {
        try {
            return success(await citationService.getInitData());
        } catch (ex) {
            return issue('Impossible de récupérer les données d\'initialisation de la section citation', ex);
        }
    }

    @Get('/:id')
    async getById(@Param("id") id: number) {
        try {
            return success(await citationService.fromId(id));
        } catch (ex) {
            return issue('Impossible de récupérer la citation demandé', ex);
        }
    }

    @Get('/author/:id')
    async getByAuthor(@Param("id") id: number) {
        try {
            return success(await citationService.fromAuthor(id));
        } catch (ex) {
            return issue('Impossible de récupérer les citations de l\'auteur demandé', ex);
        }
    }

    @Post('/')
    async get(@Body() filteringData: any) {
        try {
            return success(await citationService.getCitations(filteringData.pageIndex, filteringData.pageSize, filteringData.authorId));
        } catch (ex) {
            return issue('Impossible de récupérer les citations demandées', ex);
        }
    }

    @Post('/')
    async save(@Body() citation: Citation) {
        try {
            return success(await citationService.save(citation));
        } catch (ex) {
            return issue('Impossible de sauvegarder la citation', ex);
        }
    }

    @Delete('/:id')
    async remove(@Param("id") id: number) {
        try {
            return success(await citationService.remove(id));
        } catch (ex) {
            return issue('Impossible de supprimer la citation', ex);
        }
    }
}
