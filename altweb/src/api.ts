import { Game } from './data/game';
import { MobType, TowerType } from './data/gameConfig';
import { AddedPlayer } from './data/player';

const api_url = import.meta.env.VITE_API_URL || 'http://localhost:8080/';
const ws_api_url = import.meta.env.VITE_WS_API_URL || 'ws://localhost:8080/';


// local api helper function
function api(path: string): string {
    // if api_url is absolute
    if (isAbsoluteUrl(api_url)) {
        return api_url + path;
    } else {
        return window.location.protocol + "//" + window.location.host + api_url + path;
    }
}

function ws_api(path: string): string {
    if (isAbsoluteUrl(ws_api_url)) {
        return ws_api_url + path;
    } else {
        return "ws://" + window.location.host + ws_api_url + path;
    }
}

// Thanks Niklas!
function isAbsoluteUrl(url: string): boolean {
    return /^(?:[a-z]+:)?\/\//i.test(url);
}

export async function getGame(): Promise<Game | undefined> {
    try {
        const response = await fetch(api('game'));

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
        const response = await fetch(api('register_event'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
        console.error(event);
    }
}

// connects to websocket
export async function connect(): Promise<WebSocket> {
    const ws = new WebSocket(ws_api('ws'));
    return ws;
}

export async function joinGame(name: string): Promise<AddedPlayer | undefined> {
    try {
        const response = await fetch(api('add_player'),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(name)
            }
        );

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = (await response.json()) as AddedPlayer;
        return result;
    } catch (error) {
        console.error(error);
    }
}

export async function getTowerTypes() {
    try {
        const response = await fetch(api('tower_types'));

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
        const response = await fetch(api('mob_types'));

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = (await response.json()) as MobType[];
        return result;
    } catch (error) {
        console.error(error);
    }
}