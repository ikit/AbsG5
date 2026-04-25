import {
    JsonController,
    Param,
    Body,
    Get,
    Post,
    Authorized,
    CurrentUser,
    QueryParam
} from "routing-controllers";
import { User } from "../entities";
import { pcloudService } from "../services";

@Authorized()
@JsonController("/pcloud")
export class PCloudController {
    @Get("/unsorted")
    async getUnsortedPhotos(
        @CurrentUser() user: User,
        @QueryParam("refresh") refresh?: boolean
    ) {
        if (!user.is("archivist")) return null;
        return await pcloudService.getUnsortedPhotos(refresh);
    }

    @Post("/thumbnails")
    async getThumbnails(
        @Body() body: { fileids: number[]; size?: string },
        @CurrentUser() user: User
    ) {
        if (!user.is("archivist")) return null;
        return await pcloudService.getThumbnailBatch(body.fileids, body.size);
    }

    @Get("/file/:fileid")
    async getFileLink(
        @Param("fileid") fileid: number,
        @CurrentUser() user: User
    ) {
        if (!user.is("archivist")) return null;
        return { url: await pcloudService.getFileLink(fileid) };
    }

    @Get("/sorted-folders")
    async getSortedFolders(@CurrentUser() user: User) {
        if (!user.is("archivist")) return null;
        return await pcloudService.getSortedFolderTree();
    }

    @Post("/sorted-folders")
    async createFolder(
        @Body() body: { parentFolderId: number; name: string },
        @CurrentUser() user: User
    ) {
        if (!user.is("archivist")) return null;
        return await pcloudService.createFolder(body.parentFolderId, body.name);
    }

    @Post("/move")
    async movePhotos(
        @Body() body: { fileids: number[]; toFolderId: number },
        @CurrentUser() user: User
    ) {
        if (!user.is("archivist")) return null;
        return await pcloudService.movePhotos(body.fileids, body.toFolderId);
    }

    @Get("/refresh")
    async refreshCache(@CurrentUser() user: User) {
        if (!user.is("archivist")) return null;
        pcloudService.invalidateAllCaches();
        return { success: true };
    }
}
