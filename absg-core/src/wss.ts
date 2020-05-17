import * as WebSocket from "ws";
import { logger } from "./middleware/logger";

const port = process.env.WS_PORT;
const wss = new WebSocket.Server({ port });

wss.on("connection", () => {
    logger.info("WS client connection established");
});

//logger.info(`WS Server has started on port ${port}.`);

export default wss;
