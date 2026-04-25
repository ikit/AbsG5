import { logger } from "../middleware/logger";
import { BadRequestError } from "routing-controllers";

const PCLOUD_API_BASE = "https://eapi.pcloud.com";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "heic", "webp", "gif", "bmp", "tiff", "tif"]);

export interface PCloudPhotoEntry {
    fileid: number;
    name: string;
    date: string | null;
    dateStr: string | null;
    yearMonth: string | null;
    size: number;
}

export interface PCloudFolderNode {
    folderid: number;
    name: string;
    path: string;
    children: PCloudFolderNode[];
}

class PCloudService {
    private accessToken: string = "";
    private unsortedFolderId: number = 0;
    private sortedFolderId: number = 0;

    private unsortedCache: PCloudPhotoEntry[] | null = null;
    private unsortedCacheTime: number = 0;
    private sortedCache: PCloudFolderNode[] | null = null;
    private sortedCacheTime: number = 0;
    private thumbCache = new Map<number, { url: string; expiry: number }>();

    private readonly CACHE_TTL = 5 * 60 * 1000;
    private readonly THUMB_TTL = 3 * 60 * 60 * 1000;

    public initService() {
        this.accessToken = process.env.PCLOUD_ACCESS_TOKEN || "";
        this.unsortedFolderId = parseInt(process.env.PCLOUD_UNSORTED_FOLDER_ID || "0", 10);
        this.sortedFolderId = parseInt(process.env.PCLOUD_SORTED_FOLDER_ID || "0", 10);

        if (this.accessToken) {
            logger.info("PCloudService initialized (Europe API)");
        } else {
            logger.warning("PCloudService: PCLOUD_ACCESS_TOKEN not set, service disabled");
        }
    }

    private async pcloudRequest(method: string, params: Record<string, any> = {}): Promise<any> {
        if (!this.accessToken) {
            throw new BadRequestError("pCloud service is not configured");
        }

        const searchParams = new URLSearchParams();
        searchParams.set("auth", this.accessToken);
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        }

        const url = `${PCLOUD_API_BASE}/${method}?${searchParams.toString()}`;
        const response = await fetch(url);
        const data: any = await response.json();

        if (data.result !== 0) {
            logger.error(`pCloud API error: ${method} -> code ${data.result}: ${data.error}`);
            throw new BadRequestError(`pCloud error: ${data.error || `code ${data.result}`}`);
        }

        return data;
    }

    private parseDateFromFilename(filename: string): { date: string; dateStr: string; yearMonth: string } | null {
        const match = filename.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2})\.(\d{2})\.(\d{2})/);
        if (!match) return null;

        const [, year, month, day, hour, min, sec] = match;
        return {
            date: `${year}-${month}-${day}T${hour}:${min}:${sec}`,
            dateStr: `${year}-${month}-${day} ${hour}:${min}`,
            yearMonth: `${year}-${month}`
        };
    }

    private isImageFile(filename: string): boolean {
        const ext = filename.split(".").pop()?.toLowerCase() || "";
        return IMAGE_EXTENSIONS.has(ext);
    }

    private buildFolderTree(contents: any[], parentPath: string): PCloudFolderNode[] {
        const nodes: PCloudFolderNode[] = [];

        for (const item of contents) {
            if (item.isfolder) {
                const path = `${parentPath}/${item.name}`;
                const children = item.contents ? this.buildFolderTree(item.contents, path) : [];
                nodes.push({
                    folderid: item.folderid,
                    name: item.name,
                    path,
                    children
                });
            }
        }

        return nodes.sort((a, b) => a.name.localeCompare(b.name));
    }

    public async getUnsortedPhotos(refresh = false): Promise<PCloudPhotoEntry[]> {
        if (!refresh && this.unsortedCache && (Date.now() - this.unsortedCacheTime < this.CACHE_TTL)) {
            return this.unsortedCache;
        }

        const data = await this.pcloudRequest("listfolder", {
            folderid: this.unsortedFolderId,
            recursive: 0,
            showdeleted: 0,
            nofiles: 0,
            noshares: 1
        });

        const contents = data.metadata?.contents || [];
        const photos: PCloudPhotoEntry[] = [];

        for (const file of contents) {
            if (file.isfolder || !this.isImageFile(file.name)) continue;

            const parsed = this.parseDateFromFilename(file.name);
            photos.push({
                fileid: file.fileid,
                name: file.name,
                date: parsed?.date || null,
                dateStr: parsed?.dateStr || null,
                yearMonth: parsed?.yearMonth || null,
                size: file.size || 0
            });
        }

        photos.sort((a, b) => {
            if (!a.date && !b.date) return a.name.localeCompare(b.name);
            if (!a.date) return 1;
            if (!b.date) return -1;
            return a.date.localeCompare(b.date);
        });

        this.unsortedCache = photos;
        this.unsortedCacheTime = Date.now();
        logger.info(`PCloud: loaded ${photos.length} unsorted photos`);

        return photos;
    }

    public async getThumbnailBatch(fileids: number[], size = "256x256"): Promise<Record<number, string>> {
        const result: Record<number, string> = {};
        const toFetch: number[] = [];
        const now = Date.now();

        for (const id of fileids) {
            const cached = this.thumbCache.get(id);
            if (cached && cached.expiry > now) {
                result[id] = cached.url;
            } else {
                toFetch.push(id);
            }
        }

        const promises = toFetch.map(async (fileid) => {
            try {
                const data = await this.pcloudRequest("getthumblink", {
                    fileid,
                    size
                });
                const url = `https://${data.hosts[0]}${data.path}`;
                this.thumbCache.set(fileid, { url, expiry: now + this.THUMB_TTL });
                result[fileid] = url;
            } catch (err) {
                logger.warning(`PCloud: failed to get thumbnail for ${fileid}`);
            }
        });

        await Promise.all(promises);
        return result;
    }

    public async getFileLink(fileid: number): Promise<string> {
        const data = await this.pcloudRequest("getfilelink", { fileid });
        return `https://${data.hosts[0]}${data.path}`;
    }

    public async getSortedFolderTree(refresh = false): Promise<PCloudFolderNode[]> {
        if (!refresh && this.sortedCache && (Date.now() - this.sortedCacheTime < this.CACHE_TTL)) {
            return this.sortedCache;
        }

        const data = await this.pcloudRequest("listfolder", {
            folderid: this.sortedFolderId,
            recursive: 1,
            showdeleted: 0,
            nofiles: 1,
            noshares: 1
        });

        const contents = data.metadata?.contents || [];
        const tree = this.buildFolderTree(contents, "");

        this.sortedCache = tree;
        this.sortedCacheTime = Date.now();
        logger.info(`PCloud: loaded sorted folder tree`);

        return tree;
    }

    public async createFolder(parentFolderId: number, name: string): Promise<PCloudFolderNode> {
        if (!name || !name.trim()) {
            throw new BadRequestError("Folder name is required");
        }

        const data = await this.pcloudRequest("createfolder", {
            folderid: parentFolderId,
            name: name.trim()
        });

        this.sortedCache = null;

        return {
            folderid: data.metadata.folderid,
            name: data.metadata.name,
            path: data.metadata.path || `/${data.metadata.name}`,
            children: []
        };
    }

    public async movePhotos(fileids: number[], toFolderId: number): Promise<{ moved: number; errors: string[] }> {
        if (!fileids.length) {
            throw new BadRequestError("No files to move");
        }

        let moved = 0;
        const errors: string[] = [];

        for (const fileid of fileids) {
            try {
                await this.pcloudRequest("renamefile", {
                    fileid,
                    tofolderid: toFolderId
                });
                moved++;
            } catch (err: any) {
                errors.push(`File ${fileid}: ${err.message || "unknown error"}`);
            }
        }

        if (moved > 0) {
            this.unsortedCache = null;
        }

        logger.info(`PCloud: moved ${moved}/${fileids.length} photos (${errors.length} errors)`);
        return { moved, errors };
    }

    public invalidateAllCaches(): void {
        this.unsortedCache = null;
        this.sortedCache = null;
        this.thumbCache.clear();
        logger.info("PCloud: all caches invalidated");
    }
}

export const pcloudService = new PCloudService();
