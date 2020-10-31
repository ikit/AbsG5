import wss from "../wss";

export enum WSMessageType {
    notification = "notification",
    pinnedTopicsChanged = "pinnedTopicsChanged",
    onlineUsers = "onlineUsers"
}

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
        client.send(data);
    }

    broadcast(message: WSMessage) {
        this.getClients().forEach(client => {
            this.send(client, message);
        });
    }
}

export const websocketService = new WebsocketService();
