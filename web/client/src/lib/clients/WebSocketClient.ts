import { FieldEvent } from '../FieldEvent';

export default class WebSocketClient {
    webSocket: WebSocket;

    constructor() {
        this.webSocket = this.connect();
    }

    connect(): WebSocket {
        this.webSocket = new WebSocket('ws://localhost:8080/ws');

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