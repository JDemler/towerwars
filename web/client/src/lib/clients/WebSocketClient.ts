import { FieldEvent } from '@lib/FieldEvent';
import { isAbsoluteUrl } from '@helpers';

const getWebsocketUrl = (gameId: string, playerKey: string) => {
    let webSocketUrl = import.meta.env.VITE_WS_URL;

    if (webSocketUrl === undefined)
        throw new Error("WebSocket URL is not defined");

    if (!isAbsoluteUrl(webSocketUrl))
        webSocketUrl = `ws://${window.location.host}${webSocketUrl}`;

    webSocketUrl += `?gameId=${gameId}&playerKey=${playerKey}`;

    console.log("WebSocket URL:", webSocketUrl);

    return webSocketUrl;
}

export default class WebSocketClient {
    webSocket: WebSocket;

    constructor(gameId: string, playerKey: string) {
        this.webSocket = this.connect(gameId, playerKey);
    }

    connect(gameId: string, playerKey: string): WebSocket {
        this.webSocket = new WebSocket(getWebsocketUrl(gameId, playerKey));

        return this.webSocket;
    }

    disconnect() {
        this.webSocket?.close();
    }

    dispatchFieldEvent(fieldEvent: FieldEvent) {
        if (this.webSocket.readyState !== WebSocket.OPEN) {
            return console.error('WebSocket not open');
        }

        this.webSocket.send(JSON.stringify(fieldEvent));
    }
}