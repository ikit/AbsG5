import wss from "../wss";
import { logger } from "../middleware/logger";
import { BadRequestError } from "routing-controllers";

export interface WSMessage {
    message: string;
    payload: any;
}

export class WebsocketService {
    getClients() {
        console.log(wss.clients);

        return []; //wss ? wss.clients : [];
    }

    private send(client, message: WSMessage) {
        const data = JSON.stringify(message);
        logger.info(data);
        client.send(data);
    }

    sendTo(id: string, message: WSMessage) {
        const client = this.getClients().find(client => client.id === id);
        if (!client) {
            throw new BadRequestError(`Client ID not found`);
        }
        this.send(client, message);
    }

    broadcast(message: WSMessage) {
        this.getClients().forEach(client => {
            this.send(client, message);
        });
    }
}

export const websocketService = new WebsocketService();
