import GameState from "../ui/models/GameState";
import { FieldEvent } from './FieldEvent';

const ServerURL = "127.0.0.1:8080";

// Fuction that fetches the /game endpoint and returns the game state
export const getGameState: () => Promise<GameState> = async () => {
    const response = await fetch(`http://${ServerURL}/game`);
    const responseJson = await response.json();

    return GameState.fromJSON(responseJson);
}

// Function that adds the player to the game
export const joinGame: () => Promise<number> = async () => {
    const response = await fetch(`http://${ServerURL}/add_player`);
    const responseJson = await response.text();

    return Number.parseInt(responseJson);
}

// Fuction that pushes the payload with an event type for a specific fieldId to the /register_event endpoint
export const registerEvent: (fieldEvent: FieldEvent) => Promise<void> = async (fieldEvent) => {
    await fetch(`http://${ServerURL}/register_event`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(fieldEvent)
    });
}