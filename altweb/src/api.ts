import { Game } from './data/game';
import { MobType, TowerType } from './data/gameConfig';


export async function getGame(): Promise<Game | undefined> {
    try {
        const response = await fetch('http://localhost:8080/game');

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = (await response.json()) as Game;
        return result;
    } catch (error) {
        console.error(error);
    }
}

export async function registerEvent(event: FieldEvent) {
    try {
        const response = await fetch('http://localhost:8080/register_event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = (await response.json()) as Game;
        return result;
    } catch (error) {
        console.error(error);
    }
}

// connects to websocket
export async function connect(): Promise<WebSocket> {
    const ws = new WebSocket('ws://localhost:8080/ws');
    return ws;
}

export async function joinGame() {
    try {
        const response = await fetch('http://localhost:8080/add_player');

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = (await response.json()) as number;
        return result;
    } catch (error) {
        console.error(error);
    }
}

export async function getTowerTypes() {
    try {
        const response = await fetch('http://localhost:8080/tower_types');

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = (await response.json()) as TowerType[];
        return result;
    } catch (error) {
        console.error(error);
    }
}

export async function getMobTypes() {
    try {
        const response = await fetch('http://localhost:8080/mob_types');

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = (await response.json()) as MobType[];
        return result;
    } catch (error) {
        console.error(error);
    }
}