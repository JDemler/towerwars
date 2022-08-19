import { FieldEvent } from '../FieldEvent';

const getWebsocketUrl = () => {
    const webSocketUrl = process.env.REACT_APP_WS_URL; // `ws://localhost:8080/`;

    if (webSocketUrl === undefined)
        throw new Error("WebSocket URL is not defined");

    return webSocketUrl;
}

export default class WebSocketClient {
    webSocket: WebSocket;

    constructor() {
        this.webSocket = this.connect();
    }

    connect(): WebSocket {
        this.webSocket = new WebSocket(getWebsocketUrl());

        return this.webSocket;
    }

    disconnect() {
        this.webSocket?.close();
    }

    dispatchFieldEvent(fieldEvent: FieldEvent) {
        if (this.webSocket.readyState !== WebSocket.OPEN) {
            return console.error('WebSocket not open');
        }

        
        console.log("->", fieldEvent.eventType, fieldEvent)

        this.webSocket.send(JSON.stringify(fieldEvent));
    }
}