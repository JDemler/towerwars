import GameState from "../../models/GameState";
import { FieldEvent } from '../FieldEvent';
import { isAbsoluteUrl } from '../helpers';

// const ServerURL = "127.0.0.1:8080";
const getApiRoot = () => {
    let url = process.env.REACT_APP_API_URL;

    if (url === undefined)
        throw new Error("API URL is not defined");

    if (!isAbsoluteUrl(url))
        url = `${window.location.protocol}//${window.location.host}${url}`;

    return url;
} 
const getApiUrl = (path: string) => `${getApiRoot()}${path}`;

export default class ApiClient {
    // Fuction that fetches the /game endpoint and returns the game state
    static getGameState: () => Promise<GameState> = async () => {
        const response = await fetch(getApiUrl('game'));
        const responseJson = await response.json();

        return GameState.fromJSON(responseJson);
    }

    // Function that adds the player to the game
    static joinGame: () => Promise<number> = async () => {
        const response = await fetch(getApiUrl('add_player'));
        const responseJson = await response.text();

        return Number.parseInt(responseJson);
    }

    // Fuction that pushes the payload with an event type for a specific fieldId to the /register_event endpoint
    static registerEvent: (fieldEvent: FieldEvent) => Promise<void> = async (fieldEvent) => {
        await fetch(getApiUrl('register_event'), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fieldEvent)
        });
    }
}