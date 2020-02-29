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

    sendTo(id: string, message: WSMessage) {
        const client = this.getClients().find(client => client.id === id);
        if (!client) {
            throw new Error(`Client ID not found`);
        }
        this.send(client, message);
    }

    broadcast(message: WSMessage) {
        this.getClients().forEach(client => {
            this.send(client, message);
        });
    }
}
