import { ServerStatusModel } from "@models";
import { GameState, AddedPlayerModel, TowerTypeModel, MobTypeModel, SocialMediaNetworkModel } from "@models";
import { isAbsoluteUrl } from '@helpers';

const getApiRoot = () => {
    let url = window._env_.REACT_APP_API_URL;

    if (url === undefined)
        throw new Error("API URL is not defined");

    if (!isAbsoluteUrl(url))
        url = `${window.location.protocol}//${window.location.host}${url}`;

    return url;
}
const getApiUrl = (path: string, gameId?: string, fieldId?: number) => {
    console.log("getApiUrl", path, gameId, fieldId);
    let url = `${getApiRoot()}${path}`;
    if (gameId) {
        url += `?gameId=${gameId}`;
    }
    if (fieldId !== undefined) {
        url += `&fieldId=${fieldId}`;
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
    static getServerStatus = async () => {
        const response = await fetch(getApiUrl("status"));
        const responseJson = await response.json();
        return ServerStatusModel.fromJSON(responseJson);
    }


    // Function that fetches the social media network types
    static getSocialMediaNetworks = async () => {
        const response = await fetch(getApiUrl('social_networks'));
        const responseJson = await response.json() as any[];

        return responseJson.map((socialMediaNetwork: any) => SocialMediaNetworkModel.fromJSON(socialMediaNetwork));
    }

    // Function that fetches the tower types
    static getTowerTypes = async (gameId: string, fieldId: number) => {
        const response = await fetch(getApiUrl('tower_types', gameId, fieldId));
        const responseJson = await response.json() as any[];

        return responseJson.map((towerType: any) => TowerTypeModel.fromJSON(towerType));
    }

    // Function that fetches the tower types
    static getMobTypes = async (gameId: string, fieldId: number) => {
        const response = await fetch(getApiUrl('mob_types', gameId, fieldId));
        const responseJson = await response.json() as any[];

        return responseJson.map((mobType: any) => MobTypeModel.fromJSON(mobType));
    }

    // Function that adds the player to the game
    static joinGame = async (playerName: string, socialMediaNetwork: string) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },            
            body: JSON.stringify({ name: playerName, race: socialMediaNetwork })
        }
        const response = await fetch(getApiUrl('add_player'), requestOptions)
        const responseJson = await response.json();

        return AddedPlayerModel.fromJSON(responseJson);
    }

    static addAgent = async (gameId: string) => {
        const response = await fetch(getApiUrl('add_agent', gameId));
        const responseJson = await response.json();

        return responseJson;
    }

    static startGame = async (gameId: string) => {        
        const response = await fetch(getApiUrl('start_game', gameId));
        const responseJson = await response.json();

        return responseJson;
    }
}