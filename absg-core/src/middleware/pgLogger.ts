import * as Transport from "winston-transport";
import { getRepository } from "typeorm";
import { LogSystem, LogSeverity } from "../entities";
import { websocketService } from "../services";

export class PgLogger extends Transport {
    constructor(opts) {
        super(opts);
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
                websocketService.broadcast({
                    message: "notification",
                    payload: log
                });
            }
        }
        callback();
    }
}
