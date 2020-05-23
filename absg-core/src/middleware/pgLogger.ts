import * as Transport from "winston-transport";
import { getRepository } from "typeorm";
import { LogSystem, LogSeverity } from "../entities";
import { WebsocketService } from "../services/WebsocketService";

export class PgLogger extends Transport {
    wsService = null;

    constructor(opts) {
        super(opts);

        this.wsService = new WebsocketService();
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit("logged", info);
        });
        if (info.level != "debug") {
            // On enregistre l'entrée en base de donnée
            const logRepo = getRepository(LogSystem);
            const log = new LogSystem();
            log.message = info.message;
            log.datetime = info.timestamp;
            log.severity = info.level;
            if (Object.keys(info.metadata).length !== 0) {
                log.module = info.metadata.module ? info.metadata.module : "absg";
                log.userId = info.metadata.userId ? info.metadata.userId : null;
                delete info.metadata.module;
                delete info.metadata.userId;
                log.data = info.metadata;
            }

            logRepo.save(log);

            if (info.level === LogSeverity.notice) {
                this.wsService.broadcast({
                    message: "notification",
                    payload: log
                });
            }
        }
        callback();
    }
}
