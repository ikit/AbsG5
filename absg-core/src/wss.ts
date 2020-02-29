import * as WebSocket from "ws";
import { logger } from "./middleware/logger";

const wss = new WebSocket.Server({ port: 5011 });

export function initWS() {
    const port = process.env.WS_PORT;
    console.log("\u001b[31m\nTODO: fix process.env.WS_PORT\u001b[39m", process.env.WS_PORT);

    wss.on("connection", () => {
        logger.info("WS client connection established");
    });

    logger.info(`WS Server has started on port ${port}.`);
}

export default wss;
