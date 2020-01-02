import * as path from "path";
import * as morgan from "morgan";
import { format, createLogger, transports } from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, prettyPrint } = format;
const dir = path.join(__dirname, "../../..", "logs/api");
console.log(dir);
export const logger = createLogger({
    level: "debug",
    format: combine(timestamp(), prettyPrint()),
    transports: [new transports.Console({ format: format.simple() })]
});

// if (process.env.NODE_ENV === "production") {
//     logger.add(
//         new DailyRotateFile({
//         filename: `${dir}/error_%DATE%.log`,
//         datePattern: "YYYY-MM-DD",
//         zippedArchive: true,
//         maxSize: "20m",
//         maxFiles: "30d",
//         level: "error"
//         })
//     );
//     logger.add(
//         new DailyRotateFile({
//         filename: `${dir}/combined_%DATE%.log`,
//         datePattern: "YYYY-MM-DD",
//         zippedArchive: true,
//         maxSize: "20m",
//         maxFiles: "30d"
//         })
//     );
// }

export const stream = {
    write: message => {
        logger.info(message);
    }
};

export const errorLogHandler = () => (err, req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }
    const msg = `${req.ip} - ${req.method} ${req.originalUrl} - ${err.message} - ${err.status || 500}`;
    logger.error(msg);
    next();
};

export const accessLogHandler = () => {
    return morgan(":remote-addr - :method :url - :response-time ms - :status", { stream });
};
