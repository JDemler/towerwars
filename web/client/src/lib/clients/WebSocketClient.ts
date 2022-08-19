import { FieldEvent } from '../FieldEvent';
import { isAbsoluteUrl } from '../helpers';

const getWebsocketUrl = () => {
    let webSocketUrl = process.env.REACT_APP_WS_URL; // `ws://localhost:8080/`;

    if (webSocketUrl === undefined)
        throw new Error("WebSocket URL is not defined");

    if (!isAbsoluteUrl(webSocketUrl))
        webSocketUrl = `ws://${window.location.host}${webSocketUrl}`;

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