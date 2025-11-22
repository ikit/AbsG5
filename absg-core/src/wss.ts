import * as WebSocket from "ws";
import { logger } from "./middleware/logger";

const port = parseInt(process.env.WS_PORT || "5012", 10);
const wss = new WebSocket.Server({ port });

wss.on("connection", () => {
    logger.info(`Websocket has started on port ${process.env.WS_PORT}.`);
});

export default wss;
