import GameState from "../../models/GameState";
import { isAbsoluteUrl } from '../helpers';
import { AddedPlayerModel } from '../../models';

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

    // Function that adds the player to the game
    static joinGame = async (playerName: string) => {
        const response = await fetch(getApiUrl('add_player'));
        const responseJson = await response.json();

        return AddedPlayerModel.fromJSON(responseJson);
    }
}