import * as WebSocket from "ws";
import { logger } from "./middleware/logger";

const port = process.env.WS_PORT;
const wss = new WebSocket.Server({ port });

wss.on("connection", () => {
    logger.debug("WS client connection established");
});

export default wss;
