import * as WebSocket from "ws";
import { logger } from "./middleware/logger";

let wss = null;

export function initWS() {
    const port = process.env.WS_PORT;
    wss = new WebSocket.Server({ port });
    wss.on("connection", () => {
        logger.info("WS client connection established");
    });

    logger.info(`WS Server has started on port ${port}.`);
}

export default wss;
