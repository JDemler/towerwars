import { GameState, AddedPlayerModel, TowerTypeModel, MobTypeModel } from "@models";
import { isAbsoluteUrl } from '@helpers';

const getApiRoot = () => {
    let url = window._env_.REACT_APP_API_URL;

    if (url === undefined)
        throw new Error("API URL is not defined");

    if (!isAbsoluteUrl(url))
        url = `${window.location.protocol}//${window.location.host}${url}`;

    return url;
}
const getApiUrl = (path: string, gameId?: string) => {
    let url = `${getApiRoot()}${path}`;
    if (gameId) {
        url += `?gameId=${gameId}`;
    }
    return url;
}

export default class ApiClient {
    // Fuction that fetches the /game endpoint and returns the game state
    static getGameState = async (gameId: string) => {
        const response = await fetch(getApiUrl('game', gameId));
        const responseJson = await response.json();

        return GameState.fromJSON(responseJson);
    }

    // Function that fetches the tower types
    static getTowerTypes = async (gameId: string) => {
        const response = await fetch(getApiUrl('tower_types', gameId));
        const responseJson = await response.json() as any[];

        return responseJson.map((towerType: any) => TowerTypeModel.fromJSON(towerType));
    }

    // Function that fetches the tower types
    static getMobTypes = async (gameId: string) => {
        const response = await fetch(getApiUrl('mob_types', gameId));
        const responseJson = await response.json() as any[];

        return responseJson.map((mobType: any) => MobTypeModel.fromJSON(mobType));
    }

    // Function that adds the player to the game
    static joinGame = async (playerName: string) => {
        const response = await fetch(getApiUrl('add_player'));
        const responseJson = await response.json();

        return AddedPlayerModel.fromJSON(responseJson);
    }
}