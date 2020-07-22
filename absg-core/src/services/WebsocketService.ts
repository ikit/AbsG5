import wss from "../wss";
import { logger } from "../middleware/logger";

export interface WSMessage {
    message: string;
    payload: any;
}

export class WebsocketService {
    getClients() {
        return wss ? wss.clients : [];
    }

    private send(client, message: WSMessage) {
        const data = JSON.stringify(message);
        logger.info(data);
        client.send(data);
    }

    broadcast(message: WSMessage) {
        this.getClients().forEach(client => {
            this.send(client, message);
        });
    }
}

export const websocketService = new WebsocketService();
